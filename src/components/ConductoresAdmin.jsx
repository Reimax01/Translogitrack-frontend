"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useConductores } from "../hooks/useConductores"
import { useHistorialConductor } from "../hooks/useHistorialConductor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Plus,
  Edit,
  UserX,
  History,
  User,
  Calendar,
  FileText,
  Award,
  AlertTriangle,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react"

function ConductoresAdmin() {
  // Hooks para gestionar conductores e historial
  const {
    conductores,
    loading,
    error,
    totalPaginas,
    paginaActual,
    total,
    listarConductores,
    crearConductor,
    actualizarConductor,
    desactivarConductor,
    cambiarPagina,
    limpiarError,
    validarLicencia,
  } = useConductores()

  const {
    historial,
    loading: historialLoading,
    obtenerHistorial,
    agregarEvento,
    obtenerEstadisticas,
    limpiarHistorial,
  } = useHistorialConductor()

  // Estados locales del componente
  const [filtros, setFiltros] = useState({
    activo: undefined,
    tipo_licencia: "",
  })

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showHistorialDialog, setShowHistorialDialog] = useState(false)
  const [selectedConductor, setSelectedConductor] = useState(null)

  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre_completo: "",
    numero_licencia: "",
    fecha_vencimiento_licencia: "",
    activo: true,
  })

  const [editData, setEditData] = useState({
    nombre_completo: "",
    numero_licencia: "",
    fecha_vencimiento_licencia: "",
    activo: true,
  })

  const [eventoData, setEventoData] = useState({
    tipo_evento: "",
    descripcion: "",
    fecha_evento: "",
  })

  // Opciones para filtros y formularios
  const tiposEvento = [
    { value: "sanción", label: "Sanción", icon: AlertTriangle },
    { value: "premio", label: "Premio", icon: Award },
    { value: "incidente", label: "Incidente", icon: Zap },
  ]

  const tiposLicencia = [
    { value: "A", label: "Licencia A" },
    { value: "B", label: "Licencia B" },
    { value: "C", label: "Licencia C" },
  ]

  // Función para obtener badge del estado
  const getEstadoBadge = (activo) => {
    if (activo) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
    }
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
  }

  // Función para obtener badge del tipo de evento
  const getEventoBadge = (tipoEvento) => {
    const config = {
      sanción: { className: "bg-amber-100 text-amber-800", icon: AlertTriangle },
      premio: { className: "bg-blue-100 text-blue-800", icon: Award },
      incidente: { className: "bg-red-100 text-red-800", icon: Zap },
    }

    const { className, icon: Icon } = config[tipoEvento] || config.incidente

    return (
      <Badge className={`${className} hover:${className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {tipoEvento}
      </Badge>
    )
  }

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return ""
    try {
      return format(new Date(fecha), "dd/MM/yyyy", { locale: es })
    } catch (error) {
      return fecha
    }
  }

  // Función para verificar si la licencia está próxima a vencer
  const isLicenseExpiringSoon = (fechaVencimiento) => {
    const today = new Date()
    const expirationDate = new Date(fechaVencimiento)
    const diffTime = expirationDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  // Función para verificar si la licencia está vencida
  const isLicenseExpired = (fechaVencimiento) => {
    const today = new Date()
    const expirationDate = new Date(fechaVencimiento)
    return expirationDate < today
  }

  // Manejador para aplicar filtros
  const handleAplicarFiltros = async () => {
    limpiarError()
    await listarConductores({ page: 1, ...filtros })
  }

  // Manejador para limpiar filtros
  const handleLimpiarFiltros = async () => {
    setFiltros({
      activo: undefined,
      tipo_licencia: "",
    })
    limpiarError()
    await listarConductores({ page: 1 })
  }

  // Manejador para cambio de filtros
  const handleFiltroChange = (name, value) => {
    setFiltros((prev) => ({
      ...prev,
      [name]: value === "all" ? undefined : value,
    }))
  }

  // Manejador para crear conductor
  const handleCrearConductor = async () => {
    try {
      const result = await crearConductor(formData)
      if (result.success) {
        setShowCreateDialog(false)
        setFormData({
          nombre_completo: "",
          numero_licencia: "",
          fecha_vencimiento_licencia: "",
          activo: true,
        })
      }
    } catch (err) {
      console.error("Error al crear conductor:", err)
    }
  }

  // Manejador para editar conductor
  const handleEditarConductor = async () => {
    if (!selectedConductor) return

    try {
      const result = await actualizarConductor(selectedConductor.id_conductor, editData)
      if (result.success) {
        setShowEditDialog(false)
        setSelectedConductor(null)
        setEditData({
          nombre_completo: "",
          numero_licencia: "",
          fecha_vencimiento_licencia: "",
          activo: true,
        })
      }
    } catch (err) {
      console.error("Error al editar conductor:", err)
    }
  }

  // Manejador para desactivar conductor
  const handleDesactivarConductor = async (conductor) => {
    if (window.confirm(`¿Está seguro de que desea desactivar a ${conductor.nombre_completo}?`)) {
      await desactivarConductor(conductor.id_conductor)
    }
  }

  // Manejador para ver historial
  const handleVerHistorial = async (conductor) => {
    setSelectedConductor(conductor)
    setShowHistorialDialog(true)
    await obtenerHistorial(conductor.id_conductor)
  }

  // Manejador para abrir dialog de edición
  const handleOpenEditDialog = (conductor) => {
    setSelectedConductor(conductor)
    setEditData({
      nombre_completo: conductor.nombre_completo,
      numero_licencia: conductor.numero_licencia,
      fecha_vencimiento_licencia: conductor.fecha_vencimiento_licencia,
      activo: conductor.activo,
    })
    setShowEditDialog(true)
  }

  // Manejador para agregar evento al historial
  const handleAgregarEvento = async () => {
    if (!selectedConductor) return

    try {
      const result = await agregarEvento(selectedConductor.id_conductor, eventoData)
      if (result.success) {
        setEventoData({
          tipo_evento: "",
          descripcion: "",
          fecha_evento: "",
        })
      }
    } catch (err) {
      console.error("Error al agregar evento:", err)
    }
  }

  // Manejador para cambio de página
  const handlePageChange = async (nuevaPagina) => {
    await cambiarPagina(nuevaPagina, filtros)
  }

  // Función para obtener la fecha mínima (hoy)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  // Función para obtener la fecha máxima para eventos (hoy)
  const getMaxDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  // Obtener estadísticas del historial
  const estadisticas = obtenerEstadisticas()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Conductores</h1>
          <p className="text-sm text-gray-600">Administre los conductores de la flota de transporte</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Conductor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Conductor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_completo">
                  Nombre Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre_completo"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nombre_completo: e.target.value }))}
                  placeholder="Ej: Juan Carlos Pérez"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_licencia">
                  N° Licencia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numero_licencia"
                  name="numero_licencia"
                  value={formData.numero_licencia}
                  onChange={(e) => setFormData((prev) => ({ ...prev, numero_licencia: e.target.value.toUpperCase() }))}
                  placeholder="Ej: LIC-12345"
                  pattern="[A-Z0-9-]+"
                  required
                />
                <p className="text-xs text-gray-500">Solo letras, números y guiones</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_vencimiento_licencia">
                  Vencimiento Licencia <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha_vencimiento_licencia"
                  name="fecha_vencimiento_licencia"
                  type="date"
                  value={formData.fecha_vencimiento_licencia}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fecha_vencimiento_licencia: e.target.value }))}
                  min={getMinDate()}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
                />
                <Label htmlFor="activo">Activo</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCrearConductor} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Conductor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>Filtre los conductores por estado y tipo de licencia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={filtros.activo === undefined ? "all" : filtros.activo.toString()}
                onValueChange={(value) => handleFiltroChange("activo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Licencia</Label>
              <Select
                value={filtros.tipo_licencia}
                onValueChange={(value) => handleFiltroChange("tipo_licencia", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {tiposLicencia.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 md:col-span-2">
              <Button onClick={handleAplicarFiltros} disabled={loading}>
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={handleLimpiarFiltros} disabled={loading}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Conductores</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Activos</p>
                <p className="text-2xl font-bold text-green-900">{conductores.filter((c) => c.activo).length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Por Vencer</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {conductores.filter((c) => isLicenseExpiringSoon(c.fecha_vencimiento_licencia)).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-900">
                  {conductores.filter((c) => isLicenseExpired(c.fecha_vencimiento_licencia)).length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de paginación */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Mostrando {conductores.length} de {total} conductores
        </span>
        <span>
          Página {paginaActual} de {totalPaginas || 1}
        </span>
      </div>

      {/* Tabla de conductores */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-10" role="status" aria-label="Cargando conductores">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando conductores...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Nombre</th>
                    <th className="p-4 font-medium">Licencia</th>
                    <th className="p-4 font-medium">Vencimiento Licencia</th>
                    <th className="p-4 font-medium">Estado</th>
                    <th className="p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {conductores.map((conductor, index) => (
                    <tr
                      key={conductor.id_conductor}
                      className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="p-4 font-medium">{conductor.id_conductor}</td>
                      <td className="p-4">{conductor.nombre_completo}</td>
                      <td className="p-4 font-mono">{conductor.numero_licencia}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {formatearFecha(conductor.fecha_vencimiento_licencia)}
                          {isLicenseExpired(conductor.fecha_vencimiento_licencia) && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Vencida</Badge>
                          )}
                          {isLicenseExpiringSoon(conductor.fecha_vencimiento_licencia) && (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Por vencer</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">{getEstadoBadge(conductor.activo)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(conductor)}
                            aria-label={`Editar conductor ${conductor.nombre_completo}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {conductor.activo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDesactivarConductor(conductor)}
                              aria-label={`Desactivar conductor ${conductor.nombre_completo}`}
                            >
                              <UserX className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerHistorial(conductor)}
                            aria-label={`Ver historial de ${conductor.nombre_completo}`}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {!loading && totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => handlePageChange(paginaActual - 1)} disabled={paginaActual <= 1}>
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {paginaActual} de {totalPaginas}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(paginaActual + 1)}
            disabled={paginaActual >= totalPaginas}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Mensaje si no hay conductores */}
      {!loading && conductores.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay conductores</h3>
            <p className="text-gray-600">No se encontraron conductores que coincidan con los filtros aplicados.</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Conductor #{selectedConductor?.id_conductor}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_nombre_completo">
                Nombre Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_nombre_completo"
                value={editData.nombre_completo}
                onChange={(e) => setEditData((prev) => ({ ...prev, nombre_completo: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_numero_licencia">
                N° Licencia <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_numero_licencia"
                value={editData.numero_licencia}
                onChange={(e) => setEditData((prev) => ({ ...prev, numero_licencia: e.target.value.toUpperCase() }))}
                pattern="[A-Z0-9-]+"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_fecha_vencimiento_licencia">
                Vencimiento Licencia <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_fecha_vencimiento_licencia"
                type="date"
                value={editData.fecha_vencimiento_licencia}
                onChange={(e) => setEditData((prev) => ({ ...prev, fecha_vencimiento_licencia: e.target.value }))}
                min={getMinDate()}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_activo"
                checked={editData.activo}
                onCheckedChange={(checked) => setEditData((prev) => ({ ...prev, activo: checked }))}
              />
              <Label htmlFor="edit_activo">Activo</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditarConductor} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de historial */}
      <Dialog open={showHistorialDialog} onOpenChange={setShowHistorialDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de {selectedConductor?.nombre_completo}
            </DialogTitle>
          </DialogHeader>

          {/* Estadísticas del historial */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total Eventos</p>
                    <p className="text-lg font-bold">{estadisticas.total}</p>
                  </div>
                  <Activity className="h-5 w-5 text-gray-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600">Premios</p>
                    <p className="text-lg font-bold text-blue-900">{estadisticas.premios}</p>
                  </div>
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-amber-600">Sanciones</p>
                    <p className="text-lg font-bold text-amber-900">{estadisticas.sanciones}</p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-red-600">Incidentes</p>
                    <p className="text-lg font-bold text-red-900">{estadisticas.incidentes}</p>
                  </div>
                  <Zap className="h-5 w-5 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario para agregar evento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Agregar Nuevo Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_evento">
                    Tipo Evento <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={eventoData.tipo_evento}
                    onValueChange={(value) => setEventoData((prev) => ({ ...prev, tipo_evento: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo de evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposEvento.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          <div className="flex items-center gap-2">
                            <tipo.icon className="h-4 w-4" />
                            {tipo.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_evento">
                    Fecha <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fecha_evento"
                    type="date"
                    value={eventoData.fecha_evento}
                    onChange={(e) => setEventoData((prev) => ({ ...prev, fecha_evento: e.target.value }))}
                    max={getMaxDate()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">
                    Descripción <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="descripcion"
                    rows={3}
                    value={eventoData.descripcion}
                    onChange={(e) => setEventoData((prev) => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Describa el evento en detalle..."
                    required
                  />
                  <p className="text-xs text-gray-500">Mínimo 10 caracteres</p>
                </div>
                <Button onClick={handleAgregarEvento} disabled={historialLoading} className="w-full">
                  {historialLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Agregar Evento
                </Button>
              </CardContent>
            </Card>

            {/* Timeline de historial */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                {historialLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Cargando historial...</span>
                  </div>
                ) : historial.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {historial.map((evento, index) => {
                      const tipoConfig = tiposEvento.find((t) => t.value === evento.tipo_evento)
                      const Icon = tipoConfig?.icon || FileText

                      return (
                        <div key={evento.id_historial} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              {getEventoBadge(evento.tipo_evento)}
                              <span className="text-xs text-gray-500">{formatearFecha(evento.fecha_evento)}</span>
                            </div>
                            <p className="text-sm text-gray-700">{evento.descripcion}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Sin historial</h3>
                    <p className="text-sm text-gray-500">No hay eventos registrados para este conductor.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ConductoresAdmin

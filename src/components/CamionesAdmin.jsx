"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useCamiones } from "../hooks/useCamiones"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Edit, Trash2, RefreshCw, Truck, Wrench, CheckCircle, XCircle } from "lucide-react"

function CamionesAdmin() {
  // Hook para gestionar camiones
  const {
    camiones,
    loading,
    error,
    totalPaginas,
    paginaActual,
    total,
    listarCamiones,
    crearCamion,
    actualizarCamion,
    crearMantenimiento,
    desactivarCamion,
    cambiarPagina,
    limpiarError,
    recargarDatos,
    validarPlaca,
    validarCapacidad,
  } = useCamiones()

  // Estados locales del componente
  const [filtros, setFiltros] = useState({
    estado: "",
    activo: undefined,
  })

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showMantenimientoDialog, setShowMantenimientoDialog] = useState(false)
  const [selectedCamion, setSelectedCamion] = useState(null)

  // Estados para formularios
  const [formData, setFormData] = useState({
    placa: "",
    capacidad_kg: "",
    estado_operativo: "Disponible",
    km_actual: 0,
    activo: true,
  })

  const [editData, setEditData] = useState({
    placa: "",
    capacidad_kg: "",
    estado_operativo: "Disponible",
    km_actual: 0,
    activo: true,
  })

  const [mantenimientoData, setMantenimientoData] = useState({
    tipo: "",
    descripcion: "",
    fecha_inicio: "",
  })

  // Opciones para filtros y formularios
  const estadosOperativos = [
    { value: "Disponible", label: "Disponible", color: "bg-green-100 text-green-800" },
    { value: "En mantenimiento", label: "En Mantenimiento", color: "bg-yellow-100 text-yellow-800" },
    { value: "Asignado", label: "Asignado", color: "bg-blue-100 text-blue-800" },
  ]

  const tiposMantenimiento = [
    { value: "preventivo", label: "Preventivo" },
    { value: "correctivo", label: "Correctivo" },
  ]

  // Función para obtener badge del estado
  const getEstadoBadge = (estado) => {
    const estadoConfig = estadosOperativos.find((e) => e.value === estado) || estadosOperativos[0]
    return <Badge className={`${estadoConfig.color} hover:${estadoConfig.color}`}>{estadoConfig.label}</Badge>
  }

  // Función para obtener badge de activo/inactivo
  const getActivoBadge = (activo) => {
    if (activo) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
    }
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
  }

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A"
    try {
      return format(new Date(fecha), "dd/MM/yyyy", { locale: es })
    } catch (error) {
      return fecha
    }
  }

  // Manejador para aplicar filtros
  const handleAplicarFiltros = async () => {
    limpiarError()
    await listarCamiones({ page: 1, ...filtros })
  }

  // Manejador para limpiar filtros
  const handleLimpiarFiltros = async () => {
    setFiltros({
      estado: "",
      activo: undefined,
    })
    limpiarError()
    await listarCamiones({ page: 1 })
  }

  // Manejador para cambio de filtros
  const handleFiltroChange = (name, value) => {
    setFiltros((prev) => ({
      ...prev,
      [name]: value === "all" ? (name === "activo" ? undefined : "") : value,
    }))
  }

  // Manejador para crear camión
  const handleCrearCamion = async () => {
    try {
      const result = await crearCamion(formData)
      if (result.success) {
        setShowCreateDialog(false)
        setFormData({
          placa: "",
          capacidad_kg: "",
          estado_operativo: "Disponible",
          km_actual: 0,
          activo: true,
        })
      }
    } catch (err) {
      console.error("Error al crear camión:", err)
    }
  }

  // Manejador para editar camión
  const handleEditarCamion = async () => {
    if (!selectedCamion) return

    try {
      const result = await actualizarCamion(selectedCamion.id_camion, editData)
      if (result.success) {
        setShowEditDialog(false)
        setSelectedCamion(null)
        setEditData({
          placa: "",
          capacidad_kg: "",
          estado_operativo: "Disponible",
          km_actual: 0,
          activo: true,
        })
      }
    } catch (err) {
      console.error("Error al editar camión:", err)
    }
  }

  // Manejador para crear mantenimiento
  const handleCrearMantenimiento = async () => {
    if (!selectedCamion) return

    try {
      const result = await crearMantenimiento(selectedCamion.id_camion, mantenimientoData)
      if (result.success) {
        setShowMantenimientoDialog(false)
        setSelectedCamion(null)
        setMantenimientoData({
          tipo: "",
          descripcion: "",
          fecha_inicio: "",
        })
      }
    } catch (err) {
      console.error("Error al crear mantenimiento:", err)
    }
  }

  // Manejador para desactivar camión
  const handleDesactivarCamion = async (camion) => {
    if (window.confirm(`¿Está seguro de que desea desactivar el camión ${camion.placa}?`)) {
      await desactivarCamion(camion.id_camion)
    }
  }

  // Manejador para abrir dialog de edición
  const handleOpenEditDialog = (camion) => {
    setSelectedCamion(camion)
    setEditData({
      placa: camion.placa,
      capacidad_kg: camion.capacidad_kg || "",
      estado_operativo: camion.estado_operativo,
      km_actual: camion.km_actual || 0,
      activo: camion.activo,
    })
    setShowEditDialog(true)
  }

  // Manejador para abrir dialog de mantenimiento
  const handleOpenMantenimientoDialog = (camion) => {
    setSelectedCamion(camion)
    setShowMantenimientoDialog(true)
  }

  // Manejador para cambio de página
  const handlePageChange = async (nuevaPagina) => {
    await cambiarPagina(nuevaPagina, filtros)
  }

  // Función para obtener la fecha mínima (hoy)
  const getMinDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Camiones</h1>
          <p className="text-sm text-gray-600">Administre la flota de vehículos de transporte</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={recargarDatos} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recargar
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Camión
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Camión</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="placa">
                    Placa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="placa"
                    value={formData.placa}
                    onChange={(e) => setFormData((prev) => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                    placeholder="Ej: ABC-123"
                    pattern="[A-Z0-9-]+"
                    required
                  />
                  <p className="text-xs text-gray-500">Solo letras, números y guiones</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacidad_kg">
                    Capacidad (kg) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="capacidad_kg"
                    type="number"
                    value={formData.capacidad_kg}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, capacidad_kg: Number.parseInt(e.target.value) || "" }))
                    }
                    placeholder="Ej: 25000"
                    min="1"
                    max="50000"
                    required
                  />
                  <p className="text-xs text-gray-500">Capacidad máxima: 50,000 kg</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="km_actual">KM Actual</Label>
                  <Input
                    id="km_actual"
                    type="number"
                    value={formData.km_actual}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, km_actual: Number.parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado_operativo">Estado Operativo</Label>
                  <Select
                    value={formData.estado_operativo}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, estado_operativo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosOperativos.map((estado) => (
                        <SelectItem key={estado.value} value={estado.value}>
                          {estado.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Button onClick={handleCrearCamion} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Camión
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>Filtre los camiones por estado operativo y estado activo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Estado Operativo</Label>
              <Select value={filtros.estado} onValueChange={(value) => handleFiltroChange("estado", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {estadosOperativos.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado Activo</Label>
              <Select
                value={filtros.activo === undefined ? "all" : filtros.activo.toString()}
                onValueChange={(value) => handleFiltroChange("activo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
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
                <p className="text-sm font-medium text-gray-600">Total Camiones</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-900">
                  {camiones.filter((c) => c.estado === "Disponible" && c.activo).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">En Mantenimiento</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {camiones.filter((c) => c.estado === "En mantenimiento" && c.activo).length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Inactivos</p>
                <p className="text-2xl font-bold text-red-900">{camiones.filter((c) => !c.activo).length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de paginación */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Mostrando {camiones.length} de {total} camiones
        </span>
        <span>
          Página {paginaActual} de {totalPaginas || 1}
        </span>
      </div>

      {/* Tabla de camiones */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-10" role="status" aria-label="Cargando camiones">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando camiones...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Placa</th>
                    <th className="p-4 font-medium">Capacidad (kg)</th>
                    <th className="p-4 font-medium">KM Actual</th>
                    <th className="p-4 font-medium">Estado</th>
                    <th className="p-4 font-medium">Activo</th>
                    <th className="p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {camiones.map((camion, index) => (
                    <tr
                      key={camion.id}
                      className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="p-4 font-medium">{camion.id}</td>
                      <td className="p-4 font-mono">{camion.placa}</td>
                      <td className="p-4">
                        {camion.capacidad_kg ? `${camion.capacidad_kg.toLocaleString()} kg` : "N/A"}
                      </td>
                      <td className="p-4">{camion.km_actual ? `${camion.km_actual} km` : "0 km"}</td>
                      <td className="p-4">{getEstadoBadge(camion.estado)}</td>
                      <td className="p-4">{getActivoBadge(camion.activo)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(camion)}
                            aria-label={`Editar camión ${camion.placa}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {camion.activo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenMantenimientoDialog(camion)}
                              aria-label={`Programar mantenimiento para ${camion.placa}`}
                            >
                              <Wrench className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                          {camion.activo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDesactivarCamion(camion)}
                              aria-label={`Desactivar camión ${camion.placa}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
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

      {/* Mensaje si no hay camiones */}
      {!loading && camiones.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay camiones</h3>
            <p className="text-gray-600">No se encontraron camiones que coincidan con los filtros aplicados.</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Camión #{selectedCamion?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_placa">
                Placa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_placa"
                value={editData.placa}
                onChange={(e) => setEditData((prev) => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                pattern="[A-Z0-9-]+"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_capacidad_kg">
                Capacidad (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_capacidad_kg"
                type="number"
                value={editData.capacidad_kg}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, capacidad_kg: Number.parseInt(e.target.value) || "" }))
                }
                min="1"
                max="50000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_km_actual">KM Actual</Label>
              <Input
                id="edit_km_actual"
                type="number"
                value={editData.km_actual}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, km_actual: Number.parseFloat(e.target.value) || 0 }))
                }
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_estado_operativo">Estado Operativo</Label>
              <Select
                value={editData.estado_operativo}
                onValueChange={(value) => setEditData((prev) => ({ ...prev, estado_operativo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estadosOperativos.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button onClick={handleEditarCamion} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de mantenimiento */}
      <Dialog open={showMantenimientoDialog} onOpenChange={setShowMantenimientoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Programar Mantenimiento - {selectedCamion?.placa}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo de Mantenimiento <span className="text-red-500">*</span>
              </Label>
              <Select
                value={mantenimientoData.tipo}
                onValueChange={(value) => setMantenimientoData((prev) => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposMantenimiento.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">
                Fecha de Inicio <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={mantenimientoData.fecha_inicio}
                onChange={(e) => setMantenimientoData((prev) => ({ ...prev, fecha_inicio: e.target.value }))}
                min={getMinDate()}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion_mantenimiento">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descripcion_mantenimiento"
                rows={3}
                value={mantenimientoData.descripcion}
                onChange={(e) => setMantenimientoData((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Describa el mantenimiento a realizar..."
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowMantenimientoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearMantenimiento} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Programar Mantenimiento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CamionesAdmin

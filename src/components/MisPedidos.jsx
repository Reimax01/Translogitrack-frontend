"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { usePedidos } from "../hooks/usePedidos"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Eye,
  MapPin,
  Truck,
  User,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  RefreshCw,
  Package,
  Plus,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

function MisPedidos() {
const { getUser } = useAuth()
const user = getUser()
const navigate = useNavigate()

  // Hook para gestionar pedidos (filtrado automáticamente por cliente)
  const {
    pedidos,
    loading,
    error,
    totalPaginas,
    paginaActual,
    total,
    obtenerPedido,
    listarPedidos,
    cambiarPagina,
    limpiarError,
    recargarDatos,
  } = usePedidos()

  // Estados locales del componente
  const [filtros, setFiltros] = useState({
    estado: "",
    fechaInicio: "",
    fechaFin: "",
  })

  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [pedidoDetalle, setPedidoDetalle] = useState(null)

  // Opciones de estado
  const estadoOptions = [
    { value: "Pendiente", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    { value: "En tránsito", label: "En tránsito", color: "bg-blue-100 text-blue-800" },
    { value: "Entregado", label: "Entregado", color: "bg-green-100 text-green-800" },
    { value: "Cancelado", label: "Cancelado", color: "bg-red-100 text-red-800" },
  ]

  // Asegurar que se carguen correctamente los pedidos del cliente

  // Cargar pedidos del cliente al montar el componente
  useEffect(() => {
    if (user?.id) {
      console.log("🔍 Cargando pedidos para cliente ID:", user?.id)
      listarPedidos({ id_cliente: user?.id })
    }
  }, [user?.id_usuario, listarPedidos])

  // Función para obtener badge del estado
  const getEstadoBadge = (estado) => {
    const estadoConfig = estadoOptions.find((e) => e.value === estado) || estadoOptions[0]
    return <Badge className={`${estadoConfig.color} hover:${estadoConfig.color}`}>{estadoConfig.label}</Badge>
  }

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A"
    try {
      return format(new Date(fecha), "dd/MM/yyyy HH:mm", { locale: es })
    } catch (error) {
      return fecha
    }
  }

  // Función para formatear precio
  const formatearPrecio = (precio) => {
    if (!precio) return "N/A"
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(precio)
  }

  // Manejador para aplicar filtros
  const handleAplicarFiltros = async () => {
    limpiarError()
    await listarPedidos({ page: 1, id_cliente: user.id_usuario, ...filtros })
  }

  // Manejador para limpiar filtros
  const handleLimpiarFiltros = async () => {
    setFiltros({
      estado: "",
      fechaInicio: "",
      fechaFin: "",
    })
    limpiarError()
    await listarPedidos({ page: 1, id_cliente: user.id_usuario })
  }

  // Manejador para cambio de filtros
  const handleFiltroChange = (name, value) => {
    setFiltros((prev) => ({
      ...prev,
      [name]: value === "all" ? "" : value,
    }))
  }

  // Manejador para ver detalles del pedido
  const handleVerDetalle = async (pedido) => {
    try {
      const result = await obtenerPedido(pedido.id_pedido)
      if (result.success) {
        setPedidoDetalle(result.data)
        setShowDetailDialog(true)
      }
    } catch (err) {
      console.error("Error al obtener detalles:", err)
    }
  }

  // Manejador para cambio de página
  const handlePageChange = async (nuevaPagina) => {
    await cambiarPagina(nuevaPagina, { id_cliente: user.id_usuario, ...filtros })
  }

  // Manejador para recargar datos
  const handleRecargar = () => {
    if (user?.id_usuario) {
      listarPedidos({ id_cliente: user.id_usuario })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-sm text-gray-600">Consulta el estado y detalles de tus envíos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRecargar} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={() => navigate("/dashboard/nuevo-pedido")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>Filtra tus pedidos por estado y rango de fechas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filtros.estado} onValueChange={(value) => handleFiltroChange("estado", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {estadoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => handleFiltroChange("fechaInicio", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => handleFiltroChange("fechaFin", e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
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
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {pedidos.filter((p) => p.estado === "Pendiente").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">En Tránsito</p>
                <p className="text-2xl font-bold text-blue-900">
                  {pedidos.filter((p) => p.estado === "En tránsito").length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Entregados</p>
                <p className="text-2xl font-bold text-green-900">
                  {pedidos.filter((p) => p.estado === "Entregado").length}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de paginación */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Mostrando {pedidos.length} de {total} pedidos
        </span>
        <span>
          Página {paginaActual} de {totalPaginas || 1}
        </span>
      </div>

      {/* Tabla de pedidos */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-10" role="status" aria-label="Cargando pedidos">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando tus pedidos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Ruta</th>
                    <th className="p-4 font-medium">Estado</th>
                    <th className="p-4 font-medium">Fecha Creación</th>
                    <th className="p-4 font-medium">Entrega Estimada</th>
                    <th className="p-4 font-medium">Precio</th>
                    <th className="p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes pedidos</h3>
                        <p className="text-gray-600 mb-4">Aún no has realizado ningún pedido.</p>
                        <Button onClick={() => navigate("/dashboard/nuevo-pedido")}>
                          <Plus className="h-4 w-4 mr-2" />
                          Crear mi primer pedido
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    pedidos.map((pedido, index) => (
                      <tr
                        key={pedido.id_pedido}
                        className={`border-b hover:bg-gray-50 cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                        onClick={() => handleVerDetalle(pedido)}
                      >
                        <td className="p-4 font-medium">#{pedido.id_pedido}</td>
                        <td className="p-4">
                          {pedido.ruta ? `${pedido.ruta.origen} → ${pedido.ruta.destino}` : "N/A"}
                        </td>
                        <td className="p-4">{getEstadoBadge(pedido.estado)}</td>
                        <td className="p-4">{formatearFecha(pedido.fecha_creacion)}</td>
                        <td className="p-4">{formatearFecha(pedido.fecha_entrega_estimada)}</td>
                        <td className="p-4">{formatearPrecio(pedido.precio)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerDetalle(pedido)}
                              aria-label={`Ver detalles del pedido ${pedido.id_pedido}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {pedido.estado === "En tránsito" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/dashboard/seguimiento")}
                                aria-label={`Rastrear pedido ${pedido.id_pedido}`}
                              >
                                <MapPin className="h-4 w-4 text-blue-500" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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

      {/* Dialog de detalles del pedido */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido #{pedidoDetalle?.id_pedido}</DialogTitle>
          </DialogHeader>
          {pedidoDetalle && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Ruta</p>
                      <p className="text-sm text-gray-600">
                        {pedidoDetalle.ruta ? `${pedidoDetalle.ruta.origen} → ${pedidoDetalle.ruta.destino}` : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Camión</p>
                      <p className="text-sm text-gray-600">{pedidoDetalle.camion?.placa || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Conductor</p>
                      <p className="text-sm text-gray-600">{pedidoDetalle.conductor?.nombre_completo || "N/A"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Precio</p>
                      <p className="text-sm text-gray-600">{formatearPrecio(pedidoDetalle.precio)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">N° Guía</p>
                      <p className="text-sm text-gray-600">{pedidoDetalle.nro_guia || "Pendiente de asignación"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Estado</p>
                    {getEstadoBadge(pedidoDetalle.estado)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Fechas</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Creación: {formatearFecha(pedidoDetalle.fecha_creacion)}</p>
                      <p>Entrega Estimada: {formatearFecha(pedidoDetalle.fecha_entrega_estimada)}</p>
                      {pedidoDetalle.fecha_entrega_real && (
                        <p>Entrega Real: {formatearFecha(pedidoDetalle.fecha_entrega_real)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {pedidoDetalle.observaciones && (
                  <div>
                    <p className="text-sm font-medium mb-1">Observaciones</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{pedidoDetalle.observaciones}</p>
                  </div>
                )}
              </div>

              {/* Botón de seguimiento si está en tránsito */}
              {pedidoDetalle.estado === "En tránsito" && (
                <div className="flex justify-center">
                  <Button onClick={() => navigate("/dashboard/seguimiento")} className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Rastrear en Tiempo Real
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MisPedidos

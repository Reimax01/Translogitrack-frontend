"use client"

import { useState, useEffect } from "react"
import { usePedidos } from "../hooks/usePedidos"
import { useAuth } from "../hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Truck, Clock, Package, Search, RefreshCw } from "lucide-react"

function SeguimientoPedidos() {
  const { user } = useAuth()
  const { pedidos, loading, listarPedidos, obtenerPedido } = usePedidos()

  // Estados locales
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
  const [busquedaPedido, setBusquedaPedido] = useState("")
  const [pedidosEnTransito, setPedidosEnTransito] = useState([])

  // Determinar si es cliente para filtrar pedidos
  const isClient = user?.rol === "Cliente" || user?.tipo_usuario === "Cliente"

  // Cargar pedidos en tránsito al montar el componente
  useEffect(() => {
    const cargarPedidosEnTransito = async () => {
      const filtros = { estado: "En tránsito" }
      if (isClient) {
        filtros.id_cliente = user.id_usuario
      }
      await listarPedidos(filtros)
    }

    cargarPedidosEnTransito()
  }, [user, isClient, listarPedidos])

  // Actualizar lista de pedidos en tránsito cuando cambian los pedidos
  useEffect(() => {
    const enTransito = pedidos.filter((p) => p.estado === "En tránsito")
    setPedidosEnTransito(enTransito)

    // Si hay pedidos en tránsito y no hay uno seleccionado, seleccionar el primero
    if (enTransito.length > 0 && !pedidoSeleccionado) {
      setPedidoSeleccionado(enTransito[0])
    }
  }, [pedidos, pedidoSeleccionado])

  // Función para buscar pedido por ID
  const handleBuscarPedido = async () => {
    if (!busquedaPedido.trim()) return

    try {
      const result = await obtenerPedido(busquedaPedido)
      if (result.success) {
        setPedidoSeleccionado(result.data)
      }
    } catch (err) {
      console.error("Error al buscar pedido:", err)
    }
  }

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A"
    try {
      return new Date(fecha).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return fecha
    }
  }

  // Función para obtener badge del estado
  const getEstadoBadge = (estado) => {
    const colores = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      "En tránsito": "bg-blue-100 text-blue-800",
      Entregado: "bg-green-100 text-green-800",
      Cancelado: "bg-red-100 text-red-800",
    }
    return <Badge className={colores[estado] || "bg-gray-100 text-gray-800"}>{estado}</Badge>
  }

  // Simular ubicación GPS (en un caso real vendría del backend)
  const simularUbicacionGPS = (pedido) => {
    if (!pedido || pedido.estado !== "En tránsito") return null

    // Coordenadas simuladas para demostración
    return {
      latitud: -12.0464 + (Math.random() - 0.5) * 0.1,
      longitud: -77.0428 + (Math.random() - 0.5) * 0.1,
      timestamp: new Date().toISOString(),
      velocidad: Math.floor(Math.random() * 60) + 20, // 20-80 km/h
    }
  }

  const ubicacionActual = simularUbicacionGPS(pedidoSeleccionado)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seguimiento de Pedidos</h1>
          <p className="text-sm text-gray-600">
            {isClient ? "Rastrea tus pedidos en tiempo real" : "Monitorea todos los pedidos en tránsito"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => listarPedidos({ estado: "En tránsito", ...(isClient && { id_cliente: user.id_usuario }) })}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de búsqueda y lista de pedidos */}
        <div className="lg:col-span-1 space-y-4">
          {/* Búsqueda por ID */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Ingrese ID del pedido"
                  value={busquedaPedido}
                  onChange={(e) => setBusquedaPedido(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleBuscarPedido()}
                />
                <Button onClick={handleBuscarPedido} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de pedidos en tránsito */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Pedidos en Tránsito
              </CardTitle>
              <CardDescription>{pedidosEnTransito.length} pedido(s) en movimiento</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Cargando...</span>
                </div>
              ) : pedidosEnTransito.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay pedidos en tránsito</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pedidosEnTransito.map((pedido) => (
                    <div
                      key={pedido.id_pedido}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        pedidoSeleccionado?.id_pedido === pedido.id_pedido
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setPedidoSeleccionado(pedido)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">#{pedido.id_pedido}</span>
                        {getEstadoBadge(pedido.estado)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {pedido.ruta ? `${pedido.ruta.origen} → ${pedido.ruta.destino}` : "Ruta no disponible"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Cliente: {pedido.cliente?.nombre_completo || "N/A"}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel de detalles y mapa */}
        <div className="lg:col-span-2 space-y-4">
          {pedidoSeleccionado ? (
            <>
              {/* Información del pedido */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Pedido #{pedidoSeleccionado.id_pedido}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Cliente</Label>
                        <p className="text-sm">{pedidoSeleccionado.cliente?.nombre_completo || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Ruta</Label>
                        <p className="text-sm">
                          {pedidoSeleccionado.ruta
                            ? `${pedidoSeleccionado.ruta.origen} → ${pedidoSeleccionado.ruta.destino}`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Estado</Label>
                        <div className="mt-1">{getEstadoBadge(pedidoSeleccionado.estado)}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Conductor</Label>
                        <p className="text-sm">{pedidoSeleccionado.conductor?.nombre_completo || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Camión</Label>
                        <p className="text-sm">{pedidoSeleccionado.camion?.placa || "N/A"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">N° Guía</Label>
                        <p className="text-sm">{pedidoSeleccionado.nro_guia || "Pendiente"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ubicación GPS */}
              {ubicacionActual && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Ubicación en Tiempo Real
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <Label className="text-sm font-medium text-gray-600">Latitud</Label>
                        <p className="text-lg font-mono">{ubicacionActual.latitud.toFixed(6)}</p>
                      </div>
                      <div className="text-center">
                        <Label className="text-sm font-medium text-gray-600">Longitud</Label>
                        <p className="text-lg font-mono">{ubicacionActual.longitud.toFixed(6)}</p>
                      </div>
                      <div className="text-center">
                        <Label className="text-sm font-medium text-gray-600">Velocidad</Label>
                        <p className="text-lg font-mono">{ubicacionActual.velocidad} km/h</p>
                      </div>
                    </div>

                    {/* Simulación de mapa */}
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Mapa de Seguimiento GPS</p>
                      <p className="text-sm text-gray-500">
                        Última actualización: {formatearFecha(ubicacionActual.timestamp)}
                      </p>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          🚛 El vehículo se encuentra en movimiento hacia el destino
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Historial de estados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Historial de Estados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">En tránsito</span>
                          <span className="text-sm text-gray-500">{formatearFecha(new Date())}</span>
                        </div>
                        <p className="text-sm text-gray-600">El pedido está en camino hacia su destino</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">Asignado</span>
                          <span className="text-sm text-gray-500">
                            {formatearFecha(pedidoSeleccionado.fecha_creacion)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Conductor y vehículo asignados</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mt-1"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">Creado</span>
                          <span className="text-sm text-gray-500">
                            {formatearFecha(pedidoSeleccionado.fecha_creacion)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Pedido registrado en el sistema</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Seleccione un pedido</h3>
                <p className="text-gray-600">
                  Seleccione un pedido de la lista o busque por ID para ver su seguimiento en tiempo real
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default SeguimientoPedidos

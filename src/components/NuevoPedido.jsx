"use client"

import { useState, useEffect } from "react"
import { usePedidos } from "../hooks/usePedidos"
import { useAuth } from "../hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Package, MapPin, DollarSign, Calendar, ArrowLeft } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import { toast } from "@/hooks/use-toast"

function NuevoPedido() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { crearPedido, loading } = usePedidos()

  // Estados para datos relacionados
  const [rutas, setRutas] = useState([])
  const [rutasLoading, setRutasLoading] = useState(true)

  // Estados para formulario
  const [formData, setFormData] = useState({
    id_ruta: "",
    fecha_entrega_estimada: "",
    observaciones: "",
    precio: "",
  })

  const [rutaSeleccionada, setRutaSeleccionada] = useState(null)

  // Cargar rutas disponibles al montar el componente
  useEffect(() => {
    const cargarRutas = async () => {
      try {
        setRutasLoading(true)
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("translogitrack_token")}`,
          "Content-Type": "application/json",
        }

        const rutasRes = await fetch("https://translogitrack-server-production.up.railway.app/api/rutas", { headers })
        if (rutasRes.ok) {
          const rutasData = await rutasRes.json()
          setRutas(rutasData.rutas || [])
        }
      } catch (err) {
        console.error("Error al cargar rutas:", err)
        toast({
          title: "Error",
          description: "No se pudieron cargar las rutas disponibles",
          variant: "destructive",
        })
      } finally {
        setRutasLoading(false)
      }
    }

    cargarRutas()
  }, [])

  // Función para obtener la fecha mínima (mañana)
  const getMinDateTime = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset())
    return tomorrow.toISOString().slice(0, 16)
  }

  // Función para formatear precio
  const formatearPrecio = (precio) => {
    if (!precio) return "N/A"
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(precio)
  }

  // Manejador para cambio de ruta
  const handleRutaChange = (rutaId) => {
    const ruta = rutas.find((r) => r.id_ruta.toString() === rutaId)
    setRutaSeleccionada(ruta)
    setFormData((prev) => ({
      ...prev,
      id_ruta: rutaId,
      precio: ruta ? ruta.precio : "",
    }))
  }

  // Manejador para crear pedido
  const handleCrearPedido = async () => {
    try {
      // Validaciones básicas
      if (!formData.id_ruta) {
        toast({
          title: "Error",
          description: "Debe seleccionar una ruta",
          variant: "destructive",
        })
        return
      }

      if (!formData.fecha_entrega_estimada) {
        toast({
          title: "Error",
          description: "Debe seleccionar una fecha de entrega",
          variant: "destructive",
        })
        return
      }

      // Preparar datos para envío
      const data = {
        id_usuario: user.id_usuario,
        id_ruta: parseInt(formData.id_ruta),
        fecha_entrega_estimada: formData.fecha_entrega_estimada,
        ...(formData.observaciones && { observaciones: formData.observaciones }),
        ...(formData.precio && { precio: parseFloat(formData.precio) }),
      }

      const result = await crearPedido(data)
      if (result.success) {
        toast({
          title: "¡Pedido creado exitosamente!",
          description: `Tu pedido #${result.data.id_pedido} ha sido registrado y será procesado pronto.`,
        })
        navigate("/dashboard/mis-pedidos")
      }
    } catch (err) {
      console.error("Error al crear pedido:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard/mis-pedidos")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a Mis Pedidos
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitar Nuevo Pedido</h1>
          <p className="text-sm text-gray-600">Complete la información para solicitar un nuevo envío</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre Completo</Label>
                  <Input value={user?.nombre_completo || ""} disabled />
                </div>
                <div>
                  <Label>Correo Electrónico</Label>
                  <Input value={user?.correo_electronico || ""} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selección de ruta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Selección de Ruta
              </CardTitle>
              <CardDescription>Seleccione el origen y destino de su envío</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ruta">
                    Ruta <span className="text-red-500">*</span>
                  </Label>
                  {rutasLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Cargando rutas...</span>
                    </div>
                  ) : (
                    <Select value={formData.id_ruta} onValueChange={handleRutaChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una ruta" />
                      </SelectTrigger>
                      <SelectContent>
                        {rutas.map((ruta) => (
                          <SelectItem key={ruta.id_ruta} value={ruta.id_ruta.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {ruta.origen} → {ruta.destino}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">
                                {ruta.distancia_km} km - {formatearPrecio(ruta.precio)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {rutaSeleccionada && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Detalles de la Ruta Seleccionada</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Origen:</span>
                        <p className="text-blue-900">{rutaSeleccionada.origen}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Destino:</span>
                        <p className="text-blue-900">{rutaSeleccionada.destino}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Distancia:</span>
                        <p className="text-blue-900">{rutaSeleccionada.distancia_km} km</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detalles del pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalles del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fecha_entrega_estimada">
                    Fecha de Entrega Deseada <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.fecha_entrega_estimada}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fecha_entrega_estimada: e.target.value }))}
                    min={getMinDateTime()}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">La fecha debe ser al menos 24 horas después de ahora</p>
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones Especiales</Label>
                  <Textarea
                    placeholder="Ingrese cualquier instrucción especial para el envío (opcional)..."
                    value={formData.observaciones}
                    onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rutaSeleccionada ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ruta:</span>
                        <span className="font-medium">
                          {rutaSeleccionada.origen} → {rutaSeleccionada.destino}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Distancia:</span>
                        <span>{rutaSeleccionada.distancia_km} km</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Precio base:</span>
                        <span>{formatearPrecio(rutaSeleccionada.precio)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between font-medium">
                        <span>Total Estimado:</span>
                        <span className="text-lg">{formatearPrecio(rutaSeleccionada.precio)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        *El precio final puede variar según características específicas del envío
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-center">
                        Estado: Pendiente de Asignación
                      </Badge>
                      <p className="text-xs text-gray-500 text-center">
                        Una vez confirmado, se asignará un conductor y camión disponible
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Seleccione una ruta para ver el resumen</p>
                  </div>
                )}

                <Button
                  onClick={handleCrearPedido}
                  disabled={loading || !formData.id_ruta || !formData.fecha_entrega_estimada}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Creando Pedido..." : "Confirmar Pedido"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Al confirmar, acepta nuestros términos y condiciones de servicio
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default NuevoPedido

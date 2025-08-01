"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { usePedidos } from "../hooks/usePedidos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
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
} from "lucide-react"

function PedidosAdmin() {
  // Hook para gestionar pedidos
  const {
    pedidos,
    loading,
    error,
    totalPaginas,
    paginaActual,
    total,
    crearPedido,
    eliminarPedido,
    actualizarPedido,
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
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedPedido, setSelectedPedido] = useState(null)
  const [pedidoDetalle, setPedidoDetalle] = useState(null)

  // Estados para datos relacionados
  const [usuarios, setUsuarios] = useState([])
  const [camiones, setCamiones] = useState([])
  const [conductores, setConductores] = useState([])
  const [rutas, setRutas] = useState([])

  // Estados para formularios
  const [formData, setFormData] = useState({
    id_usuario: "",
    id_ruta: "",
    id_camion: "",
    id_conductor: "",
    fecha_entrega_estimada: "",
    observaciones: "",
    precio: "",
  })

  // Cambié editData para incluir todos los campos necesarios
  const [editData, setEditData] = useState({
    id_usuario: "", // Este es el ID del cliente, pero lo llamamos id_usuario en el frontend
    id_ruta: "",
    id_camion: "",
    id_conductor: "",
    estado: "",
    observaciones: "",
    fecha_entrega_real: "",
    fecha_entrega_estimada: "",
    precio: "",
    nro_guia: "",
  })

  // Opciones de estado según el modelo
  const estadoOptions = [
    { value: "Pendiente", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    { value: "En tránsito", label: "En tránsito", color: "bg-blue-100 text-blue-800" },
    { value: "Entregado", label: "Entregado", color: "bg-green-100 text-green-800" },
    { value: "Cancelado", label: "Cancelado", color: "bg-red-100 text-red-800" },
  ]

  // Cargar datos relacionados al montar el componente
  useEffect(() => {
    const cargarDatosRelacionados = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("translogitrack_token")}`,
          "Content-Type": "application/json",
        }
        // cargar clientes disponibles
        const usuariosRes = await fetch(
          "https://translogitrack-server-production.up.railway.app/api/usuarios?rol=Cliente",
          { headers },
        )
        if (usuariosRes.ok) {
          const usuariosData = await usuariosRes.json()
          setUsuarios(usuariosData.usuarios || [])
        }

        // Cargar camiones disponibles
        const camionesRes = await fetch(
          "https://translogitrack-server-production.up.railway.app/api/camiones?estado=Disponible",
          { headers },
        )
        if (camionesRes.ok) {
          const camionesData = await camionesRes.json()
          setCamiones(camionesData.camiones || [])
        }

        // Cargar conductores activos
        const conductoresRes = await fetch(
          "https://translogitrack-server-production.up.railway.app/api/conductores?activo=true",
          { headers },
        )
        if (conductoresRes.ok) {
          const conductoresData = await conductoresRes.json()
          setConductores(conductoresData.conductores || [])
        }

        // Cargar rutas
        const rutasRes = await fetch("https://translogitrack-server-production.up.railway.app/api/rutas", { headers })
        if (rutasRes.ok) {
          const rutasData = await rutasRes.json()
          setRutas(rutasData.rutas || [])
        }
      } catch (err) {
        console.error("Error al cargar datos relacionados:", err)
      }
    }

    cargarDatosRelacionados()
  }, [])

  // Cargar todos los camiones cuando se abre el diálogo de edición
  useEffect(() => {
    if (showEditDialog) {
      const cargarTodosCamiones = async () => {
        try {
          const headers = {
            Authorization: `Bearer ${localStorage.getItem("translogitrack_token")}`,
            "Content-Type": "application/json",
          }

          // Cargar todos los camiones (no solo los disponibles)
          const camionesRes = await fetch("https://translogitrack-server-production.up.railway.app/api/camiones", {
            headers,
          })

          if (camionesRes.ok) {
            const camionesData = await camionesRes.json()
            setCamiones(camionesData.camiones || [])
          }
        } catch (err) {
          console.error("Error al cargar todos los camiones:", err)
        }
      }

      cargarTodosCamiones()
    }
  }, [showEditDialog])

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
    await listarPedidos({ page: 1, ...filtros })
  }

  // Manejador para limpiar filtros
  const handleLimpiarFiltros = async () => {
    setFiltros({
      estado: "",
      fechaInicio: "",
      fechaFin: "",
    })
    limpiarError()
    await listarPedidos({ page: 1 })
  }

  // Manejador para cambio de filtros
  const handleFiltroChange = (name, value) => {
    setFiltros((prev) => ({
      ...prev,
      [name]: value === "all" ? "" : value,
    }))
  }

  // Manejador para crear pedido
  const handleCrearPedido = async () => {
    try {
      const data = {
        id_usuario: Number.parseInt(formData.id_usuario),
        id_ruta: Number.parseInt(formData.id_ruta),
        id_camion: Number.parseInt(formData.id_camion),
        id_conductor: Number.parseInt(formData.id_conductor),
        fecha_entrega_estimada: formData.fecha_entrega_estimada,
        ...(formData.observaciones && { observaciones: formData.observaciones }),
        ...(formData.precio && { precio: Number.parseFloat(formData.precio) }),
      }
      const result = await crearPedido(data)
      if (result.success) {
        setShowCreateDialog(false)
        setFormData({
          id_usuario: "",
          id_ruta: "",
          id_camion: "",
          id_conductor: "",
          fecha_entrega_estimada: "",
          observaciones: "",
          precio: "",
        })
        await recargarDatos()
      }
    } catch (err) {
      console.error("Error al crear pedido:", err)
    }
  }

  // Manejador para editar pedido - CORREGIDO BASADO EN EL CÓDIGO ORIGINAL Y EL ENDPOINT
  const handleEditarPedido = async () => {
    if (!selectedPedido) return
    try {
      console.log("=== INICIO EDICIÓN ===")
      console.log("Pedido original (selectedPedido):", selectedPedido)
      console.log("Datos del formulario (editData) ANTES de procesar:", editData)

      // Función auxiliar para validar y parsear IDs
      const validarId = (valor, nombreCampo) => {
        const num = Number.parseInt(valor)
        if (isNaN(num) || num <= 0) {
          console.warn(`⚠️ ${nombreCampo} no es válido o está vacío:`, valor)
          return null
        }
        return num
      }

      // Construir el objeto para la actualización
      const data = {}

      // Cliente (id_cliente) - Usamos editData.id_usuario del frontend, pero lo mapeamos a id_cliente para el backend
      if (editData.id_usuario) {
        const parsedId = validarId(editData.id_usuario, "id_cliente")
        data.id_cliente = parsedId !== null ? parsedId : selectedPedido.id_cliente || selectedPedido.id_usuario
      } else {
        data.id_cliente = selectedPedido.id_cliente || selectedPedido.id_usuario
      }

      // Ruta (id_ruta)
      if (editData.id_ruta) {
        const parsedId = validarId(editData.id_ruta, "id_ruta")
        data.id_ruta = parsedId !== null ? parsedId : selectedPedido.id_ruta
      } else {
        data.id_ruta = selectedPedido.id_ruta
      }

      // Camión (id_camion)
      if (editData.id_camion) {
        const parsedId = validarId(editData.id_camion, "id_camion")
        data.id_camion = parsedId !== null ? parsedId : selectedPedido.id_camion
      } else {
        data.id_camion = selectedPedido.id_camion
      }

      // Conductor (id_conductor)
      if (editData.id_conductor) {
        const parsedId = validarId(editData.id_conductor, "id_conductor")
        data.id_conductor = parsedId !== null ? parsedId : selectedPedido.id_conductor
      } else {
        data.id_conductor = selectedPedido.id_conductor
      }

      // Estado
      data.estado = editData.estado?.trim() || selectedPedido.estado

      // Observaciones
      data.observaciones =
        editData.observaciones !== undefined ? editData.observaciones.trim() : selectedPedido.observaciones

      // Precio
      data.precio = editData.precio ? Number.parseFloat(editData.precio) : selectedPedido.precio

      // Nro Guía - Incluir si se ha modificado o si ya tiene un valor
      if (editData.nro_guia !== undefined && editData.nro_guia.trim() !== "") {
        data.nro_guia = editData.nro_guia.trim()
      } else if (selectedPedido.nro_guia) {
        data.nro_guia = selectedPedido.nro_guia
      } else {
        // Si no hay nro_guia ni en editData ni en selectedPedido, no lo enviamos o lo enviamos como null/vacío si el backend lo requiere
        // Por ahora, si no hay valor, no lo incluimos en el payload para evitar enviar undefined
        // Si el backend espera un string vacío para "borrar", se puede cambiar a data.nro_guia = ""
      }

      // Fecha Entrega Estimada
      data.fecha_entrega_estimada = editData.fecha_entrega_estimada || selectedPedido.fecha_entrega_estimada

      // Fecha Entrega Real
      if (editData.fecha_entrega_real?.trim()) {
        data.fecha_entrega_real = editData.fecha_entrega_real.trim()
      } else if (selectedPedido.fecha_entrega_real) {
        data.fecha_entrega_real = selectedPedido.fecha_entrega_real
      }

      console.log("Datos FINALES a enviar a la API:", data)
      console.log("IDs específicos en datos finales:", {
        cliente: data.id_cliente, // Ahora se llama id_cliente
        camion: data.id_camion,
        conductor: data.id_conductor,
        nro_guia: data.nro_guia,
      })

      // Llamar a la función que hace PUT
      const result = await actualizarPedido(selectedPedido.id_pedido, data)

      console.log("Respuesta COMPLETA del servidor (result):", result)

      if (result.success) {
        console.log("✅ Actualización exitosa (según el frontend y la respuesta del servidor)")

        // Cerrar el diálogo
        setShowEditDialog(false)
        setSelectedPedido(null)

        // Limpiar el formulario
        setEditData({
          id_usuario: "",
          id_ruta: "",
          id_camion: "",
          id_conductor: "",
          estado: "",
          observaciones: "",
          fecha_entrega_real: "",
          fecha_entrega_estimada: "",
          precio: "",
          nro_guia: "",
        })

        // Refrescar lista de pedidos
        await recargarDatos()

        alert("Pedido actualizado correctamente")
      } else {
        console.error("❌ Error en actualización (según el servidor):", result.error)
        alert("Error al actualizar el pedido: " + (result.error || "Error desconocido"))
      }
    } catch (err) {
      console.error("❌ Error al editar pedido (catch block):", err)
      alert("Error al editar pedido: " + (err.message || "Error desconocido"))
    }
  }

  // Manejador para eliminar pedido
  const handleEliminarPedido = async (pedido) => {
    if (pedido.estado !== "Pendiente") {
      return
    }
    if (window.confirm(`¿Está seguro de que desea eliminar el pedido #${pedido.id_pedido}?`)) {
      await eliminarPedido(pedido.id_pedido)
      await recargarDatos()
    }
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

  // Manejador para abrir dialog de edición - CORREGIDO
  const handleOpenEditDialog = (pedido) => {
    console.log("Pedido completo recibido para edición:", pedido)

    setSelectedPedido(pedido)

    // Formatear las fechas correctamente
    const formatearFechaParaInput = (fecha) => {
      if (!fecha) return ""
      try {
        const date = new Date(fecha)
        // Convertir a formato datetime-local (YYYY-MM-DDTHH:mm)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")
        const hours = String(date.getHours()).padStart(2, "0")
        const minutes = String(date.getMinutes()).padStart(2, "0")
        return `${year}-${month}-${day}T${hours}:${minutes}`
      } catch (error) {
        console.error("Error al formatear fecha:", error)
        return ""
      }
    }

    // Asegurarse de que todos los valores se conviertan a string para los componentes Select
    const datosFormateados = {
      id_usuario: pedido.id_usuario?.toString() || pedido.cliente?.id_usuario?.toString() || "",
      id_ruta: pedido.id_ruta?.toString() || pedido.ruta?.id_ruta?.toString() || "",
      id_camion: pedido.id_camion?.toString() || pedido.camion?.id_camion?.toString() || "",
      id_conductor: pedido.id_conductor?.toString() || pedido.conductor?.id_conductor?.toString() || "",
      estado: pedido.estado || "",
      observaciones: pedido.observaciones || "",
      fecha_entrega_real: pedido.fecha_entrega_real ? formatearFechaParaInput(pedido.fecha_entrega_real) : "",
      fecha_entrega_estimada: pedido.fecha_entrega_estimada
        ? formatearFechaParaInput(pedido.fecha_entrega_estimada)
        : "",
      precio: pedido.precio?.toString() || "",
      nro_guia: pedido.nro_guia || "",
    }

    console.log("Datos formateados para el formulario (editData) DESPUÉS de abrir diálogo:", datosFormateados)
    console.log("Arrays disponibles (usuarios, rutas, camiones, conductores):", {
      usuarios: usuarios.length,
      rutas: rutas.length,
      camiones: camiones.length,
      conductores: conductores.length,
    })

    setEditData(datosFormateados)
    setShowEditDialog(true)
  }

  // Manejador para cambio de página
  const handlePageChange = async (nuevaPagina) => {
    await cambiarPagina(nuevaPagina, filtros)
  }

  // Función para obtener la fecha mínima (ahora)
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-sm text-gray-600">Administre los pedidos del sistema de transporte</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={recargarDatos}
            disabled={loading}
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recargar
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Pedido</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_usuario">
                    Cliente <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.id_usuario}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, id_usuario: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((usuario) => (
                        <SelectItem key={usuario.id_usuario} value={usuario.id_usuario.toString()}>
                          {usuario.nombre_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_ruta">
                    Ruta <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.id_ruta}
                    onValueChange={(value) => {
                      const rutaSeleccionada = rutas.find((r) => r.id_ruta.toString() === value)
                      setFormData((prev) => ({
                        ...prev,
                        id_ruta: value,
                        precio: rutaSeleccionada ? rutaSeleccionada.precio : "",
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una ruta" />
                    </SelectTrigger>
                    <SelectContent>
                      {rutas.map((ruta) => (
                        <SelectItem key={ruta.id_ruta} value={ruta.id_ruta.toString()}>
                          {ruta.origen} → {ruta.destino} ({ruta.distancia_km} km)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_camion">
                    Camión <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.id_camion}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, id_camion: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un camión" />
                    </SelectTrigger>
                    <SelectContent>
                      {camiones.map((camion) => (
                        <SelectItem key={camion.id_camion} value={camion.id_camion.toString()}>
                          {camion.placa} - {camion.capacidad_kg} kg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_conductor">
                    Conductor <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.id_conductor}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, id_conductor: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un conductor" />
                    </SelectTrigger>
                    <SelectContent>
                      {conductores.map((conductor) => (
                        <SelectItem key={conductor.id_conductor} value={conductor.id_conductor.toString()}>
                          {conductor.nombre_completo} - {conductor.numero_licencia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha_entrega_estimada">
                    Fecha Entrega Estimada <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.fecha_entrega_estimada}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fecha_entrega_estimada: e.target.value }))}
                    min={getMinDateTime()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, precio: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    placeholder="Ingrese observaciones adicionales..."
                    value={formData.observaciones}
                    onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCrearPedido} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Pedido
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
          <CardDescription>Filtre los pedidos por estado y rango de fechas</CardDescription>
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
              <span>Cargando pedidos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Cliente</th>
                    <th className="p-4 font-medium">Ruta</th>
                    <th className="p-4 font-medium">Estado</th>
                    <th className="p-4 font-medium">Fecha Creación</th>
                    <th className="p-4 font-medium">Precio</th>
                    <th className="p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No hay pedidos disponibles
                      </td>
                    </tr>
                  ) : (
                    pedidos.map((pedido, index) => (
                      <tr
                        key={pedido.id_pedido}
                        className={`border-b hover:bg-gray-50 cursor-pointer ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                        onClick={() => handleVerDetalle(pedido)}
                      >
                        <td className="p-4 font-medium">{pedido.id_pedido}</td>
                        <td className="p-4">{pedido.cliente?.nombre_completo || "N/A"}</td>
                        <td className="p-4">
                          {pedido.ruta ? `${pedido.ruta.origen} → ${pedido.ruta.destino}` : "N/A"}
                        </td>
                        <td className="p-4">{getEstadoBadge(pedido.estado)}</td>
                        <td className="p-4">{formatearFecha(pedido.fecha_creacion)}</td>
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditDialog(pedido)}
                              aria-label={`Editar pedido ${pedido.id_pedido}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {pedido.estado === "Pendiente" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminarPedido(pedido)}
                                aria-label={`Eliminar pedido ${pedido.id_pedido}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
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

      {/* Mensaje si no hay pedidos */}
      {!loading && pedidos.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
            <p className="text-gray-600">No se encontraron pedidos que coincidan con los filtros aplicados.</p>
          </CardContent>
        </Card>
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
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Cliente</p>
                      <p className="text-sm text-gray-600">{pedidoDetalle.cliente?.nombre_completo || "N/A"}</p>
                    </div>
                  </div>
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
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Conductor</p>
                      <p className="text-sm text-gray-600">{pedidoDetalle.conductor?.nombre_completo || "N/A"}</p>
                    </div>
                  </div>
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
                      <p className="text-sm text-gray-600">{pedidoDetalle.nro_guia || "N/A"}</p>
                    </div>
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
                <div>
                  <p className="text-sm font-medium mb-1">Estado</p>
                  {getEstadoBadge(pedidoDetalle.estado)}
                </div>
                {pedidoDetalle.observaciones && (
                  <div>
                    <p className="text-sm font-medium mb-1">Observaciones</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{pedidoDetalle.observaciones}</p>
                  </div>
                )}
              </div>
              {/* Historial de seguimientos */}
              {pedidoDetalle.seguimientos && pedidoDetalle.seguimientos.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Historial de Seguimientos
                    </p>
                    <div className="space-y-3">
                      {pedidoDetalle.seguimientos.map((seguimiento, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium">{seguimiento.estado}</span>
                              <span className="text-xs text-gray-500">{formatearFecha(seguimiento.timestamp)}</span>
                            </div>
                            {seguimiento.observaciones && (
                              <p className="text-xs text-gray-600 mt-1">{seguimiento.observaciones}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de edición - SIMPLIFICADO */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Pedido #{selectedPedido?.id_pedido}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id_usuario_edit">Cliente</Label>
              <Select
                value={editData.id_usuario}
                onValueChange={(value) => setEditData((prev) => ({ ...prev, id_usuario: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id_usuario} value={usuario.id_usuario.toString()}>
                      {usuario.nombre_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_ruta_edit">Ruta</Label>
              <Select
                value={editData.id_ruta}
                onValueChange={(value) => {
                  const rutaSeleccionada = rutas.find((r) => r.id_ruta.toString() === value)
                  setEditData((prev) => ({
                    ...prev,
                    id_ruta: value,
                    precio: rutaSeleccionada ? rutaSeleccionada.precio.toString() : prev.precio,
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una ruta" />
                </SelectTrigger>
                <SelectContent>
                  {rutas.map((ruta) => (
                    <SelectItem key={ruta.id_ruta} value={ruta.id_ruta.toString()}>
                      {ruta.origen} → {ruta.destino} ({ruta.distancia_km} km)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_camion_edit">Camión</Label>
              <Select
                value={editData.id_camion}
                onValueChange={(value) => setEditData((prev) => ({ ...prev, id_camion: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un camión" />
                </SelectTrigger>
                <SelectContent>
                  {camiones.map((camion) => (
                    <SelectItem key={camion.id_camion} value={camion.id_camion.toString()}>
                      {camion.placa} - {camion.capacidad_kg} kg
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_conductor_edit">Conductor</Label>
              <Select
                value={editData.id_conductor}
                onValueChange={(value) => setEditData((prev) => ({ ...prev, id_conductor: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un conductor" />
                </SelectTrigger>
                <SelectContent>
                  {conductores.map((conductor) => (
                    <SelectItem key={conductor.id_conductor} value={conductor.id_conductor.toString()}>
                      {conductor.nombre_completo} - {conductor.numero_licencia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado_edit">Estado</Label>
              <Select
                value={editData.estado}
                onValueChange={(value) => setEditData((prev) => ({ ...prev, estado: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_entrega_estimada_edit">Fecha Entrega Estimada</Label>
              <Input
                id="fecha_entrega_estimada_edit"
                type="datetime-local"
                value={editData.fecha_entrega_estimada}
                onChange={(e) => setEditData((prev) => ({ ...prev, fecha_entrega_estimada: e.target.value }))}
                min={getMinDateTime()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nro_guia_edit">N° Guía</Label>
              <Input
                id="nro_guia_edit"
                value={editData.nro_guia}
                onChange={(e) => setEditData((prev) => ({ ...prev, nro_guia: e.target.value }))}
                placeholder="Ingrese número de guía"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio_edit">Precio</Label>
              <Input
                id="precio_edit"
                type="number"
                value={editData.precio}
                onChange={(e) => setEditData((prev) => ({ ...prev, precio: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_entrega_real">Fecha Entrega Real</Label>
              <Input
                id="fecha_entrega_real"
                type="datetime-local"
                value={editData.fecha_entrega_real}
                onChange={(e) => setEditData((prev) => ({ ...prev, fecha_entrega_real: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="observaciones_edit">Observaciones</Label>
              <Textarea
                id="observaciones_edit"
                placeholder="Ingrese observaciones..."
                value={editData.observaciones}
                onChange={(e) => setEditData((prev) => ({ ...prev, observaciones: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditarPedido} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default PedidosAdmin

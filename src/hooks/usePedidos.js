"use client"

import { useState, useCallback, useEffect } from "react"
import { useToast } from "./use-toast"

const API_BASE_URL = "https://translogitrack-server-production.up.railway.app/api/pedidos"
const TOKEN_KEY = "translogitrack_token"

const usePedidos = () => {
  const [pedidos, setPedidos] = useState([])
  const [pedidosOriginales, setPedidosOriginales] = useState([]) // Guardar todos los pedidos
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const { toast } = useToast()

  // Función para obtener el token del localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  }

  // Función para construir los headers con el token
  const getHeaders = useCallback(() => {
    const token = getToken()
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }
  }, [])

  // Función para manejar errores de autenticación
  const handleAuthError = (response) => {
    if (response.status === 401 || response.status === 403) {
      console.warn("Token expirado o inválido, redirigiendo al login...")
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = "/login"
      return true
    }
    return false
  }

  // Función para limpiar errores
  const limpiarError = useCallback(() => {
    setError(null)
  }, [])

  // Función para filtrar pedidos en el frontend
  const filtrarPedidos = useCallback((todosPedidos, filtros) => {
    let pedidosFiltrados = [...todosPedidos]

    // Filtrar por cliente
    if (filtros.id_cliente) {
      const clienteId = Number.parseInt(filtros.id_cliente)
      pedidosFiltrados = pedidosFiltrados.filter((p) => {
        // Intentar múltiples formas de identificar al cliente
        const pedidoClienteId =
          p.id_cliente ||
          p.cliente?.id_usuario ||
          p.cliente?.id ||
          p.id_usuario ||
          p.usuario?.id_usuario ||
          p.usuario?.id

        console.log(`🔍 Comparando pedido ${p.id_pedido}: cliente=${pedidoClienteId} vs filtro=${clienteId}`)
        return pedidoClienteId === clienteId
      })
      console.log(`📦 Filtrados ${pedidosFiltrados.length} pedidos para cliente ${filtros.id_cliente}`)
    }

    // Filtrar por estado
    if (filtros.estado) {
      pedidosFiltrados = pedidosFiltrados.filter((p) => p.estado === filtros.estado)
    }

    // Filtrar por fechas
    if (filtros.fechaInicio) {
      const fechaInicio = new Date(filtros.fechaInicio)
      pedidosFiltrados = pedidosFiltrados.filter((p) => new Date(p.fecha_creacion) >= fechaInicio)
    }

    if (filtros.fechaFin) {
      const fechaFin = new Date(filtros.fechaFin)
      fechaFin.setHours(23, 59, 59, 999) // Incluir todo el día
      pedidosFiltrados = pedidosFiltrados.filter((p) => new Date(p.fecha_creacion) <= fechaFin)
    }

    return pedidosFiltrados
  }, [])

  // Función principal para listar pedidos
  const listarPedidos = useCallback(
    async (filtros = {}) => {
      setLoading(true)
      setError(null)

      try {
        // Construir query parameters
        const queryParams = new URLSearchParams()
        if (filtros.page) queryParams.append("page", filtros.page.toString())
        if (filtros.limit) queryParams.append("limit", filtros.limit.toString())
        if (filtros.estado) queryParams.append("estado", filtros.estado)
        if (filtros.fechaInicio) queryParams.append("fechaInicio", filtros.fechaInicio)
        if (filtros.fechaFin) queryParams.append("fechaFin", filtros.fechaFin)

        // Obtener el ID del cliente del usuario actual si está disponible
        const userIdFromStorage = localStorage.getItem("user_id")
        const clienteId = filtros.id_cliente || userIdFromStorage

        // Añadir id_cliente a los parámetros si existe
        if (clienteId) {
          queryParams.append("id_cliente", clienteId)
          console.log(`🔍 Añadiendo id_cliente=${clienteId} a la consulta`)
        }

        const url = `${API_BASE_URL}?${queryParams.toString()}`
        console.log("🔗 URL:", url)

        const response = await fetch(url, {
          method: "GET",
          headers: getHeaders(),
        })

        // Manejar error de autenticación
        if (handleAuthError(response)) {
          return { success: false, error: "Error de autenticación" }
        }

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || `Error HTTP: ${response.status}`)
        }

        const data = await response.json()
        console.log("📥 Respuesta del servidor:", data)

        // Validar estructura de respuesta
        if (!data.pedidos || !Array.isArray(data.pedidos)) {
          throw new Error("Estructura de respuesta inválida: falta array de pedidos")
        }

        // Usar los pedidos tal como vienen de la API
        const pedidosRecibidos = data.pedidos
        console.log(`✅ Pedidos recibidos: ${pedidosRecibidos.length}`)

        // Mostrar información de cada pedido para debug
        pedidosRecibidos.forEach((p) => {
          console.log(`📦 Pedido #${p.id_pedido}: cliente=${p.id_cliente || p.cliente?.id_usuario}, estado=${p.estado}`)
        })

        setPedidos(pedidosRecibidos)
        setTotal(data.total || pedidosRecibidos.length)
        setPaginaActual(data.pagina || 1)
        setTotalPaginas(
          data.totalPaginas || Math.ceil((data.total || pedidosRecibidos.length) / (data.porPagina || 10)),
        )
        setIsUsingMockData(false)

        return { success: true, data: pedidosRecibidos }
      } catch (err) {
        console.error("❌ Error al listar pedidos:", err.message)
        const errorMessage = err.message || "Error al cargar pedidos"
        setError(errorMessage)

        // Usar datos mock en caso de error
        const mockPedidos = generarDatosMock(filtros)
        setPedidos(mockPedidos)
        setTotal(mockPedidos.length)
        setIsUsingMockData(true)

        toast({
          title: "Advertencia",
          description: "Usando datos de ejemplo. " + errorMessage,
          variant: "destructive",
        })

        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [getHeaders, toast],
  )

  // Función refetch simplificada
  const refetch = useCallback(async () => {
    console.log("🔄 Refetch: Recargando pedidos...")
    // Intentar obtener el ID del usuario actual
    const userIdFromStorage = localStorage.getItem("user_id")
    const userRoleFromStorage = localStorage.getItem("user_role")

    console.log(`🔍 Refetch con: userId=${userIdFromStorage}, role=${userRoleFromStorage}`)

    // Si es cliente, filtrar por su ID
    if (userRoleFromStorage === "Cliente") {
      await listarPedidos({ id_cliente: userIdFromStorage })
    } else {
      // Para admin y operador, cargar todos
      await listarPedidos()
    }
  }, [listarPedidos])

  const obtenerPedido = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)

      try {
        console.log("🔍 Obteniendo pedido ID:", id)

        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: "GET",
          headers: getHeaders(),
        })

        if (handleAuthError(response)) {
          return { success: false, error: "Error de autenticación" }
        }

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || `Error HTTP: ${response.status}`)
        }

        const pedido = await response.json()
        console.log("✅ Pedido obtenido:", pedido)

        return { success: true, data: pedido }
      } catch (err) {
        console.error("❌ Error al obtener pedido:", err.message)
        const errorMessage = err.message || "Error al obtener pedido"
        setError(errorMessage)

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })

        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [getHeaders, toast],
  )

  const crearPedido = useCallback(
    async (pedidoData) => {
      setLoading(true)
      setError(null)

      try {
        console.log("📝 Creando pedido:", pedidoData)

        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(pedidoData),
        })

        if (handleAuthError(response)) {
          return { success: false, error: "Error de autenticación" }
        }

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || `Error HTTP: ${response.status}`)
        }

        const nuevoPedido = await response.json()
        setPedidos((prevPedidos) => [nuevoPedido, ...prevPedidos])
        setPedidosOriginales((prevPedidos) => [nuevoPedido, ...prevPedidos])
        setTotal((prevTotal) => prevTotal + 1)

        console.log("✅ Pedido creado:", nuevoPedido)

        toast({
          title: "¡Éxito!",
          description: "Pedido creado correctamente",
        })

        return { success: true, data: nuevoPedido }
      } catch (err) {
        console.error("❌ Error al crear pedido:", err.message)
        const errorMessage = err.message || "Error al crear pedido"
        setError(errorMessage)

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })

        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [getHeaders, toast],
  )

  // Función para cambiar página
  const cambiarPagina = useCallback(
    async (nuevaPagina, filtros = {}) => {
      await listarPedidos({ ...filtros, page: nuevaPagina })
    },
    [listarPedidos],
  )

  // Función para recargar datos
  const recargarDatos = useCallback(() => {
    listarPedidos()
  }, [listarPedidos])

  // Función para usar datos mock
  const useMockData = useCallback(() => {
    const mockPedidos = generarDatosMock()
    setPedidos(mockPedidos)
    setTotal(mockPedidos.length)
    setIsUsingMockData(true)
    setError(null)

    toast({
      title: "Datos de ejemplo cargados",
      description: "Se han cargado datos de ejemplo para demostración",
    })
  }, [toast])

  // Función para generar datos mock
  const generarDatosMock = (filtros = {}) => {
    const estados = ["Pendiente", "En tránsito", "Entregado", "Cancelado"]
    const clientes = [
      { id_usuario: 1, nombre_completo: "Juan Pérez" },
      { id_usuario: 2, nombre_completo: "María García" },
      { id_usuario: 3, nombre_completo: "Carlos López" },
    ]
    const rutas = [
      { origen: "Lima", destino: "Arequipa", distancia_km: 1009 },
      { origen: "Lima", destino: "Trujillo", distancia_km: 558 },
      { origen: "Cusco", destino: "Lima", distancia_km: 1165 },
    ]

    let mockPedidos = Array.from({ length: 15 }, (_, index) => ({
      id_pedido: index + 1,
      id_cliente: clientes[index % clientes.length].id_usuario,
      cliente: clientes[index % clientes.length],
      ruta: rutas[index % rutas.length],
      estado: estados[index % estados.length],
      fecha_creacion: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      fecha_entrega_estimada: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      precio: Math.floor(Math.random() * 500) + 100,
      nro_guia: `TLT${String(index + 1).padStart(6, "0")}`,
      observaciones: index % 3 === 0 ? "Entrega urgente" : null,
    }))

    // Aplicar filtros si existen
    if (filtros.id_cliente) {
      mockPedidos = mockPedidos.filter((p) => p.id_cliente === Number.parseInt(filtros.id_cliente))
    }
    if (filtros.estado) {
      mockPedidos = mockPedidos.filter((p) => p.estado === filtros.estado)
    }

    return mockPedidos
  }

  // Cargar pedidos automáticamente al montar el componente
  useEffect(() => {
    console.log("🚀 usePedidos: Cargando pedidos automáticamente...")
    listarPedidos()
  }, [listarPedidos])

  return {
    pedidos,
    loading,
    error,
    total,
    paginaActual,
    totalPaginas,
    isUsingMockData,
    listarPedidos,
    obtenerPedido,
    crearPedido,
    cambiarPagina,
    limpiarError,
    recargarDatos,
    useMockData,
    refetch, // Añadir refetch al return
  }
}

export { usePedidos }

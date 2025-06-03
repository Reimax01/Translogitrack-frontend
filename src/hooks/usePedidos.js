"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

// URL base de la API
const API_BASE_URL = "https://translogitrack-server-production.up.railway.app/api/pedidos"
const TOKEN_KEY = "translogitrack_token"

/**
 * Hook personalizado para gestionar pedidos
 * @returns {Object} Estados y funciones para gestionar pedidos
 */
export function usePedidos() {
  // Estados del hook
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [paginaActual, setPaginaActual] = useState(1)
  const [total, setTotal] = useState(0)

  /**
   * Función para obtener headers de autorización
   * @returns {Object} Headers con token de autorización
   */
  const getHeaders = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }, [])

  /**
   * Función para manejar errores de autenticación
   * @param {Response} response - Respuesta de fetch
   */
  const handleAuthError = useCallback((response) => {
    if (response.status === 401) {
      console.warn("Token expirado o inválido, redirigiendo a login...")
      window.location.replace("/login")
      return true
    }
    return false
  }, [])

  /**
   * Función para validar fecha de entrega estimada
   * @param {string} fecha - Fecha en formato ISO
   * @returns {boolean} - True si es válida
   */
  const validarFechaEntrega = useCallback((fecha) => {
    if (!fecha) return false
    const fechaEntrega = new Date(fecha)
    const ahora = new Date()
    return fechaEntrega > ahora
  }, [])

  /**
   * Función para listar pedidos con filtros
   * @param {Object} filtros - Filtros a aplicar
   * @returns {Promise<void>}
   */
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
        if (filtros.id_cliente) queryParams.append("id_cliente", filtros.id_cliente)

        const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
          method: "GET",
          headers: getHeaders(),
        })

        // Manejar error de autenticación
        if (handleAuthError(response)) {
          return
        }

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || `Error HTTP: ${response.status}`)
        }

        const data = await response.json()

        // Validar estructura de respuesta
        if (!data.pedidos || !Array.isArray(data.pedidos)) {
          throw new Error("Estructura de respuesta inválida: falta array de pedidos")
        }

        setPedidos(data.pedidos)
        setTotal(data.total || 0)
        setPaginaActual(data.pagina || 1)
        setTotalPaginas(Math.ceil((data.total || 0) / (data.porPagina || 10)))

        console.log("✅ Pedidos cargados:", data.pedidos.length)
      } catch (err) {
        console.error("❌ Error al listar pedidos:", err.message)
        const errorMessage = err.message || "Error al cargar pedidos"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [getHeaders, handleAuthError],
  )

  /**
   * Función para obtener un pedido por ID
   * @param {number} id - ID del pedido
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const obtenerPedido = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
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

        const pedido = await response.json()
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
    [getHeaders, handleAuthError],
  )

  /**
   * Función para crear un nuevo pedido
   * @param {Object} data - Datos del pedido
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const crearPedido = useCallback(
    async (data) => {
      setLoading(true)
      setError(null)

      try {
        // Validaciones
        if (!data.id_ruta || !data.id_camion || !data.id_conductor) {
          throw new Error("Ruta, camión y conductor son obligatorios")
        }

        if (!validarFechaEntrega(data.fecha_entrega_estimada)) {
          throw new Error("La fecha de entrega estimada debe ser posterior a la fecha actual")
        }

        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })

        // Manejar error de autenticación
        if (handleAuthError(response)) {
          return { success: false, error: "Error de autenticación" }
        }

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || `Error HTTP: ${response.status}`)
        }

        const result = await response.json()
        console.log("✅ Pedido creado:", result.id_pedido)

        toast({
          title: "Pedido creado",
          description: "El pedido se ha creado exitosamente",
        })

        // Refrescar lista
        await listarPedidos({ page: paginaActual })

        return { success: true, data: result }
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
    [getHeaders, handleAuthError, validarFechaEntrega, listarPedidos, paginaActual],
  )

  /**
   * Función para actualizar un pedido
   * @param {number} id - ID del pedido
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const actualizarPedido = useCallback(
    async (id, data) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(data),
        })

        // Manejar error de autenticación
        if (handleAuthError(response)) {
          return { success: false, error: "Error de autenticación" }
        }

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || `Error HTTP: ${response.status}`)
        }

        const result = await response.json()
        console.log("✅ Pedido actualizado:", result.id_pedido)

        toast({
          title: "Pedido actualizado",
          description: "Los cambios se han guardado correctamente",
        })

        // Refrescar lista
        await listarPedidos({ page: paginaActual })

        return { success: true, data: result }
      } catch (err) {
        console.error("❌ Error al actualizar pedido:", err.message)
        const errorMessage = err.message || "Error al actualizar pedido"
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
    [getHeaders, handleAuthError, listarPedidos, paginaActual],
  )

  /**
   * Función para eliminar un pedido (solo si está en estado Pendiente)
   * @param {number} id - ID del pedido
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const eliminarPedido = useCallback(
    async (id) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: "DELETE",
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

        console.log("✅ Pedido eliminado:", id)

        toast({
          title: "Pedido eliminado",
          description: "El pedido ha sido eliminado correctamente",
        })

        // Refrescar lista
        await listarPedidos({ page: paginaActual })

        return { success: true }
      } catch (err) {
        console.error("❌ Error al eliminar pedido:", err.message)
        const errorMessage = err.message || "Error al eliminar pedido"
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
    [getHeaders, handleAuthError, listarPedidos, paginaActual],
  )

  /**
   * Función para actualizar ubicación de un pedido
   * @param {number} id - ID del pedido
   * @param {Object} ubicacion - Coordenadas de ubicación
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const actualizarUbicacion = useCallback(
    async (id, ubicacion) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/${id}/ubicacion`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(ubicacion),
        })

        // Manejar error de autenticación
        if (handleAuthError(response)) {
          return { success: false, error: "Error de autenticación" }
        }

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || `Error HTTP: ${response.status}`)
        }

        console.log("✅ Ubicación actualizada para pedido:", id)

        toast({
          title: "Ubicación actualizada",
          description: "La ubicación del pedido se ha actualizado correctamente",
        })

        return { success: true }
      } catch (err) {
        console.error("❌ Error al actualizar ubicación:", err.message)
        const errorMessage = err.message || "Error al actualizar ubicación"
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
    [getHeaders, handleAuthError],
  )

  /**
   * Función para cambiar página
   * @param {number} nuevaPagina - Nueva página
   * @param {Object} filtros - Filtros actuales
   * @returns {Promise<void>}
   */
  const cambiarPagina = useCallback(
    async (nuevaPagina, filtros = {}) => {
      await listarPedidos({ ...filtros, page: nuevaPagina })
    },
    [listarPedidos],
  )

  /**
   * Función para limpiar errores
   */
  const limpiarError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Función para recargar datos
   */
  const recargarDatos = useCallback(() => {
    listarPedidos({ page: paginaActual })
  }, [listarPedidos, paginaActual])

  // Cargar pedidos inicialmente
  useEffect(() => {
    listarPedidos()
  }, [listarPedidos])

  return {
    // Estados
    pedidos,
    loading,
    error,
    totalPaginas,
    paginaActual,
    total,

    // Funciones CRUD
    listarPedidos,
    obtenerPedido,
    crearPedido,
    actualizarPedido,
    eliminarPedido,
    actualizarUbicacion,

    // Funciones auxiliares
    cambiarPagina,
    limpiarError,
    recargarDatos,
    validarFechaEntrega,
  }
}

export default usePedidos

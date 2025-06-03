"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

// URL base de la API
const API_BASE_URL = "https://translogitrack-server-production.up.railway.app/api/rutas"
const TOKEN_KEY = "translogitrack_token"

/**
 * Hook personalizado para gestionar rutas
 * @returns {Object} Estados y funciones para gestionar rutas
 */
export function useRutas() {
  // Estados del hook
  const [rutas, setRutas] = useState([])
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
   * Función para validar distancia
   * @param {number} distancia - Distancia en km
   * @returns {boolean} - True si es válida
   */
  const validarDistancia = useCallback((distancia) => {
    return distancia && distancia > 0
  }, [])

  /**
   * Función para validar tiempo estimado
   * @param {number} tiempo - Tiempo en minutos
   * @returns {boolean} - True si es válido
   */
  const validarTiempoEstimado = useCallback((tiempo) => {
    return !tiempo || (tiempo > 0 && tiempo < 10000) // Máximo ~7 días
  }, [])

  /**
   * Función para verificar si una ruta es única
   * @param {string} origen - Origen de la ruta
   * @param {string} destino - Destino de la ruta
   * @param {number} excludeId - ID a excluir de la verificación
   * @returns {boolean} - True si es única
   */
  const verificarRutaUnica = useCallback(
    (origen, destino, excludeId = null) => {
      return !rutas.some((ruta) => ruta.origen === origen && ruta.destino === destino && ruta.id_ruta !== excludeId)
    },
    [rutas],
  )

  /**
   * Función para listar rutas con filtros
   * @param {Object} filtros - Filtros a aplicar
   * @returns {Promise<void>}
   */
  const listarRutas = useCallback(
    async (filtros = {}) => {
      setLoading(true)
      setError(null)

      try {
        // Construir query parameters
        const queryParams = new URLSearchParams()
        if (filtros.page) queryParams.append("page", filtros.page.toString())
        if (filtros.limit) queryParams.append("limit", filtros.limit.toString())

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
        if (!data.rutas || !Array.isArray(data.rutas)) {
          throw new Error("Estructura de respuesta inválida: falta array de rutas")
        }

        setRutas(data.rutas)
        setTotal(data.total || 0)
        setPaginaActual(data.pagina || 1)
        setTotalPaginas(Math.ceil((data.total || 0) / (data.porPagina || 10)))

        console.log("✅ Rutas cargadas:", data.rutas.length)
      } catch (err) {
        console.error("❌ Error al listar rutas:", err.message)
        const errorMessage = err.message || "Error al cargar rutas"
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
   * Función para obtener una ruta por ID
   * @param {number} id - ID de la ruta
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const obtenerRuta = useCallback(
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

        const ruta = await response.json()
        return { success: true, data: ruta }
      } catch (err) {
        console.error("❌ Error al obtener ruta:", err.message)
        const errorMessage = err.message || "Error al obtener ruta"
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
   * Función para crear una nueva ruta
   * @param {Object} data - Datos de la ruta
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const crearRuta = useCallback(
    async (data) => {
      setLoading(true)
      setError(null)

      try {
        // Validaciones
        if (!data.origen || !data.destino) {
          throw new Error("El origen y destino son obligatorios")
        }

        if (!validarDistancia(data.distancia_km)) {
          throw new Error("La distancia debe ser un número positivo")
        }

        if (!validarTiempoEstimado(data.tiempo_estimado_min)) {
          throw new Error("El tiempo estimado debe ser un número positivo")
        }

        if (!verificarRutaUnica(data.origen, data.destino)) {
          throw new Error("Ya existe una ruta con el mismo origen y destino")
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
        console.log("✅ Ruta creada:", result.id_ruta)

        toast({
          title: "Ruta creada",
          description: `Ruta de ${data.origen} a ${data.destino} creada exitosamente`,
        })

        // Refrescar lista
        await listarRutas({ page: paginaActual })

        return { success: true, data: result }
      } catch (err) {
        console.error("❌ Error al crear ruta:", err.message)
        const errorMessage = err.message || "Error al crear ruta"
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
    [
      getHeaders,
      handleAuthError,
      validarDistancia,
      validarTiempoEstimado,
      verificarRutaUnica,
      listarRutas,
      paginaActual,
    ],
  )

  /**
   * Función para actualizar una ruta
   * @param {number} id - ID de la ruta
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const actualizarRuta = useCallback(
    async (id, data) => {
      setLoading(true)
      setError(null)

      try {
        // Validaciones
        if (!data.origen || !data.destino) {
          throw new Error("El origen y destino son obligatorios")
        }

        if (!validarDistancia(data.distancia_km)) {
          throw new Error("La distancia debe ser un número positivo")
        }

        if (!validarTiempoEstimado(data.tiempo_estimado_min)) {
          throw new Error("El tiempo estimado debe ser un número positivo")
        }

        if (!verificarRutaUnica(data.origen, data.destino, id)) {
          throw new Error("Ya existe otra ruta con el mismo origen y destino")
        }

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
        console.log("✅ Ruta actualizada:", result.id_ruta)

        toast({
          title: "Ruta actualizada",
          description: "Los cambios se han guardado correctamente",
        })

        // Refrescar lista
        await listarRutas({ page: paginaActual })

        return { success: true, data: result }
      } catch (err) {
        console.error("❌ Error al actualizar ruta:", err.message)
        const errorMessage = err.message || "Error al actualizar ruta"
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
    [
      getHeaders,
      handleAuthError,
      validarDistancia,
      validarTiempoEstimado,
      verificarRutaUnica,
      listarRutas,
      paginaActual,
    ],
  )

  /**
   * Función para eliminar una ruta
   * @param {number} id - ID de la ruta
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const eliminarRuta = useCallback(
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

        console.log("✅ Ruta eliminada:", id)

        toast({
          title: "Ruta eliminada",
          description: "La ruta ha sido eliminada correctamente",
        })

        // Refrescar lista
        await listarRutas({ page: paginaActual })

        return { success: true }
      } catch (err) {
        console.error("❌ Error al eliminar ruta:", err.message)
        const errorMessage = err.message || "Error al eliminar ruta"
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
    [getHeaders, handleAuthError, listarRutas, paginaActual],
  )

  /**
   * Función para cambiar página
   * @param {number} nuevaPagina - Nueva página
   * @param {Object} filtros - Filtros actuales
   * @returns {Promise<void>}
   */
  const cambiarPagina = useCallback(
    async (nuevaPagina, filtros = {}) => {
      await listarRutas({ ...filtros, page: nuevaPagina })
    },
    [listarRutas],
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
    listarRutas({ page: paginaActual })
  }, [listarRutas, paginaActual])

  /**
   * Función para formatear tiempo en minutos a formato legible
   * @param {number} minutos - Tiempo en minutos
   * @returns {string} - Tiempo formateado
   */
  const formatearTiempo = useCallback((minutos) => {
    if (!minutos) return "N/A"

    const horas = Math.floor(minutos / 60)
    const minutosRestantes = minutos % 60

    if (horas === 0) {
      return `${minutosRestantes} min`
    } else {
      return `${horas}h ${minutosRestantes}min`
    }
  }, [])

  // Cargar rutas inicialmente
  useEffect(() => {
    listarRutas()
  }, [listarRutas])

  return {
    // Estados
    rutas,
    loading,
    error,
    totalPaginas,
    paginaActual,
    total,

    // Funciones CRUD
    listarRutas,
    obtenerRuta,
    crearRuta,
    actualizarRuta,
    eliminarRuta,

    // Funciones auxiliares
    cambiarPagina,
    limpiarError,
    recargarDatos,
    validarDistancia,
    validarTiempoEstimado,
    verificarRutaUnica,
    formatearTiempo,
  }
}

export default useRutas

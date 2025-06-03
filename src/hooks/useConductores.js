"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

// URL base de la API
const API_BASE_URL = "https://translogitrack-server-production.up.railway.app/api/conductores"
const TOKEN_KEY = "translogitrack_token"

/**
 * Hook personalizado para gestionar conductores
 * @returns {Object} Estados y funciones para gestionar conductores
 */
export function useConductores() {
  // Estados del hook
  const [conductores, setConductores] = useState([])
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
   * Función para validar formato de licencia
   * @param {string} licencia - Número de licencia
   * @returns {boolean} - True si es válida
   */
  const validarLicencia = useCallback((licencia) => {
    const pattern = /^[A-Z0-9-]+$/
    return pattern.test(licencia) && licencia.length >= 5
  }, [])

  /**
   * Función para verificar si una licencia es única
   * @param {string} licencia - Número de licencia
   * @param {number} excludeId - ID a excluir de la verificación
   * @returns {boolean} - True si es única
   */
  const verificarLicenciaUnica = useCallback(
    (licencia, excludeId = null) => {
      return !conductores.some(
        (conductor) => conductor.numero_licencia === licencia && conductor.id_conductor !== excludeId,
      )
    },
    [conductores],
  )

  /**
   * Función para listar conductores con filtros
   * @param {Object} filtros - Filtros a aplicar
   * @returns {Promise<void>}
   */
  const listarConductores = useCallback(
    async (filtros = {}) => {
      setLoading(true)
      setError(null)

      try {
        // Construir query parameters
        const queryParams = new URLSearchParams()
        if (filtros.page) queryParams.append("page", filtros.page.toString())
        if (filtros.activo !== undefined) queryParams.append("activo", filtros.activo.toString())
        if (filtros.tipo_licencia) queryParams.append("tipo_licencia", filtros.tipo_licencia)

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
        if (!data.conductores || !Array.isArray(data.conductores)) {
          throw new Error("Estructura de respuesta inválida: falta array de conductores")
        }

        setConductores(data.conductores)
        setTotal(data.total || 0)
        setPaginaActual(data.pagina || 1)
        setTotalPaginas(Math.ceil((data.total || 0) / (data.porPagina || 10)))

        console.log("✅ Conductores cargados:", data.conductores.length)
      } catch (err) {
        console.error("❌ Error al listar conductores:", err.message)
        const errorMessage = err.message || "Error al cargar conductores"
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
   * Función para crear un nuevo conductor
   * @param {Object} data - Datos del conductor
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const crearConductor = useCallback(
    async (data) => {
      setLoading(true)
      setError(null)

      try {
        // Validaciones
        if (!validarLicencia(data.numero_licencia)) {
          throw new Error("Formato de licencia inválido. Use solo letras, números y guiones.")
        }

        if (!verificarLicenciaUnica(data.numero_licencia)) {
          throw new Error("El número de licencia ya existe en el sistema")
        }

        const fechaVencimiento = new Date(data.fecha_vencimiento_licencia)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)

        if (fechaVencimiento <= hoy) {
          throw new Error("La fecha de vencimiento debe ser posterior a hoy")
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
        console.log("✅ Conductor creado:", result.id_conductor)

        toast({
          title: "Conductor creado",
          description: `${data.nombre_completo} ha sido registrado exitosamente`,
        })

        // Refrescar lista
        await listarConductores({ page: paginaActual })

        return { success: true, data: result }
      } catch (err) {
        console.error("❌ Error al crear conductor:", err.message)
        const errorMessage = err.message || "Error al crear conductor"
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
    [getHeaders, handleAuthError, validarLicencia, verificarLicenciaUnica, listarConductores, paginaActual],
  )

  /**
   * Función para actualizar un conductor
   * @param {number} id - ID del conductor
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const actualizarConductor = useCallback(
    async (id, data) => {
      setLoading(true)
      setError(null)

      try {
        // Validaciones
        if (!validarLicencia(data.numero_licencia)) {
          throw new Error("Formato de licencia inválido. Use solo letras, números y guiones.")
        }

        if (!verificarLicenciaUnica(data.numero_licencia, id)) {
          throw new Error("El número de licencia ya existe en el sistema")
        }

        const fechaVencimiento = new Date(data.fecha_vencimiento_licencia)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)

        if (fechaVencimiento <= hoy) {
          throw new Error("La fecha de vencimiento debe ser posterior a hoy")
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
        console.log("✅ Conductor actualizado:", result.id_conductor)

        toast({
          title: "Conductor actualizado",
          description: "Los cambios se han guardado correctamente",
        })

        // Refrescar lista
        await listarConductores({ page: paginaActual })

        return { success: true, data: result }
      } catch (err) {
        console.error("❌ Error al actualizar conductor:", err.message)
        const errorMessage = err.message || "Error al actualizar conductor"
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
    [getHeaders, handleAuthError, validarLicencia, verificarLicenciaUnica, listarConductores, paginaActual],
  )

  /**
   * Función para desactivar un conductor
   * @param {number} id - ID del conductor
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const desactivarConductor = useCallback(
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

        console.log("✅ Conductor desactivado:", id)

        toast({
          title: "Conductor desactivado",
          description: "El conductor ha sido desactivado correctamente",
        })

        // Refrescar lista
        await listarConductores({ page: paginaActual })

        return { success: true }
      } catch (err) {
        console.error("❌ Error al desactivar conductor:", err.message)
        const errorMessage = err.message || "Error al desactivar conductor"
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
    [getHeaders, handleAuthError, listarConductores, paginaActual],
  )

  /**
   * Función para cambiar página
   * @param {number} nuevaPagina - Nueva página
   * @param {Object} filtros - Filtros actuales
   * @returns {Promise<void>}
   */
  const cambiarPagina = useCallback(
    async (nuevaPagina, filtros = {}) => {
      await listarConductores({ ...filtros, page: nuevaPagina })
    },
    [listarConductores],
  )

  /**
   * Función para limpiar errores
   */
  const limpiarError = useCallback(() => {
    setError(null)
  }, [])

  // Cargar conductores inicialmente
  useEffect(() => {
    listarConductores()
  }, [listarConductores])

  return {
    // Estados
    conductores,
    loading,
    error,
    totalPaginas,
    paginaActual,
    total,

    // Funciones CRUD
    listarConductores,
    crearConductor,
    actualizarConductor,
    desactivarConductor,

    // Funciones auxiliares
    cambiarPagina,
    limpiarError,
    validarLicencia,
    verificarLicenciaUnica,
  }
}

export default useConductores

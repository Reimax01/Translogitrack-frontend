"use client"

import { useState, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

// URL base de la API
const API_BASE_URL = "https://translogitrack-server-production.up.railway.app/api"

/**
 * Hook personalizado para gestionar mantenimiento de camiones
 * @returns {Object} Estados y funciones para gestionar mantenimiento
 */
export function useMantenimiento() {
  // Estados del hook
  const [historialMantenimiento, setHistorialMantenimiento] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Función para obtener headers de autorización
   * @returns {Object} Headers con token de autorización
   */
  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("translogitrack_token")
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
   * Función para obtener historial de mantenimiento de un camión
   * @param {number} camionId - ID del camión
   * @returns {Promise<Array>} - Historial de mantenimiento
   */
  const obtenerHistorialMantenimiento = useCallback(
    async (camionId) => {
      if (!camionId) {
        throw new Error("ID del camión es requerido")
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/camiones/${camionId}/historial-mantenimientos`, {
          method: "GET",
          headers: getHeaders(),
        })

        // Manejar error de autenticación
        if (handleAuthError(response)) {
          return []
        }

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || `Error HTTP: ${response.status}`)
        }

        const data = await response.json()
        const historialData = Array.isArray(data) ? data : data.mantenimientos || []

        // Ordenar por fecha de inicio descendente
        historialData.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))

        setHistorialMantenimiento(historialData)
        console.log("✅ Historial de mantenimiento cargado:", historialData.length, "registros")

        return historialData
      } catch (err) {
        console.error("❌ Error al obtener historial de mantenimiento:", err.message)
        const errorMessage = err.message || "Error al cargar historial de mantenimiento"
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        return []
      } finally {
        setLoading(false)
      }
    },
    [getHeaders, handleAuthError],
  )

  /**
   * Función para crear un nuevo mantenimiento
   * @param {number} camionId - ID del camión
   * @param {Object} mantenimiento - Datos del mantenimiento
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const crearMantenimiento = useCallback(
    async (camionId, mantenimiento) => {
      if (!camionId) {
        throw new Error("ID del camión es requerido")
      }

      setLoading(true)
      setError(null)

      try {
        // Validaciones
        if (!mantenimiento.tipo || !["preventivo", "correctivo"].includes(mantenimiento.tipo)) {
          throw new Error("Tipo de mantenimiento inválido")
        }

        if (!mantenimiento.descripcion || mantenimiento.descripcion.trim().length < 10) {
          throw new Error("La descripción debe tener al menos 10 caracteres")
        }

        if (!mantenimiento.fecha_inicio) {
          throw new Error("La fecha de inicio es requerida")
        }

        const fechaInicio = new Date(mantenimiento.fecha_inicio)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)

        if (fechaInicio < hoy) {
          throw new Error("La fecha de inicio no puede ser anterior a hoy")
        }

        const response = await fetch(`${API_BASE_URL}/camiones/${camionId}/mantenimientos`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(mantenimiento),
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
        console.log("✅ Mantenimiento creado:", result.id_mantenimiento)

        // Mensaje personalizado según tipo de mantenimiento
        const mensajes = {
          preventivo: "Mantenimiento preventivo programado correctamente",
          correctivo: "Mantenimiento correctivo programado correctamente",
        }

        toast({
          title: "Mantenimiento programado",
          description: mensajes[mantenimiento.tipo] || "Mantenimiento programado correctamente",
        })

        // Refrescar historial
        await obtenerHistorialMantenimiento(camionId)

        return { success: true, data: result }
      } catch (err) {
        console.error("❌ Error al crear mantenimiento:", err.message)
        const errorMessage = err.message || "Error al programar mantenimiento"
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
    [getHeaders, handleAuthError, obtenerHistorialMantenimiento],
  )

  /**
   * Función para finalizar un mantenimiento
   * @param {number} mantenimientoId - ID del mantenimiento
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const finalizarMantenimiento = useCallback(
    async (mantenimientoId) => {
      if (!mantenimientoId) {
        throw new Error("ID del mantenimiento es requerido")
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/mantenimientos/${mantenimientoId}/finalizar`, {
          method: "PUT",
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

        console.log("✅ Mantenimiento finalizado:", mantenimientoId)

        toast({
          title: "Mantenimiento finalizado",
          description: "El mantenimiento se ha completado correctamente",
        })

        return { success: true }
      } catch (err) {
        console.error("❌ Error al finalizar mantenimiento:", err.message)
        const errorMessage = err.message || "Error al finalizar mantenimiento"
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
   * Función para obtener estadísticas del historial
   * @param {Array} historialData - Datos del historial
   * @returns {Object} - Estadísticas
   */
  const obtenerEstadisticas = useCallback(
    (historialData = historialMantenimiento) => {
      const stats = {
        total: historialData.length,
        preventivos: historialData.filter((m) => m.tipo === "preventivo").length,
        correctivos: historialData.filter((m) => m.tipo === "correctivo").length,
        completados: historialData.filter((m) => m.fecha_fin).length,
        pendientes: historialData.filter((m) => !m.fecha_fin).length,
      }

      return stats
    },
    [historialMantenimiento],
  )

  /**
   * Función para limpiar errores
   */
  const limpiarError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Función para limpiar historial
   */
  const limpiarHistorial = useCallback(() => {
    setHistorialMantenimiento([])
  }, [])

  return {
    // Estados
    historialMantenimiento,
    loading,
    error,

    // Funciones principales
    obtenerHistorialMantenimiento,
    crearMantenimiento,
    finalizarMantenimiento,

    // Funciones auxiliares
    obtenerEstadisticas,
    limpiarError,
    limpiarHistorial,
  }
}

export default useMantenimiento

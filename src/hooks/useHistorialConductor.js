"use client"

import { useState, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

// URL base de la API
const API_BASE_URL = "https://translogitrack-server-production.up.railway.app/api/conductores"

/**
 * Hook personalizado para gestionar historial de conductores
 * @returns {Object} Estados y funciones para gestionar historial
 */
export function useHistorialConductor() {
  // Estados del hook
  const [historial, setHistorial] = useState([])
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
   * Función para obtener historial de un conductor
   * @param {number} conductorId - ID del conductor
   * @returns {Promise<Array>} - Historial del conductor
   */
  const obtenerHistorial = useCallback(
    async (conductorId) => {
      if (!conductorId) {
        throw new Error("ID del conductor es requerido")
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/${conductorId}/historial`, {
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
        const historialData = Array.isArray(data) ? data : data.historial || []
        
        // Ordenar por fecha descendente
        historialData.sort((a, b) => new Date(b.fecha_evento) - new Date(a.fecha_evento))

        setHistorial(historialData)
        console.log("✅ Historial cargado:", historialData.length, "eventos")

        return historialData
      } catch (err) {
        console.error("❌ Error al obtener historial:", err.message)
        const errorMessage = err.message || "Error al cargar historial"
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
   * Función para agregar un evento al historial
   * @param {number} conductorId - ID del conductor
   * @param {Object} evento - Datos del evento
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const agregarEvento = useCallback(
    async (conductorId, evento) => {
      if (!conductorId) {
        throw new Error("ID del conductor es requerido")
      }

      setLoading(true)
      setError(null)

      try {
        // Validaciones
        if (!evento.tipo_evento || !["sanción", "premio", "incidente"].includes(evento.tipo_evento)) {
          throw new Error("Tipo de evento inválido")
        }

        if (!evento.descripcion || evento.descripcion.trim().length < 10) {
          throw new Error("La descripción debe tener al menos 10 caracteres")
        }

        if (!evento.fecha_evento) {
          throw new Error("La fecha del evento es requerida")
        }

        const fechaEvento = new Date(evento.fecha_evento)
        const hoy = new Date()
        hoy.setHours(23, 59, 59, 999)

        if (fechaEvento > hoy) {
          throw new Error("La fecha del evento no puede ser futura")
        }

        const response = await fetch(`${API_BASE_URL}/${conductorId}/historial`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(evento),
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
        console.log("✅ Evento agregado:", result.id_historial)

        // Mensaje personalizado según tipo de evento
        const mensajes = {
          sanción: "Sanción registrada correctamente",
          premio: "Premio registrado correctamente",
          incidente: "Incidente registrado correctamente",
        }

        toast({
          title: "Evento registrado",
          description: mensajes[evento.tipo_evento] || "Evento registrado correctamente",
        })

        // Refrescar historial
        await obtenerHistorial(conductorId)

        return { success: true, data: result }
      } catch (err) {
        console.error("❌ Error al agregar evento:", err.message)
        const errorMessage = err.message || "Error al agregar evento"
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
    [getHeaders, handleAuthError, obtenerHistorial],
  )

  /**
   * Función para obtener estadísticas del historial
   * @param {Array} historialData - Datos del historial
   * @returns {Object} - Estadísticas
   */
  const obtenerEstadisticas = useCallback(
    (historialData = historial) => {
      const stats = {
        total: historialData.length,
        sanciones: historialData.filter((evento) => evento.tipo_evento === "sanción").length,
        premios: historialData.filter((evento) => evento.tipo_evento === "premio").length,
        incidentes: historialData.filter((evento) => evento.tipo_evento === "incidente").length,
      }

      return stats
    },
    [historial],
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
    setHistorial([])
  }, [])

  return {
    // Estados
    historial,
    loading,
    error,

    // Funciones principales
    obtenerHistorial,
    agregarEvento,

    // Funciones auxiliares
    obtenerEstadisticas,
    limpiarError,
    limpiarHistorial,
  }
}

export default useHistorialConductor

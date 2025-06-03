"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

// URL base de la API
const API_BASE_URL = "https://translogitrack-server-production.up.railway.app/api/camiones"
const TOKEN_KEY = "translogitrack_token"

/**
 * Hook personalizado para gestionar camiones
 * @returns {Object} Estados y funciones para gestionar camiones
 */
export function useCamiones() {
  // Estados del hook
  const [camiones, setCamiones] = useState([])
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
   * Función para validar formato de placa
   * @param {string} placa - Placa del camión
   * @returns {boolean} - True si es válida
   */
  const validarPlaca = useCallback((placa) => {
    const pattern = /^[A-Z0-9-]+$/
    return pattern.test(placa) && placa.length >= 6
  }, [])

  /**
   * Función para validar capacidad en kg
   * @param {number} capacidad - Capacidad en kg
   * @returns {boolean} - True si es válida
   */
  const validarCapacidad = useCallback((capacidad) => {
    return capacidad && capacidad > 0 && capacidad <= 50000 // Máximo 50 toneladas
  }, [])

  /**
   * Función para verificar si una placa es única
   * @param {string} placa - Placa del camión
   * @param {number} excludeId - ID a excluir de la verificación
   * @returns {boolean} - True si es única
   */
  const verificarPlacaUnica = useCallback(
    (placa, excludeId = null) => {
      return !camiones.some((camion) => camion.placa === placa && camion.id_camion !== excludeId)
    },
    [camiones],
  )

  /**
   * Función para listar camiones con filtros
   * @param {Object} filtros - Filtros a aplicar
   * @returns {Promise<void>}
   */
  const listarCamiones = useCallback(
    async (filtros = {}) => {
      setLoading(true)
      setError(null)

      try {
        // Construir query parameters
        const queryParams = new URLSearchParams()
        if (filtros.page) queryParams.append("page", filtros.page.toString())
        if (filtros.limit) queryParams.append("limit", filtros.limit.toString())
        if (filtros.estado) queryParams.append("estado", filtros.estado)
        if (filtros.activo !== undefined) queryParams.append("activo", filtros.activo.toString())

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
        if (!data.camiones || !Array.isArray(data.camiones)) {
          throw new Error("Estructura de respuesta inválida: falta array de camiones")
        }

        // Mapear datos de la API al formato esperado por el componente
        const camionesFormateados = data.camiones.map((camion) => ({
          id: camion.id_camion,
          placa: camion.placa,
          capacidad_kg: camion.capacidad_kg,
          estado: camion.estado_operativo,
          activo: camion.activo,
          km_actual: camion.km_actual,
          ubicacion_actual: camion.ubicacion_actual,
          // Campos para compatibilidad con la UI existente
          marca: "N/A", // No existe en el modelo backend
          modelo: "N/A", // No existe en el modelo backend
          año: "N/A", // No existe en el modelo backend
          conductor: "Sin asignar", // Se manejará por relaciones
          // Campos adicionales del API
          id_camion: camion.id_camion,
          estado_operativo: camion.estado_operativo,
          mantenimientos: camion.mantenimientos || [],
        }))

        setCamiones(camionesFormateados)
        setTotal(data.total || 0)
        setPaginaActual(data.pagina || 1)
        setTotalPaginas(Math.ceil((data.total || 0) / (data.porPagina || 10)))

        console.log("✅ Camiones cargados:", camionesFormateados.length)
      } catch (err) {
        console.error("❌ Error al listar camiones:", err.message)
        const errorMessage = err.message || "Error al cargar camiones"
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
   * Función para crear un nuevo camión
   * @param {Object} data - Datos del camión
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const crearCamion = useCallback(
    async (data) => {
      setLoading(true)
      setError(null)

      try {
        // Validaciones
        if (!validarPlaca(data.placa)) {
          throw new Error("Formato de placa inválido. Use solo letras, números y guiones.")
        }

        if (!validarCapacidad(data.capacidad_kg)) {
          throw new Error("La capacidad debe ser un número positivo menor a 50,000 kg")
        }

        if (!verificarPlacaUnica(data.placa)) {
          throw new Error("La placa ya existe en el sistema")
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
        console.log("✅ Camión creado:", result.id_camion)

        toast({
          title: "Camión creado",
          description: `${data.placa} ha sido registrado exitosamente`,
        })

        // Refrescar lista
        await listarCamiones({ page: paginaActual })

        return { success: true, data: result }
      } catch (err) {
        console.error("❌ Error al crear camión:", err.message)
        const errorMessage = err.message || "Error al crear camión"
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
    [getHeaders, handleAuthError, validarPlaca, validarCapacidad, verificarPlacaUnica, listarCamiones, paginaActual],
  )

  /**
   * Función para actualizar un camión
   * @param {number} id - ID del camión
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const actualizarCamion = useCallback(
    async (id, data) => {
      setLoading(true)
      setError(null)

      try {
        // Validaciones
        if (!validarPlaca(data.placa)) {
          throw new Error("Formato de placa inválido. Use solo letras, números y guiones.")
        }

        if (!validarCapacidad(data.capacidad_kg)) {
          throw new Error("La capacidad debe ser un número positivo menor a 50,000 kg")
        }

        if (!verificarPlacaUnica(data.placa, id)) {
          throw new Error("La placa ya existe en el sistema")
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
        console.log("✅ Camión actualizado:", result.id_camion)

        toast({
          title: "Camión actualizado",
          description: "Los cambios se han guardado correctamente",
        })

        // Refrescar lista
        await listarCamiones({ page: paginaActual })

        return { success: true, data: result }
      } catch (err) {
        console.error("❌ Error al actualizar camión:", err.message)
        const errorMessage = err.message || "Error al actualizar camión"
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
    [getHeaders, handleAuthError, validarPlaca, validarCapacidad, verificarPlacaUnica, listarCamiones, paginaActual],
  )

  /**
   * Función para crear mantenimiento
   * @param {number} camionId - ID del camión
   * @param {Object} data - Datos del mantenimiento
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const crearMantenimiento = useCallback(
    async (camionId, data) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/${camionId}/mantenimientos`, {
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
        console.log("✅ Mantenimiento creado:", result.id_mantenimiento)

        toast({
          title: "Mantenimiento programado",
          description: "El mantenimiento se ha registrado correctamente",
        })

        // Refrescar lista
        await listarCamiones({ page: paginaActual })

        return { success: true, data: result }
      } catch (err) {
        console.error("❌ Error al crear mantenimiento:", err.message)
        const errorMessage = err.message || "Error al crear mantenimiento"
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
    [getHeaders, handleAuthError, listarCamiones, paginaActual],
  )

  /**
   * Función para desactivar un camión (eliminación lógica)
   * @param {number} id - ID del camión
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const desactivarCamion = useCallback(
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

        console.log("✅ Camión desactivado:", id)

        toast({
          title: "Camión desactivado",
          description: "El camión ha sido desactivado correctamente",
        })

        // Refrescar lista
        await listarCamiones({ page: paginaActual })

        return { success: true }
      } catch (err) {
        console.error("❌ Error al desactivar camión:", err.message)
        const errorMessage = err.message || "Error al desactivar camión"
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
    [getHeaders, handleAuthError, listarCamiones, paginaActual],
  )

  /**
   * Función para cambiar página
   * @param {number} nuevaPagina - Nueva página
   * @param {Object} filtros - Filtros actuales
   * @returns {Promise<void>}
   */
  const cambiarPagina = useCallback(
    async (nuevaPagina, filtros = {}) => {
      await listarCamiones({ ...filtros, page: nuevaPagina })
    },
    [listarCamiones],
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
    listarCamiones({ page: paginaActual })
  }, [listarCamiones, paginaActual])

  // Cargar camiones inicialmente
  useEffect(() => {
    listarCamiones()
  }, [listarCamiones])

  return {
    // Estados
    camiones,
    loading,
    error,
    totalPaginas,
    paginaActual,
    total,

    // Funciones CRUD
    listarCamiones,
    crearCamion,
    actualizarCamion,
    crearMantenimiento,
    desactivarCamion,

    // Funciones auxiliares
    cambiarPagina,
    limpiarError,
    recargarDatos,
    validarPlaca,
    validarCapacidad,
    verificarPlacaUnica,
  }
}

export default useCamiones

"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

// URL base de la API
const API_BASE_URL = "https://translogitrack-server-production.up.railway.app/api/usuarios"
const TOKEN_KEY = "translogitrack_token"

/**
 * Hook personalizado para gestionar usuarios
 * @returns {Object} Estados y funciones para gestionar usuarios
 */
export function useUsuarios() {
  // Estados del hook
  const [usuarios, setUsuarios] = useState([])
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
   * Función para validar email
   * @param {string} email - Email a validar
   * @returns {boolean} - True si es válido
   */
  const validarEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  /**
   * Función para validar contraseña
   * @param {string} contrasena - Contraseña a validar
   * @returns {boolean} - True si es válida
   */
  const validarContrasena = useCallback((contrasena) => {
    return contrasena && contrasena.length >= 6
  }, [])

  /**
   * Función para verificar si un email es único
   * @param {string} email - Email a verificar
   * @param {number} excludeId - ID a excluir de la verificación
   * @returns {boolean} - True si es único
   */
  const verificarEmailUnico = useCallback(
    (email, excludeId = null) => {
      return !usuarios.some(
        (usuario) => usuario.correo_electronico === email.toLowerCase() && usuario.id_usuario !== excludeId,
      )
    },
    [usuarios],
  )

  /**
   * Función para listar usuarios con filtros
   * @param {Object} filtros - Filtros a aplicar
   * @returns {Promise<void>}
   */
  const listarUsuarios = useCallback(
    async (filtros = {}) => {
      setLoading(true)
      setError(null)

      try {
        // Construir query parameters
        const queryParams = new URLSearchParams()
        if (filtros.page) queryParams.append("page", filtros.page.toString())
        if (filtros.limit) queryParams.append("limit", filtros.limit.toString())
        if (filtros.rol) queryParams.append("rol", filtros.rol)

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
        if (!data.usuarios || !Array.isArray(data.usuarios)) {
          throw new Error("Estructura de respuesta inválida: falta array de usuarios")
        }

        setUsuarios(data.usuarios)
        setTotal(data.total || 0)
        setPaginaActual(data.pagina || 1)
        setTotalPaginas(Math.ceil((data.total || 0) / (data.porPagina || 10)))

        console.log("✅ Usuarios cargados:", data.usuarios.length)
      } catch (err) {
        console.error("❌ Error al listar usuarios:", err.message)
        const errorMessage = err.message || "Error al cargar usuarios"
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
   * Función para obtener un usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const obtenerUsuario = useCallback(
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

        const usuario = await response.json()
        return { success: true, data: usuario }
      } catch (err) {
        console.error("❌ Error al obtener usuario:", err.message)
        const errorMessage = err.message || "Error al obtener usuario"
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
   * Función para crear un nuevo usuario
   * @param {Object} data - Datos del usuario
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const crearUsuario = useCallback(
    async (data) => {
      setLoading(true)
      setError(null)

      try {
        // Validaciones
        if (!data.nombre_completo || !data.correo_electronico || !data.contrasena || !data.rol) {
          throw new Error("Todos los campos son obligatorios")
        }

        if (!validarEmail(data.correo_electronico)) {
          throw new Error("El formato del email no es válido")
        }

        if (!validarContrasena(data.contrasena)) {
          throw new Error("La contraseña debe tener al menos 6 caracteres")
        }

        if (!verificarEmailUnico(data.correo_electronico)) {
          throw new Error("El correo electrónico ya está registrado")
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
        console.log("✅ Usuario creado:", result.id_usuario)

        toast({
          title: "Usuario creado",
          description: `${data.nombre_completo} ha sido registrado exitosamente`,
        })

        // Refrescar lista
        await listarUsuarios({ page: paginaActual })

        return { success: true, data: result }
      } catch (err) {
        console.error("❌ Error al crear usuario:", err.message)
        const errorMessage = err.message || "Error al crear usuario"
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
    [getHeaders, handleAuthError, validarEmail, validarContrasena, verificarEmailUnico, listarUsuarios, paginaActual],
  )

  /**
   * Función para actualizar un usuario
   * @param {number} id - ID del usuario
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const actualizarUsuario = useCallback(
    async (id, data) => {
      setLoading(true)
      setError(null)

      try {
        // Validaciones
        if (!data.nombre_completo || !data.correo_electronico || !data.rol) {
          throw new Error("Nombre completo, email y rol son obligatorios")
        }

        if (!validarEmail(data.correo_electronico)) {
          throw new Error("El formato del email no es válido")
        }

        // Validar contraseña solo si se proporciona
        if (data.contrasena && !validarContrasena(data.contrasena)) {
          throw new Error("La contraseña debe tener al menos 6 caracteres")
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
        console.log("✅ Usuario actualizado:", result.id_usuario)

        toast({
          title: "Usuario actualizado",
          description: "Los cambios se han guardado correctamente",
        })

        // Refrescar lista
        await listarUsuarios({ page: paginaActual })

        return { success: true, data: result }
      } catch (err) {
        console.error("❌ Error al actualizar usuario:", err.message)
        const errorMessage = err.message || "Error al actualizar usuario"
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
    [getHeaders, handleAuthError, validarEmail, validarContrasena, listarUsuarios, paginaActual],
  )

  /**
   * Función para desactivar un usuario (eliminación lógica)
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const desactivarUsuario = useCallback(
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

        console.log("✅ Usuario desactivado:", id)

        toast({
          title: "Usuario desactivado",
          description: "El usuario ha sido desactivado correctamente",
        })

        // Refrescar lista
        await listarUsuarios({ page: paginaActual })

        return { success: true }
      } catch (err) {
        console.error("❌ Error al desactivar usuario:", err.message)
        const errorMessage = err.message || "Error al desactivar usuario"
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
    [getHeaders, handleAuthError, listarUsuarios, paginaActual],
  )

  /**
   * Función para cambiar página
   * @param {number} nuevaPagina - Nueva página
   * @param {Object} filtros - Filtros actuales
   * @returns {Promise<void>}
   */
  const cambiarPagina = useCallback(
    async (nuevaPagina, filtros = {}) => {
      await listarUsuarios({ ...filtros, page: nuevaPagina })
    },
    [listarUsuarios],
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
    listarUsuarios({ page: paginaActual })
  }, [listarUsuarios, paginaActual])

  // Cargar usuarios inicialmente
  useEffect(() => {
    listarUsuarios()
  }, [listarUsuarios])

  return {
    // Estados
    usuarios,
    loading,
    error,
    totalPaginas,
    paginaActual,
    total,

    // Funciones CRUD
    listarUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    desactivarUsuario,

    // Funciones auxiliares
    cambiarPagina,
    limpiarError,
    recargarDatos,
    validarEmail,
    validarContrasena,
    verificarEmailUnico,
  }
}

export default useUsuarios

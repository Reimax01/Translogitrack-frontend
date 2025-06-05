"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

const API_BASE_URL = "https://translogitrack-server-production.up.railway.app/api"
const TOKEN_KEY = "translogitrack_token"
const USER_KEY = "translogitrack_user"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Función para verificar si un token es válido
   * @param {string} token - Token JWT
   * @returns {boolean} - True si es válido
   */
  const isTokenValid = useCallback((token) => {
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch (error) {
      console.error("Error al verificar token:", error)
      return false
    }
  }, [])

  /**
   * Función para obtener datos del usuario desde localStorage
   * @returns {Object|null} - Datos del usuario
   */
  const getUser = useCallback(() => {
    try {
      const userData = localStorage.getItem(USER_KEY)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error)
      return null
    }
  }, [])

  /**
   * Función para guardar datos de autenticación
   * @param {string} token - Token JWT
   * @param {Object} userData - Datos del usuario
   */
  const saveAuthData = useCallback((token, userData) => {
    try {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Error al guardar datos de autenticación:", error)
      throw new Error("Error al guardar datos de autenticación")
    }
  }, [])

  /**
   * Función para limpiar datos de autenticación
   */
  const clearAuthData = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setUser(null)
      setIsAuthenticated(false)
      setError(null)
    } catch (error) {
      console.error("Error al limpiar datos de autenticación:", error)
    }
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
   * Función para iniciar sesión
   * @param {string} correo_electronico - Email del usuario
   * @param {string} contrasena - Contraseña del usuario
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const login = useCallback(
    async (correo_electronico, contrasena) => {
      setLoading(true)
      setError(null)

      try {
        if (!correo_electronico || !contrasena) {
          throw new Error("Correo electrónico y contraseña son requeridos")
        }

        if (!validarEmail(correo_electronico)) {
          throw new Error("El formato del correo electrónico no es válido")
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo_electronico: correo_electronico.trim().toLowerCase(),
            contrasena,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorMessage = "Error de autenticación"
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch (parseError) {
            if (response.status === 401) errorMessage = "Credenciales incorrectas"
            else if (response.status === 404) errorMessage = "Usuario no encontrado"
            else if (response.status >= 500) errorMessage = "Error del servidor"
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()

        if (!data.token) throw new Error("Respuesta de autenticación inválida: falta token")

        const user = data.usuario // El backend devuelve 'usuario', no 'user'
        if (!user) throw new Error("Respuesta de autenticación inválida: faltan datos del usuario")

        if (!isTokenValid(data.token)) throw new Error("Token recibido no es válido")

        saveAuthData(data.token, user)

        console.log("✅ Login exitoso:", user.nombre_completo || user.correo_electronico)

        toast({
          title: "Bienvenido",
          description: `Hola ${user.nombre_completo || user.correo_electronico}`,
        })

        return {
          success: true,
          user,
          token: data.token,
          message: "Login exitoso",
        }
      } catch (err) {
        console.error("❌ Error en login:", err.message)
        let errorMessage = err.message
        if (err.name === "AbortError") {
          errorMessage = "Tiempo de espera agotado. Verifique su conexión."
        } else if (err.message.includes("Failed to fetch") || err.message.includes("fetch")) {
          errorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet."
        }
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [isTokenValid, saveAuthData, validarEmail],
  )

  /**
   * Función para registrar un nuevo cliente
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const registrarCliente = useCallback(
    async (userData) => {
      setLoading(true)
      setError(null)

      try {
        // Validaciones
        if (!userData.nombre_completo || !userData.correo_electronico || !userData.contrasena) {
          throw new Error("Todos los campos son obligatorios")
        }

        if (!validarEmail(userData.correo_electronico)) {
          throw new Error("El formato del correo electrónico no es válido")
        }

        if (!validarContrasena(userData.contrasena)) {
          throw new Error("La contraseña debe tener al menos 6 caracteres")
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        // Preparar datos para el registro (solo clientes pueden auto-registrarse)
        const registroData = {
          nombre_completo: userData.nombre_completo.trim(),
          correo_electronico: userData.correo_electronico.trim().toLowerCase(),
          contrasena: userData.contrasena,
          rol: "Cliente", // Solo clientes pueden auto-registrarse
          activo: true,
        }

        const response = await fetch(`${API_BASE_URL}/auth/registro`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(registroData),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorMessage = "Error al crear la cuenta"
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch (parseError) {
            if (response.status === 409) errorMessage = "El correo electrónico ya está registrado"
            else if (response.status === 400) errorMessage = "Datos de registro inválidos"
            else if (response.status >= 500) errorMessage = "Error del servidor"
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        console.log("✅ Cliente registrado exitosamente:", data.usuario.id)

        toast({
          title: "Cuenta creada",
          description: "Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.",
        })

        return {
          success: true,
          user: data.usuario,
          token: data.token,
          message: "Cuenta creada exitosamente",
        }
      } catch (err) {
        console.error("❌ Error en registro:", err.message)
        let errorMessage = err.message
        if (err.name === "AbortError") {
          errorMessage = "Tiempo de espera agotado. Verifique su conexión."
        } else if (err.message.includes("Failed to fetch") || err.message.includes("fetch")) {
          errorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet."
        }
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [validarEmail, validarContrasena],
  )

  /**
   * Función para solicitar recuperación de contraseña
   * @param {string} correo_electronico - Email del usuario
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const solicitarRecuperacion = useCallback(
    async (correo_electronico) => {
      setLoading(true)
      setError(null)

      try {
        if (!correo_electronico) {
          throw new Error("El correo electrónico es requerido")
        }

        if (!validarEmail(correo_electronico)) {
          throw new Error("El formato del correo electrónico no es válido")
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(`${API_BASE_URL}/auth/recuperar-contrasena`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo_electronico: correo_electronico.trim().toLowerCase(),
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorMessage = "Error al solicitar recuperación"
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch (parseError) {
            if (response.status === 404) errorMessage = "No se encontró una cuenta con ese correo electrónico"
            else if (response.status >= 500) errorMessage = "Error del servidor"
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        console.log("✅ Solicitud de recuperación enviada")

        toast({
          title: "Solicitud enviada",
          description: "Se han enviado las instrucciones de recuperación a tu correo electrónico.",
        })

        return {
          success: true,
          message: "Instrucciones enviadas al correo electrónico",
        }
      } catch (err) {
        console.error("❌ Error en recuperación:", err.message)
        let errorMessage = err.message
        if (err.name === "AbortError") {
          errorMessage = "Tiempo de espera agotado. Verifique su conexión."
        } else if (err.message.includes("Failed to fetch") || err.message.includes("fetch")) {
          errorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet."
        }
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [validarEmail],
  )

  /**
   * Función para resetear contraseña con token
   * @param {string} token - Token de recuperación
   * @param {string} nuevaContrasena - Nueva contraseña
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const resetearContrasena = useCallback(
    async (token, nuevaContrasena) => {
      setLoading(true)
      setError(null)

      try {
        if (!token || !nuevaContrasena) {
          throw new Error("Token y nueva contraseña son requeridos")
        }

        if (!validarContrasena(nuevaContrasena)) {
          throw new Error("La nueva contraseña debe tener al menos 6 caracteres")
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            nuevaContrasena,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorMessage = "Error al resetear contraseña"
          try {
            const errorData = await response.json()
            errorMessage = errorData.mensaje || errorData.message || errorData.error || errorMessage
          } catch (parseError) {
            if (response.status === 400) errorMessage = "Token inválido o expirado"
            else if (response.status === 404) errorMessage = "Usuario no encontrado"
            else if (response.status >= 500) errorMessage = "Error del servidor"
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        console.log("✅ Contraseña reseteada exitosamente")

        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión.",
        })

        return {
          success: true,
          message: "Contraseña actualizada exitosamente",
        }
      } catch (err) {
        console.error("❌ Error al resetear contraseña:", err.message)
        let errorMessage = err.message
        if (err.name === "AbortError") {
          errorMessage = "Tiempo de espera agotado. Verifique su conexión."
        } else if (err.message.includes("Failed to fetch") || err.message.includes("fetch")) {
          errorMessage = "No se pudo conectar con el servidor. Verifique su conexión a internet."
        }
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [validarContrasena],
  )

  /**
   * Función para cerrar sesión
   */
  const logout = useCallback(() => {
    try {
      console.log("🚪 Cerrando sesión...")
      clearAuthData()
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      })
      console.log("✅ Sesión cerrada exitosamente")
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error)
    }
  }, [clearAuthData])

  /**
   * Función para verificar el estado de autenticación
   */
  const checkAuthStatus = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      const userData = getUser()

      if (token && userData && isTokenValid(token)) {
        setUser(userData)
        setIsAuthenticated(true)
        console.log("✅ Sesión restaurada:", userData.nombre_completo || userData.correo_electronico)
      } else {
        if (token || userData) {
          console.log("⚠️ Token expirado o inválido, limpiando sesión...")
          clearAuthData()
        }
      }
    } catch (error) {
      console.error("❌ Error al verificar estado de autenticación:", error)
      clearAuthData()
    } finally {
      setLoading(false)
    }
  }, [getUser, isTokenValid, clearAuthData])

  /**
   * Función para obtener el token actual
   * @returns {string|null} - Token válido o null
   */
  const getToken = useCallback(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      return isTokenValid(token) ? token : null
    } catch (error) {
      console.error("Error al obtener token:", error)
      return null
    }
  }, [isTokenValid])

  /**
   * Función para actualizar datos del usuario
   * @param {Object} newUserData - Nuevos datos del usuario
   */
  const updateUser = useCallback(
    (newUserData) => {
      try {
        const updatedUser = { ...user, ...newUserData }
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
        setUser(updatedUser)
        console.log("✅ Datos del usuario actualizados")
      } catch (error) {
        console.error("❌ Error al actualizar usuario:", error)
        throw new Error("Error al actualizar datos del usuario")
      }
    },
    [user],
  )

  /**
   * Función para limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Verificar estado de autenticación al montar el componente
  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  // Verificar expiración del token periódicamente
  useEffect(() => {
    if (!isAuthenticated) return
    const interval = setInterval(() => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!isTokenValid(token)) {
        console.log("⚠️ Token expirado, cerrando sesión...")
        logout()
      }
    }, 60000) // Verificar cada minuto
    return () => clearInterval(interval)
  }, [isAuthenticated, isTokenValid, logout])

  return {
    // Estados
    isAuthenticated,
    user,
    loading,
    error,

    // Funciones principales
    login,
    logout,
    registrarCliente,
    solicitarRecuperacion,
    resetearContrasena,

    // Funciones auxiliares
    getUser,
    getToken,
    updateUser,
    checkAuthStatus,
    clearError,
    validarEmail,
    validarContrasena,
  }
}

/**
 * Hook para obtener headers de autorización
 * @returns {Object} - Funciones para obtener headers y token
 */
export function useAuthToken() {
  const { getToken } = useAuth()

  const getAuthHeaders = useCallback(() => {
    const token = getToken()
    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        }
  }, [getToken])

  return { getAuthHeaders, getToken }
}

export default useAuth
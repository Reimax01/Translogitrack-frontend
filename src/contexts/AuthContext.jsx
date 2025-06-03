"use client"

import { createContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

// Crear el contexto
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Verificar si hay un token almacenado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
          console.log("✅ Sesión restaurada desde localStorage")
        }
      } catch (error) {
        console.error("❌ Error al verificar autenticación:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Función para iniciar sesión
  const login = (userData, authToken) => {
    try {
      localStorage.setItem("token", authToken)
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
      setToken(authToken)
      console.log("✅ Login exitoso:", userData.nombre_completo || userData.correo_electronico)
      navigate("/dashboard")
    } catch (error) {
      console.error("❌ Error al guardar datos de login:", error)
    }
  }

  // Función para cerrar sesión
  const logout = () => {
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setUser(null)
      setToken(null)
      console.log("✅ Sesión cerrada")
      navigate("/login")
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error)
    }
  }

  // Función para actualizar datos del usuario
  const updateUserData = (newUserData) => {
    try {
      const updatedUser = { ...user, ...newUserData }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      console.log("✅ Datos del usuario actualizados")
    } catch (error) {
      console.error("❌ Error al actualizar datos del usuario:", error)
    }
  }

  const contextValue = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUserData,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

"use client"

import { useState } from "react"
import { useAuth } from "./useAuth"

export const useUsuario = () => {
  const { user, token, actualizarDatosUsuario } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Obtener la URL del API
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

  // Función para actualizar el perfil del usuario
  const actualizarPerfil = async (datosActualizados) => {
    setLoading(true)
    setError(null)

    try {
      console.log("🔄 Actualizando perfil del usuario")
      console.log("📡 URL del API:", API_URL)

      const response = await fetch(`${API_URL}/usuarios/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datosActualizados),
      })

      console.log("📡 Respuesta del servidor:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Perfil actualizado exitosamente")

      // Actualizar los datos en el contexto
      actualizarDatosUsuario(data.usuario || data)

      return { success: true, user: data.usuario || data }
    } catch (error) {
      console.error("❌ Error en actualizarPerfil:", error)
      const mensaje = error.message || "Error al actualizar perfil"
      setError(mensaje)
      return { success: false, error: mensaje }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    actualizarPerfil,
  }
}

export default useUsuario

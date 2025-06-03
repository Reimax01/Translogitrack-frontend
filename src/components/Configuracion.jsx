"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"

export default function Configuracion() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  const [notificaciones, setNotificaciones] = useState({
    email: true,
    sistema: true,
    actualizaciones: false,
  })

  const [tema, setTema] = useState("claro")
  const [idioma, setIdioma] = useState("es")

  const handleNotificacionChange = (e) => {
    const { name, checked } = e.target
    setNotificaciones((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleTemaChange = (e) => {
    setTema(e.target.value)
  }

  const handleIdiomaChange = (e) => {
    setIdioma(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Aquí se implementaría la lógica para guardar la configuración
    // Por ahora solo mostramos un toast
    toast({
      title: "Configuración guardada",
      description: "Tus preferencias han sido actualizadas",
    })
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Configuración</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Sección de Notificaciones */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="email"
                        name="email"
                        type="checkbox"
                        checked={notificaciones.email}
                        onChange={handleNotificacionChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="email" className="font-medium text-gray-700">
                        Notificaciones por correo electrónico
                      </label>
                      <p className="text-gray-500">Recibe actualizaciones sobre tus pedidos y entregas por correo.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="sistema"
                        name="sistema"
                        type="checkbox"
                        checked={notificaciones.sistema}
                        onChange={handleNotificacionChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="sistema" className="font-medium text-gray-700">
                        Notificaciones del sistema
                      </label>
                      <p className="text-gray-500">Recibe alertas y notificaciones dentro de la plataforma.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="actualizaciones"
                        name="actualizaciones"
                        type="checkbox"
                        checked={notificaciones.actualizaciones}
                        onChange={handleNotificacionChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="actualizaciones" className="font-medium text-gray-700">
                        Actualizaciones y novedades
                      </label>
                      <p className="text-gray-500">Recibe información sobre nuevas características y mejoras.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de Apariencia */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Apariencia</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="tema" className="block text-sm font-medium text-gray-700 mb-1">
                      Tema
                    </label>
                    <select
                      id="tema"
                      name="tema"
                      value={tema}
                      onChange={handleTemaChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="claro">Claro</option>
                      <option value="oscuro">Oscuro</option>
                      <option value="sistema">Usar configuración del sistema</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección de Idioma */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Idioma</h3>
                <div>
                  <label htmlFor="idioma" className="block text-sm font-medium text-gray-700 mb-1">
                    Idioma de la plataforma
                  </label>
                  <select
                    id="idioma"
                    name="idioma"
                    value={idioma}
                    onChange={handleIdiomaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              {/* Sección de Privacidad */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacidad y Seguridad</h3>
                <div className="space-y-4">
                  <div>
                    <button
                      type="button"
                      onClick={() => router.push("/cambiar-contrasena")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Cambiar Contraseña
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

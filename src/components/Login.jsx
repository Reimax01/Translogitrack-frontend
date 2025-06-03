"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import RegistroCliente from "../components/RegistroCliente"
import RecuperarContrasena from "../components/RecuperarContrasena"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react"

function Login() {
  const navigate = useNavigate()
  const { login, loading, error, isAuthenticated, clearError } = useAuth()

  const [currentView, setCurrentView] = useState("login") // 'login', 'registro', 'recuperar'
  const [formData, setFormData] = useState({
    correo_electronico: "",
    contrasena: "",
    recordarme: false,
  })
  const [formErrors, setFormErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  // Redireccionar si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    // Limpiar errores cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    // Limpiar error de autenticación
    if (error) {
      clearError()
    }
  }

  // Función para validar el formulario
  const validateForm = () => {
    const newErrors = {}

    if (!formData.correo_electronico.trim()) {
      newErrors.correo_electronico = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.correo_electronico)) {
      newErrors.correo_electronico = "El formato del correo electrónico no es válido"
    }

    if (!formData.contrasena.trim()) {
      newErrors.contrasena = "La contraseña es requerida"
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = "La contraseña debe tener al menos 6 caracteres"
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const result = await login(formData.correo_electronico, formData.contrasena)

      if (result.success) {
        // El hook ya maneja la redirección a través del useEffect
        console.log("Login exitoso, redirigiendo...", result.user.nombre)
      }
      // Los errores se manejan automáticamente en el hook
    } catch (err) {
      console.error("Error inesperado en login:", err)
    }
  }

  // Función para cambiar entre vistas
  const handleViewChange = (view) => {
    setCurrentView(view)
    clearError()
    setFormErrors({})
  }

  // Función para manejar registro exitoso
  const handleRegistroExitoso = () => {
    setCurrentView("login")
    // Opcional: prellenar el email si se registró exitosamente
  }

  // Renderizar vista de registro
  if (currentView === "registro") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
        <RegistroCliente onBackToLogin={() => handleViewChange("login")} onRegistroExitoso={handleRegistroExitoso} />
      </div>
    )
  }

  // Renderizar vista de recuperación
  if (currentView === "recuperar") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
        <RecuperarContrasena onBackToLogin={() => handleViewChange("login")} />
      </div>
    )
  }

  // Renderizar vista de login (por defecto)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-600 mb-4">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu cuenta de TransLogiTrack</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error de autenticación */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button onClick={clearError} className="inline-flex text-red-400 hover:text-red-600">
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Correo electrónico */}
            <div className="space-y-2">
              <Label htmlFor="correo_electronico">
                Correo Electrónico <span className="text-red-500">*</span>
              </Label>
              <Input
                id="correo_electronico"
                name="correo_electronico"
                type="email"
                autoComplete="email"
                value={formData.correo_electronico}
                onChange={handleInputChange}
                disabled={loading}
                className={
                  formErrors.correo_electronico ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                }
                placeholder="tu@email.com"
              />
              {formErrors.correo_electronico && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formErrors.correo_electronico}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="contrasena">
                Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="contrasena"
                  name="contrasena"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.contrasena}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={formErrors.contrasena ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formErrors.contrasena && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formErrors.contrasena}
                </p>
              )}
            </div>

            {/* Opciones adicionales */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="recordarme"
                  name="recordarme"
                  type="checkbox"
                  checked={formData.recordarme}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="recordarme" className="ml-2 text-sm text-gray-700">
                  Recordarme
                </Label>
              </div>

              <button
                type="button"
                onClick={() => handleViewChange("recuperar")}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Separator />

            {/* Botón de login */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            {/* Enlace para registro */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => handleViewChange("registro")}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Regístrate como cliente
                </button>
              </p>
            </div>
          </form>

          {/* Nota informativa */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Nota:</strong> Solo los clientes pueden crear cuentas por sí mismos. Los administradores y
              operadores son creados por un administrador del sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login

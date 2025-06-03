"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react"

function ResetearContrasena() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { resetearContrasena, loading, error, clearError } = useAuth()

  const [token, setToken] = useState("")
  const [formData, setFormData] = useState({
    nuevaContrasena: "",
    confirmarContrasena: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetExitoso, setResetExitoso] = useState(false)
  const [tokenValido, setTokenValido] = useState(true)

  // Obtener token de la URL al montar el componente
  useEffect(() => {
    const urlToken = searchParams.get("token")
    if (urlToken) {
      setToken(urlToken)
    } else {
      setTokenValido(false)
    }
  }, [searchParams])

  // Función para manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    // Validar nueva contraseña
    if (!formData.nuevaContrasena) {
      newErrors.nuevaContrasena = "La nueva contraseña es requerida"
    } else if (formData.nuevaContrasena.length < 6) {
      newErrors.nuevaContrasena = "La contraseña debe tener al menos 6 caracteres"
    }

    // Validar confirmación de contraseña
    if (!formData.confirmarContrasena) {
      newErrors.confirmarContrasena = "Debe confirmar la nueva contraseña"
    } else if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = "Las contraseñas no coinciden"
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
      const result = await resetearContrasena(token, formData.nuevaContrasena)

      if (result.success) {
        setResetExitoso(true)
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      }
    } catch (err) {
      console.error("Error inesperado al resetear contraseña:", err)
    }
  }

  // Si no hay token válido
  if (!tokenValido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enlace inválido</h2>
            <p className="text-gray-600 mb-6">
              El enlace de recuperación no es válido o ha expirado. Por favor, solicita un nuevo enlace de recuperación.
            </p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Volver al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si el reset fue exitoso
  if (resetExitoso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h2>
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido actualizada exitosamente. Serás redirigido al login en unos segundos.
            </p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Ir al Login Ahora
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Restablecer Contraseña
          </CardTitle>
          <CardDescription>Ingresa tu nueva contraseña para completar el proceso</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error de reset */}
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
            {/* Nueva contraseña */}
            <div className="space-y-2">
              <Label htmlFor="nuevaContrasena">
                Nueva Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="nuevaContrasena"
                  name="nuevaContrasena"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.nuevaContrasena}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={formErrors.nuevaContrasena ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}
                  placeholder="Mínimo 6 caracteres"
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
              {formErrors.nuevaContrasena && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formErrors.nuevaContrasena}
                </p>
              )}
            </div>

            {/* Confirmar nueva contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmarContrasena">
                Confirmar Nueva Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmarContrasena}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={
                    formErrors.confirmarContrasena ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                  }
                  placeholder="Repite tu nueva contraseña"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formErrors.confirmarContrasena && (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formErrors.confirmarContrasena}
                </p>
              )}
            </div>

            <Separator />

            {/* Botón de reset */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Actualizando contraseña..." : "Actualizar Contraseña"}
            </Button>

            {/* Enlace para volver al login */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Recordaste tu contraseña?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Volver al login
                </button>
              </p>
            </div>
          </form>

          {/* Información de seguridad */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800">
              <strong>Seguridad:</strong> Tu nueva contraseña debe tener al menos 6 caracteres. Una vez actualizada,
              todas las sesiones activas serán cerradas por seguridad.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResetearContrasena

"use client"

import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react"

function RecuperarContrasena({ onBackToLogin }) {
  const { solicitarRecuperacion, loading, error, clearError } = useAuth()

  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [solicitudEnviada, setSolicitudEnviada] = useState(false)

  // Función para manejar cambios en el input
  const handleEmailChange = (e) => {
    setEmail(e.target.value)

    // Limpiar errores cuando el usuario empiece a escribir
    if (emailError) {
      setEmailError("")
    }

    // Limpiar error de autenticación
    if (error) {
      clearError()
    }
  }

  // Función para validar el email
  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("El correo electrónico es requerido")
      return false
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("El formato del correo electrónico no es válido")
      return false
    }

    return true
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateEmail()) {
      return
    }

    try {
      const result = await solicitarRecuperacion(email)

      if (result.success) {
        setSolicitudEnviada(true)
      }
    } catch (err) {
      console.error("Error inesperado en recuperación:", err)
    }
  }

  // Si la solicitud fue enviada, mostrar mensaje de confirmación
  if (solicitudEnviada) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud enviada!</h2>
          <p className="text-gray-600 mb-6">
            Se han enviado las instrucciones de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada y
            sigue las instrucciones para restablecer tu contraseña.
          </p>
          <div className="space-y-3">
            <Button onClick={onBackToLogin} className="w-full">
              Volver a Iniciar Sesión
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSolicitudEnviada(false)
                setEmail("")
              }}
              className="w-full"
            >
              Enviar a otro correo
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBackToLogin}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Recuperar Contraseña
            </CardTitle>
            <CardDescription>Ingresa tu correo electrónico para recibir instrucciones de recuperación</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Error de recuperación */}
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
            <Label htmlFor="email">
              Correo Electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
              className={emailError ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}
              placeholder="tu@email.com"
            />
            {emailError && (
              <p className="text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {emailError}
              </p>
            )}
          </div>

          <Separator />

          {/* Botón de envío */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Enviando..." : "Enviar Instrucciones"}
          </Button>

          {/* Enlace para volver al login */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Recordaste tu contraseña?{" "}
              <button
                type="button"
                onClick={onBackToLogin}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Volver a iniciar sesión
              </button>
            </p>
          </div>
        </form>

        {/* Información adicional */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>Nota:</strong> Si no recibes el correo en unos minutos, revisa tu carpeta de spam o correo no
            deseado. El enlace de recuperación expirará en 24 horas por seguridad.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecuperarContrasena

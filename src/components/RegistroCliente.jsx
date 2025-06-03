"use client"

import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, UserPlus, Eye, EyeOff, CheckCircle } from "lucide-react"

function RegistroCliente({ onBackToLogin, onRegistroExitoso }) {
  const { registrarCliente, loading, error, clearError } = useAuth()

  const [formData, setFormData] = useState({
    nombre_completo: "",
    correo_electronico: "",
    contrasena: "",
    confirmar_contrasena: "",
  })

  const [formErrors, setFormErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registroExitoso, setRegistroExitoso] = useState(false)

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

    // Validar nombre completo
    if (!formData.nombre_completo.trim()) {
      newErrors.nombre_completo = "El nombre completo es requerido"
    } else if (formData.nombre_completo.trim().length < 2) {
      newErrors.nombre_completo = "El nombre debe tener al menos 2 caracteres"
    }

    // Validar correo electrónico
    if (!formData.correo_electronico.trim()) {
      newErrors.correo_electronico = "El correo electrónico es requerido"
    } else if (!/\S+@\S+\.\S+/.test(formData.correo_electronico)) {
      newErrors.correo_electronico = "El formato del correo electrónico no es válido"
    }

    // Validar contraseña
    if (!formData.contrasena) {
      newErrors.contrasena = "La contraseña es requerida"
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = "La contraseña debe tener al menos 6 caracteres"
    }

    // Validar confirmación de contraseña
    if (!formData.confirmar_contrasena) {
      newErrors.confirmar_contrasena = "Debe confirmar la contraseña"
    } else if (formData.contrasena !== formData.confirmar_contrasena) {
      newErrors.confirmar_contrasena = "Las contraseñas no coinciden"
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
      const result = await registrarCliente({
        nombre_completo: formData.nombre_completo,
        correo_electronico: formData.correo_electronico,
        contrasena: formData.contrasena,
      })

      if (result.success) {
        setRegistroExitoso(true)
        // Opcional: llamar callback si se proporciona
        if (onRegistroExitoso) {
          onRegistroExitoso(result.user)
        }
      }
    } catch (err) {
      console.error("Error inesperado en registro:", err)
    }
  }

  // Si el registro fue exitoso, mostrar mensaje de confirmación
  if (registroExitoso) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta creada exitosamente!</h2>
          <p className="text-gray-600 mb-6">
            Tu cuenta de cliente ha sido registrada. Ahora puedes iniciar sesión con tus credenciales.
          </p>
          <Button onClick={onBackToLogin} className="w-full">
            Ir a Iniciar Sesión
          </Button>
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
              <UserPlus className="h-5 w-5 text-blue-600" />
              Crear Cuenta de Cliente
            </CardTitle>
            <CardDescription>Regístrate para acceder a nuestros servicios de transporte</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Error de registro */}
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
          {/* Nombre completo */}
          <div className="space-y-2">
            <Label htmlFor="nombre_completo">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre_completo"
              name="nombre_completo"
              type="text"
              autoComplete="name"
              value={formData.nombre_completo}
              onChange={handleInputChange}
              disabled={loading}
              className={formErrors.nombre_completo ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}
              placeholder="Ej: Juan Pérez"
            />
            {formErrors.nombre_completo && (
              <p className="text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {formErrors.nombre_completo}
              </p>
            )}
          </div>

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
              className={formErrors.correo_electronico ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}
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
                autoComplete="new-password"
                value={formData.contrasena}
                onChange={handleInputChange}
                disabled={loading}
                className={formErrors.contrasena ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}
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

          {/* Confirmar contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmar_contrasena">
              Confirmar Contraseña <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmar_contrasena"
                name="confirmar_contrasena"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.confirmar_contrasena}
                onChange={handleInputChange}
                disabled={loading}
                className={
                  formErrors.confirmar_contrasena ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""
                }
                placeholder="Repite tu contraseña"
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
            {formErrors.confirmar_contrasena && (
              <p className="text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {formErrors.confirmar_contrasena}
              </p>
            )}
          </div>

          <Separator />

          {/* Botón de registro */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>

          {/* Enlace para volver al login */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <button
                type="button"
                onClick={onBackToLogin}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </form>

        {/* Nota informativa */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>Nota:</strong> Solo los clientes pueden crear cuentas por sí mismos. Los administradores y
            operadores deben ser creados por un administrador del sistema.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default RegistroCliente

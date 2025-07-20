"use client"

import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield } from "lucide-react"

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    nuevaContrasena: "",
    confirmarContrasena: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [showPasswords, setShowPasswords] = useState({
    nueva: false,
    confirmar: false,
  })

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  // Función para validar la fortaleza de la contraseña
  const validarFortalezaContrasena = (contrasena) => {
    const criterios = {
      longitud: contrasena.length >= 6,
      mayuscula: /[A-Z]/.test(contrasena),
      minuscula: /[a-z]/.test(contrasena),
      numero: /\d/.test(contrasena),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(contrasena),
    }

    const cumplidos = Object.values(criterios).filter(Boolean).length
    return { criterios, puntuacion: cumplidos, esValida: cumplidos >= 3 }
  }

  const fortalezaContrasena = validarFortalezaContrasena(formData.nuevaContrasena)

  const getFortalezaColor = (puntuacion) => {
    if (puntuacion <= 2) return "bg-red-500"
    if (puntuacion <= 3) return "bg-yellow-500"
    if (puntuacion <= 4) return "bg-blue-500"
    return "bg-green-500"
  }

  const getFortalezaTexto = (puntuacion) => {
    if (puntuacion <= 2) return "Débil"
    if (puntuacion <= 3) return "Regular"
    if (puntuacion <= 4) return "Buena"
    return "Fuerte"
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Validar que las contraseñas coincidan
    if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      setMessage({
        type: "error",
        text: "Las contraseñas no coinciden",
      })
      return
    }

    // Validar longitud mínima
    if (formData.nuevaContrasena.length < 6) {
      setMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres",
      })
      return
    }

    setLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await fetch("https://translogitrack-server-production.up.railway.app/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          nuevaContrasena: formData.nuevaContrasena,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...",
        })

        // Limpiar el formulario
        setFormData({
          nuevaContrasena: "",
          confirmarContrasena: "",
        })

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } else {
        setMessage({
          type: "error",
          text: data.mensaje || "Error al restablecer la contraseña",
        })
      }
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error)
      setMessage({
        type: "error",
        text: "Ocurrió un error al conectar con el servidor",
      })
    } finally {
      setLoading(false)
    }
  }

  // Si no hay token, mostrar mensaje de error
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              Enlace Inválido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">El enlace para restablecer la contraseña es inválido o ha expirado.</p>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Volver al Inicio de Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {message.text && (
          <Alert
            className={`mb-4 ${
              message.type === "error"
                ? "border-red-500 text-red-800 bg-red-50"
                : "border-green-500 text-green-800 bg-green-50"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertTitle>{message.type === "error" ? "Error" : "Éxito"}</AlertTitle>
            </div>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <div className="p-2 rounded-full bg-blue-100">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-center">Restablecer Contraseña</CardTitle>
            <CardDescription className="text-center">
              Ingrese su nueva contraseña para restablecer su cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nueva Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="nuevaContrasena">
                  Nueva Contraseña <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="nuevaContrasena"
                    type={showPasswords.nueva ? "text" : "password"}
                    value={formData.nuevaContrasena}
                    onChange={(e) => handleInputChange("nuevaContrasena", e.target.value)}
                    placeholder="Ingrese su nueva contraseña"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("nueva")}
                    aria-label={showPasswords.nueva ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPasswords.nueva ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>

                {/* Indicador de fortaleza de contraseña */}
                {formData.nuevaContrasena && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getFortalezaColor(
                            fortalezaContrasena.puntuacion,
                          )}`}
                          style={{ width: `${(fortalezaContrasena.puntuacion / 5) * 100}%` }}
                        />
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          fortalezaContrasena.puntuacion <= 2
                            ? "border-red-500 text-red-700"
                            : fortalezaContrasena.puntuacion <= 3
                              ? "border-yellow-500 text-yellow-700"
                              : fortalezaContrasena.puntuacion <= 4
                                ? "border-blue-500 text-blue-700"
                                : "border-green-500 text-green-700"
                        }`}
                      >
                        {getFortalezaTexto(fortalezaContrasena.puntuacion)}
                      </Badge>
                    </div>

                    {/* Criterios de contraseña */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                      <div className="flex items-center gap-1">
                        {fortalezaContrasena.criterios.longitud ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={fortalezaContrasena.criterios.longitud ? "text-green-700" : "text-gray-500"}>
                          Mínimo 6 caracteres
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {fortalezaContrasena.criterios.mayuscula ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={fortalezaContrasena.criterios.mayuscula ? "text-green-700" : "text-gray-500"}>
                          Una mayúscula
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {fortalezaContrasena.criterios.minuscula ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={fortalezaContrasena.criterios.minuscula ? "text-green-700" : "text-gray-500"}>
                          Una minúscula
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {fortalezaContrasena.criterios.numero ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={fortalezaContrasena.criterios.numero ? "text-green-700" : "text-gray-500"}>
                          Un número
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmarContrasena">
                  Confirmar Nueva Contraseña <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmarContrasena"
                    type={showPasswords.confirmar ? "text" : "password"}
                    value={formData.confirmarContrasena}
                    onChange={(e) => handleInputChange("confirmarContrasena", e.target.value)}
                    placeholder="Confirme su nueva contraseña"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("confirmar")}
                    aria-label={showPasswords.confirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPasswords.confirmar ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>

                {/* Indicador de coincidencia */}
                {formData.confirmarContrasena && (
                  <div className="flex items-center gap-1 text-xs">
                    {formData.nuevaContrasena === formData.confirmarContrasena ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-green-700">Las contraseñas coinciden</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-red-700">Las contraseñas no coinciden</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                !formData.nuevaContrasena ||
                !formData.confirmarContrasena ||
                formData.nuevaContrasena !== formData.confirmarContrasena ||
                formData.nuevaContrasena.length < 6
              }
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Restablecer Contraseña"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Consejos de seguridad */}
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Consejos de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Use una combinación de letras mayúsculas, minúsculas, números y símbolos</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Evite usar información personal como nombres o fechas de nacimiento</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>No reutilice contraseñas de otras cuentas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword

"use client"

import { useState, useEffect } from "react"

function ConductorForm({ initialValues = {}, onSubmit, onCancel, isEditing = false, isLoading = false }) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    numeroLicencia: "",
    fechaVencimiento: "",
    estado: "Activo",
  })

  // Estado de errores
  const [errors, setErrors] = useState({})

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Opciones de estado
  const estadoOptions = [
    { value: "Activo", label: "Activo" },
    { value: "Inactivo", label: "Inactivo" },
  ]

  // Efecto para cargar valores iniciales
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData({
        nombreCompleto: initialValues.nombreCompleto || "",
        numeroLicencia: initialValues.licencia || initialValues.numeroLicencia || "",
        fechaVencimiento: initialValues.fechaVencimiento || "",
        estado: initialValues.estado || "Activo",
      })
    }
  }, [initialValues])

  // Función para manejar cambios en los campos
  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Formatear número de licencia automáticamente
    let formattedValue = value
    if (name === "numeroLicencia") {
      // Remover caracteres no válidos y formatear
      const cleanValue = value.replace(/[^A-Za-z0-9-]/g, "").toUpperCase()
      if (cleanValue.length <= 10) {
        // Formato: X-12345678
        if (cleanValue.length > 1 && !cleanValue.includes("-")) {
          formattedValue = cleanValue.charAt(0) + "-" + cleanValue.slice(1)
        } else {
          formattedValue = cleanValue
        }
      } else {
        return // No permitir más de 10 caracteres
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }))

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  // Función de validación
  const validateForm = () => {
    const newErrors = {}

    // Validar nombre completo
    if (!formData.nombreCompleto.trim()) {
      newErrors.nombreCompleto = "El nombre completo es requerido"
    } else if (formData.nombreCompleto.trim().length < 3) {
      newErrors.nombreCompleto = "El nombre debe tener al menos 3 caracteres"
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombreCompleto.trim())) {
      newErrors.nombreCompleto = "El nombre solo puede contener letras y espacios"
    }

    // Validar número de licencia
    if (!formData.numeroLicencia.trim()) {
      newErrors.numeroLicencia = "El número de licencia es requerido"
    } else if (!/^[A-Z]-\d{8}$/.test(formData.numeroLicencia)) {
      newErrors.numeroLicencia = "El formato debe ser: X-12345678 (letra-guión-8 dígitos)"
    }

    // Validar fecha de vencimiento
    if (!formData.fechaVencimiento) {
      newErrors.fechaVencimiento = "La fecha de vencimiento es requerida"
    } else {
      const selectedDate = new Date(formData.fechaVencimiento)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate <= today) {
        newErrors.fechaVencimiento = "La fecha de vencimiento debe ser posterior a hoy"
      }

      // Verificar que no sea más de 10 años en el futuro
      const maxDate = new Date()
      maxDate.setFullYear(maxDate.getFullYear() + 10)
      if (selectedDate > maxDate) {
        newErrors.fechaVencimiento = "La fecha no puede ser más de 10 años en el futuro"
      }
    }

    // Validar estado
    if (!formData.estado) {
      newErrors.estado = "El estado es requerido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (onSubmit) {
        // Preparar datos para envío
        const dataToSubmit = {
          ...formData,
          licencia: formData.numeroLicencia, // Mapear para compatibilidad
        }
        await onSubmit(dataToSubmit)
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error)
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para manejar la cancelación
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      nombreCompleto: "",
      numeroLicencia: "",
      fechaVencimiento: "",
      estado: "Activo",
    })
    setErrors({})
  }

  // Función para obtener la fecha mínima (mañana)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  // Función para obtener la fecha máxima (10 años)
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 10)
    return maxDate.toISOString().split("T")[0]
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {isEditing ? "Editar Conductor" : "Nuevo Conductor"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isEditing
            ? "Modifique la información del conductor y guarde los cambios"
            : "Complete la información del nuevo conductor"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo Nombre Completo */}
        <div>
          <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="nombreCompleto"
            name="nombreCompleto"
            value={formData.nombreCompleto}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.nombreCompleto ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: Juan Carlos Pérez González"
            disabled={isLoading || isSubmitting}
            autoComplete="name"
          />
          {errors.nombreCompleto && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.nombreCompleto}
            </p>
          )}
        </div>

        {/* Campo Número de Licencia */}
        <div>
          <label htmlFor="numeroLicencia" className="block text-sm font-medium text-gray-700 mb-2">
            Número de Licencia *
          </label>
          <input
            type="text"
            id="numeroLicencia"
            name="numeroLicencia"
            value={formData.numeroLicencia}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.numeroLicencia ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
            }`}
            placeholder="Ej: B-12345678"
            disabled={isLoading || isSubmitting}
            maxLength="10"
          />
          <p className="mt-1 text-xs text-gray-500">Formato: Letra-Guión-8 dígitos (Ej: B-12345678)</p>
          {errors.numeroLicencia && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.numeroLicencia}
            </p>
          )}
        </div>

        {/* Campos Fecha Vencimiento y Estado en grid responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo Fecha Vencimiento */}
          <div>
            <label htmlFor="fechaVencimiento" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento *
            </label>
            <input
              type="date"
              id="fechaVencimiento"
              name="fechaVencimiento"
              value={formData.fechaVencimiento}
              onChange={handleInputChange}
              min={getMinDate()}
              max={getMaxDate()}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.fechaVencimiento ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading || isSubmitting}
            />
            {errors.fechaVencimiento && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.fechaVencimiento}
              </p>
            )}
          </div>

          {/* Campo Estado */}
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.estado ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading || isSubmitting}
            >
              {estadoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.estado && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.estado}
              </p>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Información importante</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>La licencia debe estar vigente y en buen estado</li>
                  <li>El formato de licencia debe seguir el estándar nacional</li>
                  <li>La fecha de vencimiento debe ser posterior a la fecha actual</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isSubmitting}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isEditing ? "Guardar Cambios" : "Guardar Conductor"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Botón de reset para modo creación */}
      {!isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={resetForm}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center"
            disabled={isLoading || isSubmitting}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Limpiar formulario
          </button>
        </div>
      )}
    </div>
  )
}

export default ConductorForm

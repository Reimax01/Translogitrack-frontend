"use client"

import { useState, useEffect } from "react"

function PedidoForm({ initialValues = {}, onSubmit, onCancel, isEditing = false, isLoading = false }) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    cliente: "",
    direccion: "",
    estado: "Pendiente",
    fecha: new Date().toISOString().split("T")[0],
  })

  // Estado de errores
  const [errors, setErrors] = useState({})

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Opciones de estado
  const estadoOptions = [
    { value: "Pendiente", label: "Pendiente" },
    { value: "En Proceso", label: "En Proceso" },
    { value: "Entregado", label: "Entregado" },
  ]

  // Efecto para cargar valores iniciales
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData({
        cliente: initialValues.cliente || "",
        direccion: initialValues.direccion || "",
        estado: initialValues.estado || "Pendiente",
        fecha: initialValues.fecha || new Date().toISOString().split("T")[0],
      })
    }
  }, [initialValues])

  // Función para manejar cambios en los campos
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    // Validar cliente
    if (!formData.cliente.trim()) {
      newErrors.cliente = "El nombre del cliente es requerido"
    } else if (formData.cliente.trim().length < 2) {
      newErrors.cliente = "El nombre del cliente debe tener al menos 2 caracteres"
    }

    // Validar dirección
    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida"
    } else if (formData.direccion.trim().length < 10) {
      newErrors.direccion = "La dirección debe tener al menos 10 caracteres"
    }

    // Validar estado
    if (!formData.estado) {
      newErrors.estado = "El estado es requerido"
    }

    // Validar fecha
    if (!formData.fecha) {
      newErrors.fecha = "La fecha es requerida"
    } else {
      const selectedDate = new Date(formData.fecha)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.fecha = "La fecha no puede ser anterior a hoy"
      }
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
        await onSubmit(formData)
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error)
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
      cliente: "",
      direccion: "",
      estado: "Pendiente",
      fecha: new Date().toISOString().split("T")[0],
    })
    setErrors({})
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{isEditing ? "Editar Pedido" : "Crear Nuevo Pedido"}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {isEditing
            ? "Modifique los campos necesarios y guarde los cambios"
            : "Complete la información del nuevo pedido"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo Cliente */}
        <div>
          <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-2">
            Cliente *
          </label>
          <input
            type="text"
            id="cliente"
            name="cliente"
            value={formData.cliente}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.cliente ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
            }`}
            placeholder="Ingrese el nombre del cliente"
            disabled={isLoading || isSubmitting}
          />
          {errors.cliente && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.cliente}
            </p>
          )}
        </div>

        {/* Campo Dirección */}
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
            Dirección *
          </label>
          <textarea
            id="direccion"
            name="direccion"
            rows={3}
            value={formData.direccion}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
              errors.direccion ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
            }`}
            placeholder="Ingrese la dirección completa de entrega"
            disabled={isLoading || isSubmitting}
          />
          {errors.direccion && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.direccion}
            </p>
          )}
        </div>

        {/* Campos Estado y Fecha en grid responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Campo Fecha */}
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Entrega *
            </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.fecha ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading || isSubmitting}
            />
            {errors.fecha && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.fecha}
              </p>
            )}
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
                {isEditing ? "Guardar Cambios" : "Crear Pedido"}
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
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading || isSubmitting}
          >
            Limpiar formulario
          </button>
        </div>
      )}
    </div>
  )
}

export default PedidoForm

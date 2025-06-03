/**
 * Función para validar formato de licencia
 * @param {string} licencia - Número de licencia
 * @returns {boolean} - True si es válida
 */
export function validarLicencia(licencia) {
  if (!licencia || typeof licencia !== "string") {
    return false
  }

  const pattern = /^[A-Z0-9-]+$/
  return pattern.test(licencia) && licencia.length >= 5
}

/**
 * Función para validar fecha de vencimiento
 * @param {string} fecha - Fecha en formato ISO
 * @returns {boolean} - True si es válida
 */
export function validarFechaVencimiento(fecha) {
  if (!fecha) return false

  const fechaVencimiento = new Date(fecha)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  return fechaVencimiento > hoy
}

/**
 * Función para validar nombre completo
 * @param {string} nombre - Nombre completo
 * @returns {boolean} - True si es válido
 */
export function validarNombreCompleto(nombre) {
  if (!nombre || typeof nombre !== "string") {
    return false
  }

  const trimmedNombre = nombre.trim()
  return trimmedNombre.length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmedNombre)
}

/**
 * Función para validar descripción de evento
 * @param {string} descripcion - Descripción del evento
 * @returns {boolean} - True si es válida
 */
export function validarDescripcionEvento(descripcion) {
  if (!descripcion || typeof descripcion !== "string") {
    return false
  }

  return descripcion.trim().length >= 10
}

/**
 * Función para validar tipo de evento
 * @param {string} tipoEvento - Tipo de evento
 * @returns {boolean} - True si es válido
 */
export function validarTipoEvento(tipoEvento) {
  const tiposValidos = ["sanción", "premio", "incidente"]
  return tiposValidos.includes(tipoEvento)
}

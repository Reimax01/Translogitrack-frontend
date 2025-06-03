import {
  validarLicencia,
  validarFechaVencimiento,
  validarNombreCompleto,
  validarDescripcionEvento,
  validarTipoEvento,
} from "../utils/validaciones"

describe("Validaciones", () => {
  describe("validarLicencia", () => {
    test("debe validar formato de licencia correcto", () => {
      expect(validarLicencia("ABC-123")).toBe(true)
      expect(validarLicencia("LIC-88942")).toBe(true)
      expect(validarLicencia("A1B2C3")).toBe(true)
    })

    test("debe rechazar formato de licencia incorrecto", () => {
      expect(validarLicencia("invalido")).toBe(false)
      expect(validarLicencia("ABC@123")).toBe(false)
      expect(validarLicencia("")).toBe(false)
      expect(validarLicencia(null)).toBe(false)
      expect(validarLicencia("AB")).toBe(false) // Muy corta
    })
  })

  describe("validarFechaVencimiento", () => {
    test("debe validar fecha futura", () => {
      const fechaFutura = new Date()
      fechaFutura.setDate(fechaFutura.getDate() + 30)
      expect(validarFechaVencimiento(fechaFutura.toISOString().split("T")[0])).toBe(true)
    })

    test("debe rechazar fecha pasada o presente", () => {
      const fechaPasada = new Date()
      fechaPasada.setDate(fechaPasada.getDate() - 1)
      expect(validarFechaVencimiento(fechaPasada.toISOString().split("T")[0])).toBe(false)

      const hoy = new Date().toISOString().split("T")[0]
      expect(validarFechaVencimiento(hoy)).toBe(false)
    })
  })

  describe("validarNombreCompleto", () => {
    test("debe validar nombre completo correcto", () => {
      expect(validarNombreCompleto("Juan Pérez")).toBe(true)
      expect(validarNombreCompleto("María José García")).toBe(true)
      expect(validarNombreCompleto("José")).toBe(true)
    })

    test("debe rechazar nombre incorrecto", () => {
      expect(validarNombreCompleto("")).toBe(false)
      expect(validarNombreCompleto("AB")).toBe(false) // Muy corto
      expect(validarNombreCompleto("Juan123")).toBe(false) // Con números
      expect(validarNombreCompleto(null)).toBe(false)
    })
  })

  describe("validarDescripcionEvento", () => {
    test("debe validar descripción suficientemente larga", () => {
      expect(validarDescripcionEvento("Esta es una descripción válida")).toBe(true)
      expect(validarDescripcionEvento("Conductor del mes por excelente desempeño")).toBe(true)
    })

    test("debe rechazar descripción muy corta", () => {
      expect(validarDescripcionEvento("Corta")).toBe(false)
      expect(validarDescripcionEvento("")).toBe(false)
      expect(validarDescripcionEvento(null)).toBe(false)
    })
  })

  describe("validarTipoEvento", () => {
    test("debe validar tipos de evento válidos", () => {
      expect(validarTipoEvento("sanción")).toBe(true)
      expect(validarTipoEvento("premio")).toBe(true)
      expect(validarTipoEvento("incidente")).toBe(true)
    })

    test("debe rechazar tipos de evento inválidos", () => {
      expect(validarTipoEvento("invalido")).toBe(false)
      expect(validarTipoEvento("")).toBe(false)
      expect(validarTipoEvento(null)).toBe(false)
      expect(validarTipoEvento("SANCIÓN")).toBe(false) // Case sensitive
    })
  })
})

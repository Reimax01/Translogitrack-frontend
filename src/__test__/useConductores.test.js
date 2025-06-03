import { renderHook, act } from "@testing-library/react"
import { useConductores } from "../hooks/useConductores"
import jest from "jest"

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock toast
jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}))

describe("useConductores", () => {
  beforeEach(() => {
    fetch.mockClear()
    localStorageMock.getItem.mockReturnValue("mock-jwt-token")
  })

  test("debe cargar conductores inicialmente", async () => {
    const mockResponse = {
      total: 2,
      pagina: 1,
      porPagina: 10,
      conductores: [
        {
          id_conductor: 1,
          nombre_completo: "Juan Pérez",
          numero_licencia: "LIC-123",
          fecha_vencimiento_licencia: "2025-12-31",
          activo: true,
        },
        {
          id_conductor: 2,
          nombre_completo: "María García",
          numero_licencia: "LIC-456",
          fecha_vencimiento_licencia: "2025-06-15",
          activo: true,
        },
      ],
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useConductores())

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(result.current.conductores).toHaveLength(2)
    expect(result.current.total).toBe(2)
    expect(result.current.loading).toBe(false)
  })

  test("debe validar licencia única correctamente", () => {
    const { result } = renderHook(() => useConductores())

    // Simular conductores existentes
    act(() => {
      result.current.conductores = [
        { id_conductor: 1, numero_licencia: "LIC-123" },
        { id_conductor: 2, numero_licencia: "LIC-456" },
      ]
    })

    expect(result.current.verificarLicenciaUnica("LIC-789")).toBe(true)
    expect(result.current.verificarLicenciaUnica("LIC-123")).toBe(false)
    expect(result.current.verificarLicenciaUnica("LIC-123", 1)).toBe(true) // Excluir ID 1
  })

  test("debe manejar errores de autenticación", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    // Mock window.location.replace
    const mockReplace = jest.fn()
    Object.defineProperty(window, "location", {
      value: { replace: mockReplace },
      writable: true,
    })

    const { result } = renderHook(() => useConductores())

    await act(async () => {
      await result.current.listarConductores()
    })

    expect(mockReplace).toHaveBeenCalledWith("/login")
  })
})

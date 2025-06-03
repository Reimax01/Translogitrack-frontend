"use client"

import { useCallback } from "react"
import { useAuthToken } from "./useAuth"

/**
 * Hook para realizar peticiones HTTP autenticadas
 * @returns {Function} - Función fetch autenticada
 */
export function useAuthenticatedFetch() {
  const { getAuthHeaders } = useAuthToken()

  /**
   * Función fetch que incluye automáticamente headers de autenticación
   * @param {string} url - URL de la petición
   * @param {Object} options - Opciones de fetch
   * @returns {Promise<Response>} - Respuesta de la petición
   */
  const authenticatedFetch = useCallback(
    async (url, options = {}) => {
      const authHeaders = getAuthHeaders()

      const config = {
        ...options,
        headers: {
          ...authHeaders,
          ...options.headers,
        },
      }

      return fetch(url, config)
    },
    [getAuthHeaders],
  )

  return authenticatedFetch
}

export default useAuthenticatedFetch

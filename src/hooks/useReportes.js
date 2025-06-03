"use client"

import { useState, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

// URLs base de las APIs existentes
const API_BASE_URL = "https://translogitrack-server-production.up.railway.app/api"
const TOKEN_KEY = "translogitrack_token"

/**
 * Hook personalizado para generar reportes desde APIs existentes
 * @returns {Object} Estados y funciones para gestionar reportes
 */
export function useReportes() {
  // Estados del hook
  const [reporteData, setReporteData] = useState({
    general: null,
    pedidos: null,
    conductores: null,
    camiones: null,
    rutas: null,
    usuarios: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Función para obtener headers de autorización
   * @returns {Object} Headers con token de autorización
   */
  const getHeaders = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }, [])

  /**
   * Función para manejar errores de autenticación
   * @param {Response} response - Respuesta de fetch
   */
  const handleAuthError = useCallback((response) => {
    if (response.status === 401) {
      console.warn("Token expirado o inválido, redirigiendo a login...")
      window.location.replace("/login")
      return true
    }
    return false
  }, [])

  /**
   * Función para obtener datos de pedidos con filtros de fecha
   * @param {string} fechaInicio - Fecha de inicio
   * @param {string} fechaFin - Fecha de fin
   * @returns {Promise<Object>} - Datos de pedidos
   */
  const obtenerDatosPedidos = useCallback(
    async (fechaInicio = null, fechaFin = null) => {
      try {
        const queryParams = new URLSearchParams({ limit: "1000" })
        if (fechaInicio) queryParams.append("fechaInicio", fechaInicio)
        if (fechaFin) queryParams.append("fechaFin", fechaFin)

        const response = await fetch(`${API_BASE_URL}/pedidos?${queryParams.toString()}`, {
          headers: getHeaders(),
        })

        if (handleAuthError(response)) return null
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

        const data = await response.json()
        return data.pedidos || []
      } catch (err) {
        console.error("Error al obtener pedidos:", err)
        return []
      }
    },
    [getHeaders, handleAuthError],
  )

  /**
   * Función para obtener datos de conductores
   * @returns {Promise<Object>} - Datos de conductores
   */
  const obtenerDatosConductores = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/conductores?limit=1000`, {
        headers: getHeaders(),
      })

      if (handleAuthError(response)) return null
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

      const data = await response.json()
      return data.conductores || []
    } catch (err) {
      console.error("Error al obtener conductores:", err)
      return []
    }
  }, [getHeaders, handleAuthError])

  /**
   * Función para obtener datos de camiones
   * @returns {Promise<Object>} - Datos de camiones
   */
  const obtenerDatosCamiones = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/camiones?limit=1000`, {
        headers: getHeaders(),
      })

      if (handleAuthError(response)) return null
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

      const data = await response.json()
      return data.camiones || []
    } catch (err) {
      console.error("Error al obtener camiones:", err)
      return []
    }
  }, [getHeaders, handleAuthError])

  /**
   * Función para obtener datos de rutas
   * @returns {Promise<Object>} - Datos de rutas
   */
  const obtenerDatosRutas = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rutas?limit=1000`, {
        headers: getHeaders(),
      })

      if (handleAuthError(response)) return null
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

      const data = await response.json()
      return data.rutas || []
    } catch (err) {
      console.error("Error al obtener rutas:", err)
      return []
    }
  }, [getHeaders, handleAuthError])

  /**
   * Función para obtener datos de usuarios
   * @returns {Promise<Object>} - Datos de usuarios
   */
  const obtenerDatosUsuarios = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios?limit=1000`, {
        headers: getHeaders(),
      })

      if (handleAuthError(response)) return null
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`)

      const data = await response.json()
      return data.usuarios || []
    } catch (err) {
      console.error("Error al obtener usuarios:", err)
      return []
    }
  }, [getHeaders, handleAuthError])

  /**
   * Función para generar reporte general
   * @param {string} fechaInicio - Fecha de inicio
   * @param {string} fechaFin - Fecha de fin
   * @returns {Promise<void>}
   */
  const generarReporteGeneral = useCallback(
    async (fechaInicio = null, fechaFin = null) => {
      setLoading(true)
      setError(null)

      try {
        // Obtener datos de todas las APIs
        const [pedidos, conductores, camiones, rutas, usuarios] = await Promise.all([
          obtenerDatosPedidos(fechaInicio, fechaFin),
          obtenerDatosConductores(),
          obtenerDatosCamiones(),
          obtenerDatosRutas(),
          obtenerDatosUsuarios(),
        ])

        // Procesar estadísticas de pedidos
        const estadisticasPedidos = {
          total: pedidos.length,
          pendientes: pedidos.filter((p) => p.estado === "Pendiente").length,
          enTransito: pedidos.filter((p) => p.estado === "En tránsito").length,
          entregados: pedidos.filter((p) => p.estado === "Entregado").length,
          cancelados: pedidos.filter((p) => p.estado === "Cancelado").length,
          ingresosTotales: pedidos.reduce((sum, p) => sum + (Number(p.precio) || 0), 0),
        }

        // Procesar estadísticas de conductores
        const estadisticasConductores = {
          total: conductores.length,
          activos: conductores.filter((c) => c.activo).length,
          inactivos: conductores.filter((c) => !c.activo).length,
        }

        // Procesar estadísticas de camiones
        const estadisticasCamiones = {
          total: camiones.length,
          disponibles: camiones.filter((c) => c.estado_operativo === "Disponible" && c.activo).length,
          enMantenimiento: camiones.filter((c) => c.estado_operativo === "En mantenimiento").length,
          asignados: camiones.filter((c) => c.estado_operativo === "Asignado").length,
          inactivos: camiones.filter((c) => !c.activo).length,
        }

        // Procesar estadísticas de rutas
        const estadisticasRutas = {
          total: rutas.length,
          distanciaPromedio:
            rutas.length > 0 ? rutas.reduce((sum, r) => sum + Number(r.distancia_km), 0) / rutas.length : 0,
          rutaMasLarga: rutas.length > 0 ? Math.max(...rutas.map((r) => Number(r.distancia_km))) : 0,
          rutaMasCorta: rutas.length > 0 ? Math.min(...rutas.map((r) => Number(r.distancia_km))) : 0,
        }

        // Procesar estadísticas de usuarios
        const estadisticasUsuarios = {
          total: usuarios.length,
          administradores: usuarios.filter((u) => u.rol === "Administrador").length,
          operadores: usuarios.filter((u) => u.rol === "Operador").length,
          clientes: usuarios.filter((u) => u.rol === "Cliente").length,
        }

        // Generar datos para gráfico de tendencias (últimos 7 días)
        const hoy = new Date()
        const tendenciaPedidos = []
        for (let i = 6; i >= 0; i--) {
          const fecha = new Date(hoy)
          fecha.setDate(fecha.getDate() - i)
          const fechaStr = fecha.toISOString().split("T")[0]

          const pedidosDelDia = pedidos.filter((p) => {
            const fechaPedido = new Date(p.fecha_creacion).toISOString().split("T")[0]
            return fechaPedido === fechaStr
          }).length

          tendenciaPedidos.push({
            fecha: fechaStr,
            pedidos: pedidosDelDia,
            dia: fecha.toLocaleDateString("es-ES", { weekday: "short" }),
          })
        }

        const reporteGeneral = {
          pedidos: estadisticasPedidos,
          conductores: estadisticasConductores,
          camiones: estadisticasCamiones,
          rutas: estadisticasRutas,
          usuarios: estadisticasUsuarios,
          tendenciaPedidos,
          fechaGeneracion: new Date().toISOString(),
          rangoFechas: { inicio: fechaInicio, fin: fechaFin },
        }

        setReporteData((prev) => ({ ...prev, general: reporteGeneral }))
        console.log("✅ Reporte general generado")
      } catch (err) {
        console.error("❌ Error al generar reporte general:", err)
        setError("Error al generar reporte general")
        toast({
          title: "Error",
          description: "No se pudo generar el reporte general",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [obtenerDatosPedidos, obtenerDatosConductores, obtenerDatosCamiones, obtenerDatosRutas, obtenerDatosUsuarios],
  )

  /**
   * Función para generar reporte específico de pedidos
   * @param {string} fechaInicio - Fecha de inicio
   * @param {string} fechaFin - Fecha de fin
   * @returns {Promise<void>}
   */
  const generarReportePedidos = useCallback(
    async (fechaInicio = null, fechaFin = null) => {
      setLoading(true)
      setError(null)

      try {
        const pedidos = await obtenerDatosPedidos(fechaInicio, fechaFin)

        // Análisis por estado
        const porEstado = {
          Pendiente: pedidos.filter((p) => p.estado === "Pendiente"),
          "En tránsito": pedidos.filter((p) => p.estado === "En tránsito"),
          Entregado: pedidos.filter((p) => p.estado === "Entregado"),
          Cancelado: pedidos.filter((p) => p.estado === "Cancelado"),
        }

        // Análisis por ruta más utilizada
        const rutasUtilizadas = {}
        pedidos.forEach((pedido) => {
          if (pedido.ruta) {
            const rutaKey = `${pedido.ruta.origen} → ${pedido.ruta.destino}`
            rutasUtilizadas[rutaKey] = (rutasUtilizadas[rutaKey] || 0) + 1
          }
        })

        // Análisis de ingresos
        const ingresosPorMes = {}
        pedidos.forEach((pedido) => {
          if (pedido.precio && pedido.fecha_creacion) {
            const mes = new Date(pedido.fecha_creacion).toISOString().slice(0, 7) // YYYY-MM
            ingresosPorMes[mes] = (ingresosPorMes[mes] || 0) + Number(pedido.precio)
          }
        })

        const reportePedidos = {
          total: pedidos.length,
          porEstado,
          rutasUtilizadas,
          ingresosPorMes,
          ingresoTotal: pedidos.reduce((sum, p) => sum + (Number(p.precio) || 0), 0),
          tiempoPromedioEntrega: 0, // Calcular si hay fechas de entrega
          fechaGeneracion: new Date().toISOString(),
          rangoFechas: { inicio: fechaInicio, fin: fechaFin },
        }

        setReporteData((prev) => ({ ...prev, pedidos: reportePedidos }))
        console.log("✅ Reporte de pedidos generado")
      } catch (err) {
        console.error("❌ Error al generar reporte de pedidos:", err)
        setError("Error al generar reporte de pedidos")
        toast({
          title: "Error",
          description: "No se pudo generar el reporte de pedidos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [obtenerDatosPedidos],
  )

  /**
   * Función para limpiar errores
   */
  const limpiarError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Función para exportar datos (simulado)
   * @param {string} formato - Formato de exportación (pdf, excel)
   * @param {string} tipoReporte - Tipo de reporte
   * @returns {Promise<void>}
   */
  const exportarReporte = useCallback(async (formato, tipoReporte) => {
    // Simulación de exportación
    toast({
      title: "Exportación iniciada",
      description: `Generando archivo ${formato.toUpperCase()} del reporte de ${tipoReporte}...`,
    })

    // Aquí se implementaría la lógica real de exportación
    setTimeout(() => {
      toast({
        title: "Exportación completada",
        description: `El reporte ha sido exportado exitosamente`,
      })
    }, 2000)
  }, [])

  return {
    // Estados
    reporteData,
    loading,
    error,

    // Funciones
    generarReporteGeneral,
    generarReportePedidos,
    exportarReporte,
    limpiarError,
  }
}

export default useReportes

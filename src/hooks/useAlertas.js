"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "@/hooks/use-toast"

const API_BASE_URL = "https://translogitrack-server-production.up.railway.app/api"
const TOKEN_KEY = "translogitrack_token"

export function useAlertas() {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }, [])

  const handleAuthError = useCallback((response) => {
    if (response.status === 401) {
      console.warn("Token expirado o inválido")
      window.location.replace("/login")
      return true
    }
    return false
  }, [])

  // Función principal para generar alertas basadas en datos reales
  const obtenerAlertas = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("🔍 Analizando datos para generar alertas...")

      // Obtener datos de todos los endpoints disponibles
      const [pedidosResponse, conductoresResponse, camionesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/pedidos?limit=100`, { headers: getHeaders() }).catch(() => null),
        fetch(`${API_BASE_URL}/conductores`, { headers: getHeaders() }).catch(() => null),
        fetch(`${API_BASE_URL}/camiones`, { headers: getHeaders() }).catch(() => null),
      ])

      const alertasGeneradas = []
      const ahora = new Date()

      // 1. ALERTAS BASADAS EN PEDIDOS
      if (pedidosResponse?.ok) {
        const pedidosData = await pedidosResponse.json()
        const pedidos = pedidosData.pedidos || pedidosData || []

        console.log(`📦 Analizando ${pedidos.length} pedidos...`)

        // Pedidos atrasados (crítico)
        const pedidosAtrasados = pedidos.filter((p) => {
          if (p.fecha_entrega_estimada && p.estado !== "Entregado") {
            const fechaEstimada = new Date(p.fecha_entrega_estimada)
            return fechaEstimada < ahora
          }
          return false
        })

        if (pedidosAtrasados.length > 0) {
          alertasGeneradas.push({
            id: "pedidos-atrasados",
            tipo: "error",
            mensaje: `${pedidosAtrasados.length} pedido(s) tienen entrega atrasada`,
            fecha: ahora.toISOString(),
            detalles: pedidosAtrasados
              .slice(0, 5)
              .map(
                (p) =>
                  `Pedido #${p.id_pedido} - Cliente: ${p.cliente?.nombre_completo || "N/A"} - Atrasado desde: ${new Date(p.fecha_entrega_estimada).toLocaleDateString()}`,
              ),
            accion: "Contactar clientes y reprogramar entregas",
            prioridad: "alta",
          })
        }

        // Pedidos próximos a vencer (24 horas)
        const pedidosProximosVencer = pedidos.filter((p) => {
          if (p.fecha_entrega_estimada && p.estado !== "Entregado") {
            const fechaEstimada = new Date(p.fecha_entrega_estimada)
            const diferenciaDias = (fechaEstimada - ahora) / (1000 * 60 * 60 * 24)
            return diferenciaDias > 0 && diferenciaDias <= 1
          }
          return false
        })

        if (pedidosProximosVencer.length > 0) {
          alertasGeneradas.push({
            id: "pedidos-proximos",
            tipo: "advertencia",
            mensaje: `${pedidosProximosVencer.length} pedido(s) deben entregarse en las próximas 24 horas`,
            fecha: ahora.toISOString(),
            detalles: pedidosProximosVencer
              .slice(0, 5)
              .map(
                (p) =>
                  `Pedido #${p.id_pedido} - Cliente: ${p.cliente?.nombre_completo || "N/A"} - Entrega: ${new Date(p.fecha_entrega_estimada).toLocaleDateString()}`,
              ),
            accion: "Verificar rutas y confirmar entregas",
            prioridad: "media",
          })
        }

        // Pedidos pendientes por mucho tiempo (más de 7 días)
        const pedidosPendientesLargos = pedidos.filter((p) => {
          if (p.estado === "Pendiente") {
            const fechaCreacion = new Date(p.fecha_creacion)
            const diferenciaDias = (ahora - fechaCreacion) / (1000 * 60 * 60 * 24)
            return diferenciaDias > 7
          }
          return false
        })

        if (pedidosPendientesLargos.length > 0) {
          alertasGeneradas.push({
            id: "pedidos-pendientes-largos",
            tipo: "advertencia",
            mensaje: `${pedidosPendientesLargos.length} pedido(s) llevan más de 7 días pendientes`,
            fecha: ahora.toISOString(),
            detalles: pedidosPendientesLargos
              .slice(0, 5)
              .map(
                (p) =>
                  `Pedido #${p.id_pedido} - Creado: ${new Date(p.fecha_creacion).toLocaleDateString()} - Cliente: ${p.cliente?.nombre_completo || "N/A"}`,
              ),
            accion: "Revisar y asignar recursos",
            prioridad: "media",
          })
        }
      }

      // 2. ALERTAS BASADAS EN CONDUCTORES
      if (conductoresResponse?.ok) {
        const conductoresData = await conductoresResponse.json()
        const conductores = conductoresData.conductores || conductoresData || []

        console.log(`👨‍💼 Analizando ${conductores.length} conductores...`)

        // Licencias próximas a vencer (30 días)
        const licenciasVencen = conductores.filter((c) => {
          if (c.fecha_vencimiento_licencia) {
            const fechaVencimiento = new Date(c.fecha_vencimiento_licencia)
            const diferenciaDias = (fechaVencimiento - ahora) / (1000 * 60 * 60 * 24)
            return diferenciaDias > 0 && diferenciaDias <= 30
          }
          return false
        })

        if (licenciasVencen.length > 0) {
          alertasGeneradas.push({
            id: "licencias-vencen",
            tipo: "advertencia",
            mensaje: `${licenciasVencen.length} licencia(s) de conductor vencerán pronto`,
            fecha: ahora.toISOString(),
            detalles: licenciasVencen.map((c) => {
              const diasRestantes = Math.ceil((new Date(c.fecha_vencimiento_licencia) - ahora) / (1000 * 60 * 60 * 24))
              return `${c.nombre_completo} - Vence en ${diasRestantes} días (${new Date(c.fecha_vencimiento_licencia).toLocaleDateString()})`
            }),
            accion: "Programar renovación de licencias",
            prioridad: "media",
          })
        }

        // Licencias ya vencidas
        const licenciasVencidas = conductores.filter((c) => {
          if (c.fecha_vencimiento_licencia) {
            const fechaVencimiento = new Date(c.fecha_vencimiento_licencia)
            return fechaVencimiento < ahora
          }
          return false
        })

        if (licenciasVencidas.length > 0) {
          alertasGeneradas.push({
            id: "licencias-vencidas",
            tipo: "error",
            mensaje: `${licenciasVencidas.length} conductor(es) tienen licencia vencida`,
            fecha: ahora.toISOString(),
            detalles: licenciasVencidas.map(
              (c) =>
                `${c.nombre_completo} - Vencida desde: ${new Date(c.fecha_vencimiento_licencia).toLocaleDateString()}`,
            ),
            accion: "URGENTE: Suspender operaciones y renovar licencias",
            prioridad: "alta",
          })
        }
      }

      // 3. ALERTAS BASADAS EN CAMIONES
      if (camionesResponse?.ok) {
        const camionesData = await camionesResponse.json()
        const camiones = camionesData.camiones || camionesData || []

        console.log(`🚛 Analizando ${camiones.length} camiones...`)

        // Mantenimiento próximo (7 días)
        const camionesMantenimiento = camiones.filter((c) => {
          if (c.proximo_mantenimiento) {
            const fechaMantenimiento = new Date(c.proximo_mantenimiento)
            const diferenciaDias = (fechaMantenimiento - ahora) / (1000 * 60 * 60 * 24)
            return diferenciaDias <= 7 && diferenciaDias > 0
          }
          return false
        })

        if (camionesMantenimiento.length > 0) {
          alertasGeneradas.push({
            id: "mantenimiento-camiones",
            tipo: "advertencia",
            mensaje: `${camionesMantenimiento.length} camión(es) requieren mantenimiento pronto`,
            fecha: ahora.toISOString(),
            detalles: camionesMantenimiento.map((c) => {
              const diasRestantes = Math.ceil((new Date(c.proximo_mantenimiento) - ahora) / (1000 * 60 * 60 * 24))
              return `${c.placa} (${c.modelo}) - Mantenimiento en ${diasRestantes} días`
            }),
            accion: "Programar mantenimiento preventivo",
            prioridad: "media",
          })
        }

        // Mantenimiento vencido
        const camionesMantenimientoVencido = camiones.filter((c) => {
          if (c.proximo_mantenimiento) {
            const fechaMantenimiento = new Date(c.proximo_mantenimiento)
            return fechaMantenimiento < ahora
          }
          return false
        })

        if (camionesMantenimientoVencido.length > 0) {
          alertasGeneradas.push({
            id: "mantenimiento-vencido",
            tipo: "error",
            mensaje: `${camionesMantenimientoVencido.length} camión(es) tienen mantenimiento vencido`,
            fecha: ahora.toISOString(),
            detalles: camionesMantenimientoVencido.map(
              (c) =>
                `${c.placa} (${c.modelo}) - Vencido desde: ${new Date(c.proximo_mantenimiento).toLocaleDateString()}`,
            ),
            accion: "URGENTE: Retirar de servicio hasta mantenimiento",
            prioridad: "alta",
          })
        }

        // Camiones inactivos
        const camionesInactivos = camiones.filter((c) => c.estado === "Inactivo" || c.activo === false)

        if (camionesInactivos.length > 0) {
          alertasGeneradas.push({
            id: "camiones-inactivos",
            tipo: "info",
            mensaje: `${camionesInactivos.length} camión(es) están inactivos`,
            fecha: ahora.toISOString(),
            detalles: camionesInactivos.map((c) => `${c.placa} (${c.modelo}) - Estado: ${c.estado || "Inactivo"}`),
            accion: "Revisar disponibilidad de flota",
            prioridad: "baja",
          })
        }
      }

      // 4. ALERTAS GENERALES DEL SISTEMA
      // Ya no intentamos usar pedidosResponse.clone() ni leer el body nuevamente
      // En su lugar, usamos variables para el conteo
      let totalPedidos = 0
      let pedidosPendientes = 0

      // Si tenemos datos de pedidos, los usamos para las estadísticas
      if (pedidosResponse?.ok) {
        const pedidosData = await pedidosResponse.json()
        const pedidos = pedidosData.pedidos || pedidosData || []
        totalPedidos = pedidos.length
        pedidosPendientes = pedidos.filter((p) => p.estado === "Pendiente").length

        // Alerta de rendimiento si hay muchos pedidos pendientes
        if (pedidosPendientes > totalPedidos * 0.3 && totalPedidos > 10) {
          alertasGeneradas.push({
            id: "alto-volumen-pendientes",
            tipo: "advertencia",
            mensaje: `Alto volumen de pedidos pendientes: ${pedidosPendientes} de ${totalPedidos}`,
            fecha: ahora.toISOString(),
            detalles: [`${Math.round((pedidosPendientes / totalPedidos) * 100)}% de pedidos están pendientes`],
            accion: "Revisar capacidad operativa y asignación de recursos",
            prioridad: "media",
          })
        }
      }

      // Ordenar alertas por prioridad
      const prioridadOrden = { alta: 1, media: 2, baja: 3 }
      alertasGeneradas.sort((a, b) => (prioridadOrden[a.prioridad] || 3) - (prioridadOrden[b.prioridad] || 3))

      // Si no hay alertas, mostrar mensaje positivo
      if (alertasGeneradas.length === 0) {
        alertasGeneradas.push({
          id: "sin-alertas",
          tipo: "success",
          mensaje: "¡Excelente! No hay alertas críticas en este momento",
          fecha: ahora.toISOString(),
          detalles: ["Todos los sistemas operan dentro de los parámetros normales"],
          accion: "Continuar con las operaciones normales",
          prioridad: "baja",
        })
      }

      console.log(`✅ Generadas ${alertasGeneradas.length} alertas basadas en análisis de datos`)
      setAlertas(alertasGeneradas)
    } catch (error) {
      console.error("❌ Error al generar alertas:", error)
      setError("Error al analizar datos para alertas")

      // Alerta de error del sistema
      setAlertas([
        {
          id: "error-sistema",
          tipo: "error",
          mensaje: "Error al cargar alertas del sistema",
          fecha: new Date().toISOString(),
          detalles: ["No se pudieron analizar los datos del sistema"],
          accion: "Verificar conectividad y permisos",
          prioridad: "alta",
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [getHeaders])

  // Función para marcar alerta como leída (solo local)
  const marcarComoLeida = useCallback(async (alertaId) => {
    setAlertas((prev) => prev.filter((a) => a.id !== alertaId))
    toast({
      title: "Alerta marcada como leída",
      description: "La alerta ha sido eliminada de la lista",
    })
  }, [])

  // Función para obtener alertas por prioridad
  const getAlertasPorPrioridad = useCallback(
    (prioridad) => {
      return alertas.filter((a) => a.prioridad === prioridad)
    },
    [alertas],
  )

  // Función para obtener conteo de alertas por tipo
  const getConteoAlertas = useCallback(() => {
    return {
      total: alertas.length,
      criticas: alertas.filter((a) => a.tipo === "error").length,
      advertencias: alertas.filter((a) => a.tipo === "advertencia").length,
      informativas: alertas.filter((a) => a.tipo === "info" || a.tipo === "success").length,
    }
  }, [alertas])

  // Cargar alertas al montar el componente
  useEffect(() => {
    obtenerAlertas()

    // Actualizar alertas cada 5 minutos
    const interval = setInterval(obtenerAlertas, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [obtenerAlertas])

  return {
    alertas,
    loading,
    error,
    obtenerAlertas,
    marcarComoLeida,
    getAlertasPorPrioridad,
    getConteoAlertas,
  }
}

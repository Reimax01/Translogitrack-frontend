"use client"

import { useState, useEffect } from "react"
import { usePedidos } from "../hooks/usePedidos"
import KPIBox from "./ui/KPIBox"
import PedidosRecientes from "./ui/PedidosRecientes"
import AlertasCard from "./ui/AlertasCard"
import EstadoBanner from "./ui/EstadoBanner"
import { useNavigate } from "react-router-dom"


function Dashboard() {
  // Usar el hook personalizado para obtener los pedidos
  const { pedidos, loading, error, refetch, isUsingMockData, useMockData } = usePedidos()
  const navigate = useNavigate()

  // Estado para las alertas
  const [alertas, setAlertas] = useState([])
  const [alertasLoading, setAlertasLoading] = useState(true)

  // Efecto para simular la carga de alertas
  useEffect(() => {
    const cargarAlertas = async () => {
      setAlertasLoading(true)
      // Simulamos una carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Alertas de ejemplo
      setAlertas([
        {
          id: "1",
          tipo: "advertencia",
          mensaje: "3 licencias de conductores vencerán en los próximos 30 días",
          fecha: new Date().toISOString(),
        },
        {
          id: "2",
          tipo: "error",
          mensaje: "Camión CAM-003 requiere mantenimiento urgente",
          fecha: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
        },
      ])

      setAlertasLoading(false)
    }

    cargarAlertas()
  }, [])

  // Calcular estadísticas dinámicas
  const totalPedidos = pedidos.length
  const pedidosEntregados = pedidos.filter((p) => p.estado === "Entregado").length
  const pedidosEnTransito = pedidos.filter((p) => p.estado === "En tránsito").length
  const pedidosPendientes = pedidos.filter((p) => p.estado === "Pendiente").length

  // Configuración de las tarjetas de KPI
  const kpis = [
    {
      titulo: "Total Pedidos",
      valor: totalPedidos,
      icono: "📦",
      colorFondo: "bg-blue-50",
    },
    {
      titulo: "Entregados",
      valor: pedidosEntregados,
      icono: "✅",
      colorFondo: "bg-green-50",
    },
    {
      titulo: "En Tránsito",
      valor: pedidosEnTransito,
      icono: "🚛",
      colorFondo: "bg-yellow-50",
    },
    {
      titulo: "Pendientes",
      valor: pedidosPendientes,
      icono: "⏳",
      colorFondo: "bg-purple-50",
    },
  ]

  // Función para manejar "Ver todos los pedidos"
  const handleVerTodosPedidos = () => {
    console.log("Navegando a la vista completa de pedidos")
    navigate("/dashboard/pedidos", { replace: true })
    // Aquí iría la navegación a la página de pedidos
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Título principal */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
          <p className="mt-1 text-sm text-gray-500">Bienvenido al panel de control de TransLogiTrack</p>
        </div>

        {/* Banner de estado de datos */}
        <EstadoBanner isUsingMockData={isUsingMockData} error={error} />

        {/* Grid de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, index) => (
            <KPIBox
              key={index}
              titulo={kpi.titulo}
              valor={kpi.valor}
              icono={kpi.icono}
              colorFondo={kpi.colorFondo}
              loading={loading}
            />
          ))}
        </div>

        {/* Contenido principal en dos columnas en pantallas grandes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pedidos recientes (ocupa 2/3 en pantallas grandes) */}
          <div className="lg:col-span-2">
            <PedidosRecientes
              pedidos={pedidos.slice(0, 5)} // Mostrar solo los 5 más recientes
              loading={loading}
              onVerMas={handleVerTodosPedidos}
            />
          </div>

          {/* Alertas del sistema (ocupa 1/3 en pantallas grandes) */}
          <div className="lg:col-span-1">
            <AlertasCard alertas={alertas} loading={alertasLoading} />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={refetch}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "Actualizando..." : "Actualizar Datos"}
          </button>

          {isUsingMockData && (
            <button
              onClick={useMockData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
              Cargar Datos de Ejemplo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

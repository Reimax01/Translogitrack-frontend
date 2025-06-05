"use client"
import { usePedidos } from "../../hooks/usePedidos"
import { useAlertas } from "../../hooks/useAlertas"
import KPIBox from "../ui/KPIBox"
import PedidosRecientes from "../ui/PedidosRecientes"
import AlertasCard from "../ui/AlertasCard"
import EstadoBanner from "../ui/EstadoBanner"
import { useNavigate } from "react-router-dom"

function OperatorDashboard({ user }) {
  const { pedidos, loading, error, refetch, isUsingMockData } = usePedidos()
  const { alertas, loading: alertasLoading, obtenerAlertas } = useAlertas()
  const navigate = useNavigate()

  // Filtrar alertas relevantes para operadores (solo operacionales)
  const alertasOperacionales = alertas.filter((alerta) => alerta.tipo === "advertencia" || alerta.tipo === "error")

  // Calcular estadísticas limitadas para operador
  const totalPedidos = pedidos.length
  const pedidosEnTransito = pedidos.filter((p) => p.estado === "En tránsito").length
  const pedidosPendientes = pedidos.filter((p) => p.estado === "Pendiente").length
  const pedidosHoy = pedidos.filter((p) => {
    const hoy = new Date().toDateString()
    const fechaPedido = new Date(p.fecha_creacion).toDateString()
    return fechaPedido === hoy
  }).length

  // KPIs limitados para operador
  const kpis = [
    {
      titulo: "Pedidos Hoy",
      valor: pedidosHoy,
      icono: "📅",
      colorFondo: "bg-blue-50",
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
    {
      titulo: "Total Activos",
      valor: pedidosEnTransito + pedidosPendientes,
      icono: "📊",
      colorFondo: "bg-green-50",
    },
  ]

  const handleVerTodosPedidos = () => {
    navigate("/dashboard/pedidos", { replace: true })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Título principal */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Operacional</h1>
          <p className="mt-1 text-sm text-gray-500">Bienvenido, {user.nombre_completo} - Panel de control operativo</p>
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

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PedidosRecientes
              pedidos={pedidos.slice(0, 8)} // Más pedidos para operadores
              loading={loading}
              onVerMas={handleVerTodosPedidos}
            />
          </div>

          <div className="lg:col-span-1">
            <AlertasCard alertas={alertasOperacionales} loading={alertasLoading} titulo="Alertas Operacionales" />
          </div>
        </div>

        {/* Botones de acción limitados para operador */}
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
            {loading ? "Actualizando..." : "Actualizar Pedidos"}
          </button>

          <button
            onClick={() => navigate("/dashboard/rutas")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Ver Rutas
          </button>

          <button
            onClick={() => navigate("/dashboard/seguimiento")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Seguimiento GPS
          </button>
        </div>
      </div>
    </div>
  )
}

export default OperatorDashboard

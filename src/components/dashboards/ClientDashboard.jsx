"use client"

import { usePedidos } from "../../hooks/usePedidos"
import KPIBox from "../ui/KPIBox"
import PedidosRecientes from "../ui/PedidosRecientes"
import { useAuth } from "@/hooks/useAuth"
import EstadoBanner from "../ui/EstadoBanner"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

function ClientDashboard({  }) {
  const navigate = useNavigate()
  const { getUser } = useAuth()
  const user = getUser()


  // Usar el hook de pedidos con el ID del cliente directamente
  const { pedidos, loading, error, refetch, isUsingMockData, useMockData } = usePedidos()

  // Asegurarnos de que tenemos el ID del usuario
  const userId = user?.id
  console.log(`🔍 ClientDashboard - Cargando pedidos para cliente ID: ${userId}`)

  // Efecto para cargar los pedidos del cliente específico
  useEffect(() => {
    if (userId) {
      console.log(`🔍 ClientDashboard - Cargando pedidos para cliente ID: ${userId}`)
      // Llamar directamente a listarPedidos con el ID del cliente
      refetch()
    }
  }, [userId, refetch])

  // Filtrar pedidos del cliente actual
  const misPedidos = pedidos.filter((p) => {
    // Verificar múltiples formas de identificar al cliente
    const clienteId = p.id_cliente || (p.cliente && p.cliente.id_usuario)
    const match = clienteId === userId
    console.log(`🔍 Pedido #${p.id_pedido}: clienteId=${clienteId}, userId=${userId}, match=${match}`)
    return match
  })

  console.log(`📊 ClientDashboard - Estadísticas:`, {
    totalPedidos: pedidos.length,
    misPedidos: misPedidos.length,
    userId: userId,
    pedidosIds: pedidos.map((p) => p.id_pedido).join(", "),
  })

  const totalMisPedidos = misPedidos.length
  const pedidosEntregados = misPedidos.filter((p) => p.estado === "Entregado").length
  const pedidosEnTransito = misPedidos.filter((p) => p.estado === "En tránsito").length
  const pedidosPendientes = misPedidos.filter((p) => p.estado === "Pendiente").length

  // KPIs específicos para cliente
  const kpis = [
    {
      titulo: "Mis Pedidos",
      valor: totalMisPedidos,
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

  const handleVerTodosMisPedidos = () => {
    navigate("/dashboard/mis-pedidos", { replace: true })
  }

  const handleSolicitarPedido = () => {
    navigate("/dashboard/nuevo-pedido", { replace: true })
  }

  // Mostrar información de debugging si no hay usuario
  if (!user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-yellow-900">Cargando información del usuario...</h3>
            <p className="mt-2 text-yellow-700">
              Si este mensaje persiste, puede haber un problema con la autenticación.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Título principal */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bienvenido, {user.nombre_completo} - Gestiona tus pedidos y seguimiento
          </p>
          {/* Debug info */}
          <p className="mt-1 text-xs text-gray-400">
            ID Usuario: {user.id_usuario} | Email: {user.correo_electronico}
          </p>
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

        {/* Contenido principal - Solo pedidos del cliente */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <PedidosRecientes
              pedidos={misPedidos.slice(0, 10)} // Mostrar más pedidos propios
              loading={loading}
              onVerMas={handleVerTodosMisPedidos}
              titulo="Mis Pedidos Recientes"
              descripcion="Historial de tus pedidos más recientes"
            />
          </div>
        </div>

        {/* Información adicional para cliente */}
        {misPedidos.length === 0 && !loading && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-blue-900">¡Bienvenido a TransLogiTrack!</h3>
            <p className="mt-2 text-blue-700">
              Aún no tienes pedidos registrados. Solicita tu primer envío para comenzar.
            </p>
            {pedidos.length > 0 && (
              <p className="mt-1 text-sm text-blue-600">
                Hay {pedidos.length} pedidos en el sistema, pero ninguno está asociado a tu cuenta.
              </p>
            )}
          </div>
        )}

        {/* Botones de acción para cliente */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={handleSolicitarPedido}
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Solicitar Nuevo Pedido
          </button>

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
            {loading ? "Actualizando..." : "Actualizar Mis Pedidos"}
          </button>

          {pedidosEnTransito > 0 && (
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Rastrear Pedidos
            </button>
          )}

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

export default ClientDashboard

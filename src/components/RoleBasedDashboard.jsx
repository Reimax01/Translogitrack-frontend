"use client"

import { useAuth } from "../hooks/useAuth" // Usar el hook existente
import AdminDashboard from "./dashboards/AdminDashboard"
import OperatorDashboard from "./dashboards/OperatorDashboard"
import ClientDashboard from "./dashboards/ClientDashboard"

function RoleBasedDashboard() {
  const { user, loading, isAuthenticated } = useAuth()
  // Funciones helper para determinar el tipo de usuario
  const isAdmin = user?.rol === "Administrador" || user?.tipo_usuario === "Administrador"
  const isOperator = user?.rol === "Operador" || user?.tipo_usuario === "Operador"
  const isClient = user?.rol === "Cliente" || user?.tipo_usuario === "Cliente"
  console.log("🔍 id de usuario", user?.id_usuario)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Acceso no autorizado</h2>
          <p className="mt-2 text-gray-600">Por favor, inicia sesión para continuar</p>
        </div>
      </div>
    )
  }

  // Renderizar dashboard según el tipo de usuario
  if (isAdmin) {
    return <AdminDashboard user={user} />
  }

  if (isOperator) {
    return <OperatorDashboard user={user} />
  }

  if (isClient) {
    return <ClientDashboard user={user} />
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Tipo de usuario no reconocido</h2>
        <p className="mt-2 text-gray-600">Rol actual: {user?.rol || user?.tipo_usuario || "No definido"}</p>
        <p className="mt-1 text-sm text-gray-500">Contacta al administrador del sistema</p>
      </div>
    </div>
  )
}

export default RoleBasedDashboard

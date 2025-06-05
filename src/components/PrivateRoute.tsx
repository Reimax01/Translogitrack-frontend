"use client"

import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

interface PrivateRouteProps {
  children: ReactNode
  requiredRole?: "Administrador" | "Operador" | "Cliente"
  requiredRoles?: ("Administrador" | "Operador" | "Cliente")[]
}

function PrivateRoute({ children, requiredRole, requiredRoles }: PrivateRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-gray-500">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Verificando autenticación...
          </div>
        </div>
      </div>
    )
  }

  // Verificar autenticación
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Obtener el rol del usuario (compatible con diferentes estructuras)
  const userRole = user?.rol || user?.tipo_usuario

  // Verificar rol específico si se requiere
  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-2">No tienes permisos para acceder a esta sección.</p>
          <p className="text-sm text-gray-500">Rol requerido: {requiredRole}</p>
          <p className="text-sm text-gray-500">Tu rol actual: {userRole || "No definido"}</p>
        </div>
      </div>
    )
  }

  // Verificar múltiples roles si se requiere
  if (requiredRoles && Array.isArray(requiredRoles) && !requiredRoles.includes(userRole as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-2">No tienes permisos para acceder a esta sección.</p>
          <p className="text-sm text-gray-500">Roles permitidos: {requiredRoles.join(", ")}</p>
          <p className="text-sm text-gray-500">Tu rol actual: {userRole || "No definido"}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default PrivateRoute
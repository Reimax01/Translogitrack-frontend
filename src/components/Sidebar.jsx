"use client"

import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

function Sidebar({ activeItem, onItemClick, className = "" }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()

  // Configuración de los ítems del menú con rutas
  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z"
          />
        </svg>
      ),
    },
    {
      name: "Usuarios",
      href: "/dashboard/usuarios",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      name: "Pedidos",
      href: "/dashboard/pedidos",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      name: "Conductores",
      href: "/dashboard/conductores",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      name: "Camiones",
      href: "/dashboard/camiones",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
          />
        </svg>
      ),
    },
    {
      name: "Rutas",
      href: "/dashboard/rutas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
    },
    {
      name: "Reportes",
      href: "/dashboard/reportes",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      name: "Cerrar sesión",
      href: "/login",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
      isSpecial: true,
    },
  ]

  // Función para manejar el clic en un ítem
  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item.name)
    }

    // Comportamiento especial para cerrar sesión
    if (item.name === "Cerrar sesión") {
      if (window.confirm("¿Está seguro de que desea cerrar sesión?")) {
        logout()
        navigate("/login")
      }
    } else {
      navigate(item.href)
    }
  }

  // Determinar si un item está activo basado en la ruta actual
  const isItemActive = (item) => {
    if (item.href === "/dashboard") {
      return location.pathname === "/dashboard"
    }
    return location.pathname.startsWith(item.href)
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 hidden lg:block ${className}`}
    >
      {/* Header del sidebar */}
      <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div className="text-white">
            <h1 className="text-lg font-semibold">TransLogiTrack</h1>
            <p className="text-xs text-gray-300">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleItemClick(item)}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full text-left ${
                  isItemActive(item)
                    ? "bg-gray-900 text-white shadow-md"
                    : item.isSpecial
                      ? "text-gray-300 hover:bg-red-600 hover:text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                } ${item.isSpecial ? "mt-8 border-t border-gray-700 pt-4" : ""}`}
              >
                <span
                  className={`mr-3 flex-shrink-0 transition-colors ${
                    isItemActive(item) ? "text-white" : "text-gray-400 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>

                {/* Indicador de ítem activo */}
                {isItemActive(item) && <span className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer del sidebar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.nombre?.charAt(0) || user?.correo?.charAt(0) || "U"}
            </span>
          </div>
          <div className="text-white text-sm">
            <p className="font-medium">{user?.nombre || "Usuario"}</p>
            <p className="text-xs text-gray-400">{user?.correo || "usuario@translogitrack.com"}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// Componente para el overlay en móviles (opcional)
function SidebarOverlay({ isOpen, onClose }) {
  if (!isOpen) return null

  return <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" onClick={onClose} aria-hidden="true" />
}

// Componente para el botón de toggle en móviles
function SidebarToggle({ onClick, className = "" }) {
  return (
    <button
      type="button"
      className={`lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${className}`}
      onClick={onClick}
    >
      <span className="sr-only">Abrir menú principal</span>
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}

// Exportar componentes
export default Sidebar
export { SidebarOverlay, SidebarToggle }

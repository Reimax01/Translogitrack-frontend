"use client"

import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Header from "./Header"
import Sidebar, { SidebarOverlay } from "./Sidebar"
import { useAuth } from "../hooks/useAuth"

function Layout() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Mapear rutas a nombres de menú
  const getActiveItemFromPath = (pathname) => {
    if (pathname.includes("/pedidos")) return "Pedidos"
    if (pathname.includes("/conductores")) return "Conductores"
    if (pathname.includes("/camiones")) return "Camiones"
    if (pathname.includes("/rutas")) return "Rutas"
    if (pathname.includes("/reportes")) return "Reportes"
    if (pathname.includes("/usuarios")) return "Usuarios"
    return "Dashboard"
  }

  const activeItem = getActiveItemFromPath(location.pathname)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleItemClick = (itemName) => {
    setSidebarOpen(false) // Cerrar sidebar en móviles al hacer clic
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para desktop */}
      <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />

      {/* Sidebar para móviles */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar activeItem={activeItem} onItemClick={handleItemClick} className="relative" />

        {/* Botón para cerrar en móviles */}
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Overlay para móviles */}
      <SidebarOverlay isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          userName={user?.nombre_completo || user?.nombre || "Usuario"}
          userRole={user?.rol || "Invitado"}
          onMenuToggle={toggleSidebar}
        />

        {/* Contenido de las rutas */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout

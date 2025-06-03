"use client"

import { Outlet, useLocation } from "react-router-dom"
import Header from "./Header"
import Sidebar from "./Sidebar"
import { useAuth } from "../hooks/useAuth"

function Layout() {
  const { user } = useAuth()
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

  const handleItemClick = (itemName) => {
    // Esta función ya no es necesaria para cerrar sidebar móvil
    // El Sidebar maneja esto internamente
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - maneja desktop y móvil internamente */}
      <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - sin botón de menú */}
        <Header />

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

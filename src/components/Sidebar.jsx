"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { LayoutDashboard, Users, Package, UserCheck, Truck, Route, BarChart3, LogOut, Menu } from "lucide-react"

function Sidebar({ activeItem, onItemClick, className = "" }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Configuración de los ítems del menú con rutas
  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Usuarios",
      href: "/dashboard/usuarios",
      icon: Users,
    },
    {
      name: "Pedidos",
      href: "/dashboard/pedidos",
      icon: Package,
    },
    {
      name: "Conductores",
      href: "/dashboard/conductores",
      icon: UserCheck,
    },
    {
      name: "Camiones",
      href: "/dashboard/camiones",
      icon: Truck,
    },
    {
      name: "Rutas",
      href: "/dashboard/rutas",
      icon: Route,
    },
    {
      name: "Reportes",
      href: "/dashboard/reportes",
      icon: BarChart3,
    },
  ]

  // Función para manejar el clic en un ítem
  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item.name)
    }

    // Cerrar el sidebar móvil al navegar
    setIsMobileOpen(false)

    navigate(item.href)
  }

  // Función para manejar logout
  const handleLogout = () => {
    if (window.confirm("¿Está seguro de que desea cerrar sesión?")) {
      logout()
      navigate("/login")
      setIsMobileOpen(false)
    }
  }

  // Determinar si un item está activo basado en la ruta actual
  const isItemActive = (item) => {
    if (item.href === "/dashboard") {
      return location.pathname === "/dashboard"
    }
    return location.pathname.startsWith(item.href)
  }

  // Contenido del sidebar
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Header del sidebar */}
      <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <div className="text-white">
            <h1 className="text-lg font-semibold">TransLogiTrack</h1>
            <p className="text-xs text-gray-300">Sistema de Gestión</p>
          </div>
        </div>
        {/* El botón de cerrar ahora lo maneja el Sheet automáticamente */}
      </div>

      {/* Navegación */}
      <nav className="flex-1 mt-8 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <li key={item.name}>
                <Button
                  variant="ghost"
                  onClick={() => handleItemClick(item)}
                  className={`group flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full h-auto ${
                    isItemActive(item)
                      ? "bg-gray-900 text-white shadow-md hover:bg-gray-900"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <IconComponent
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                      isItemActive(item) ? "text-white" : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>

                  {/* Indicador de ítem activo */}
                  {isItemActive(item) && <span className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></span>}
                </Button>
              </li>
            )
          })}
        </ul>

        <Separator className="my-4 bg-gray-700" />

        {/* Botón de cerrar sesión */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="group flex items-center justify-start px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full h-auto text-gray-300 hover:bg-red-600 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white" />
          <span className="truncate">Cerrar sesión</span>
        </Button>
      </nav>

      {/* Footer del sidebar */}
      <div className="p-4 bg-gray-900">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-600 text-white text-sm">
              {user?.nombre?.charAt(0) || user?.correo?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-white text-sm min-w-0 flex-1">
            <p className="font-medium truncate">{user?.nombre || "Usuario"}</p>
            <p className="text-xs text-gray-400 truncate">{user?.correo || "usuario@translogitrack.com"}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar para desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 hidden lg:block ${className}`}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar para móvil usando Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden fixed top-4 left-4 z-50 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white shadow-md rounded-md"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menú principal</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-gray-800">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de navegación</SheetTitle>
            <SheetDescription>Navegación principal de TransLogiTrack</SheetDescription>
          </SheetHeader>
          <SidebarContent isMobile={true} />
        </SheetContent>
      </Sheet>
    </>
  )
}

export default Sidebar

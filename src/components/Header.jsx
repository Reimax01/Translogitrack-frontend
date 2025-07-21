"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, ChevronDown, User, Settings, LogOut } from "lucide-react"

function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState("")

  const userName = user?.nombre_completo || user?.nombre || "Usuario"
  const userRole = user?.rol || "Usuario"

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleProfileClick = () => {
    navigate("/mi-perfil")
  }

  const handleSettingsClick = () => {
    navigate("/configuracion")
  }

  const getTitleByRole = (role) => {
    switch (role) {
      case "Administrador":
        return "Dashboard Administrador"
      case "Operador":
        return "Panel de Operaciones"
      default:
        return "Portal de Cliente"
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-4">
          {/* Lado izquierdo - Solo título (sin botón de menú) */}
          <div className="flex items-center">
            {/* Espacio reservado para el botón de menú del Sidebar en móvil */}
            <div className="lg:hidden w-12"></div>

            {/* Título */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{getTitleByRole(userRole)}</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Bienvenido al panel de control</p>
            </div>
          </div>

          {/* Lado derecho - Búsqueda, notificaciones y perfil */}
          <div className="flex items-center justify-between sm:justify-end mt-3 sm:mt-0 space-x-4">
            {/* Búsqueda */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 w-48 lg:w-64"
              />
            </div>

            {/* Notificaciones */}
            {/*<div className="relative">
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Ver notificaciones</span>
                {isAuthenticated && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center">
                    3
                  </Badge>
                )}
              </Button>
            </div>*/}

            {/* Perfil de usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 h-auto p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">{userName}</div>
                    <div className="text-xs text-gray-500">{userRole}</div>
                  </div>
                  <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

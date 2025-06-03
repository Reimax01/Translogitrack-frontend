"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useUsuarios } from "../hooks/useUsuarios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Edit, Trash2, RefreshCw, Users, Shield, UserCheck, Eye, EyeOff } from "lucide-react"

function UsuariosAdmin() {
  // Hook para gestionar usuarios
  const {
    usuarios,
    loading,
    error,
    totalPaginas,
    paginaActual,
    total,
    listarUsuarios,
    crearUsuario,
    actualizarUsuario,
    desactivarUsuario,
    cambiarPagina,
    limpiarError,
    recargarDatos,
    validarEmail,
    validarContrasena,
  } = useUsuarios()

  // Estados locales del componente
  const [filtros, setFiltros] = useState({
    rol: "",
  })

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)

  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre_completo: "",
    correo_electronico: "",
    contrasena: "",
    rol: "",
    activo: true,
  })

  const [editData, setEditData] = useState({
    nombre_completo: "",
    correo_electronico: "",
    contrasena: "",
    rol: "",
    activo: true,
  })

  // Opciones de rol según el modelo
  const rolesOptions = [
    { value: "Administrador", label: "Administrador", color: "bg-red-100 text-red-800" },
    { value: "Operador", label: "Operador", color: "bg-blue-100 text-blue-800" },
    { value: "Cliente", label: "Cliente", color: "bg-green-100 text-green-800" },
  ]

  // Función para obtener badge del rol
  const getRolBadge = (rol) => {
    const rolConfig = rolesOptions.find((r) => r.value === rol) || rolesOptions[2]
    return <Badge className={`${rolConfig.color} hover:${rolConfig.color}`}>{rolConfig.label}</Badge>
  }

  // Función para obtener badge de activo/inactivo
  const getActivoBadge = (activo) => {
    if (activo) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
    }
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
  }

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A"
    try {
      return format(new Date(fecha), "dd/MM/yyyy", { locale: es })
    } catch (error) {
      return fecha
    }
  }

  // Manejador para aplicar filtros
  const handleAplicarFiltros = async () => {
    limpiarError()
    await listarUsuarios({ page: 1, ...filtros })
  }

  // Manejador para limpiar filtros
  const handleLimpiarFiltros = async () => {
    setFiltros({
      rol: "",
    })
    limpiarError()
    await listarUsuarios({ page: 1 })
  }

  // Manejador para cambio de filtros
  const handleFiltroChange = (name, value) => {
    setFiltros((prev) => ({
      ...prev,
      [name]: value === "all" ? "" : value,
    }))
  }

  // Manejador para crear usuario
  const handleCrearUsuario = async () => {
    try {
      const result = await crearUsuario(formData)
      if (result.success) {
        setShowCreateDialog(false)
        setFormData({
          nombre_completo: "",
          correo_electronico: "",
          contrasena: "",
          rol: "",
          activo: true,
        })
        setShowPassword(false)
      }
    } catch (err) {
      console.error("Error al crear usuario:", err)
    }
  }

  // Manejador para editar usuario
  const handleEditarUsuario = async () => {
    if (!selectedUsuario) return

    try {
      // Solo incluir contraseña si se proporcionó
      const data = {
        nombre_completo: editData.nombre_completo,
        correo_electronico: editData.correo_electronico,
        rol: editData.rol,
        activo: editData.activo,
      }

      if (editData.contrasena) {
        data.contrasena = editData.contrasena
      }

      const result = await actualizarUsuario(selectedUsuario.id_usuario, data)
      if (result.success) {
        setShowEditDialog(false)
        setSelectedUsuario(null)
        setEditData({
          nombre_completo: "",
          correo_electronico: "",
          contrasena: "",
          rol: "",
          activo: true,
        })
        setShowEditPassword(false)
      }
    } catch (err) {
      console.error("Error al editar usuario:", err)
    }
  }

  // Manejador para desactivar usuario
  const handleDesactivarUsuario = async (usuario) => {
    if (window.confirm(`¿Está seguro de que desea desactivar al usuario ${usuario.nombre_completo}?`)) {
      await desactivarUsuario(usuario.id_usuario)
    }
  }

  // Manejador para abrir dialog de edición
  const handleOpenEditDialog = (usuario) => {
    setSelectedUsuario(usuario)
    setEditData({
      nombre_completo: usuario.nombre_completo,
      correo_electronico: usuario.correo_electronico,
      contrasena: "",
      rol: usuario.rol,
      activo: usuario.activo,
    })
    setShowEditDialog(true)
    setShowEditPassword(false)
  }

  // Manejador para cambio de página
  const handlePageChange = async (nuevaPagina) => {
    await cambiarPagina(nuevaPagina, filtros)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-600">Administre los usuarios del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={recargarDatos} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recargar
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre_completo">
                    Nombre Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre_completo: e.target.value }))}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo_electronico">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="correo_electronico"
                    type="email"
                    value={formData.correo_electronico}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, correo_electronico: e.target.value.toLowerCase() }))
                    }
                    placeholder="Ej: juan@ejemplo.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contrasena">
                    Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="contrasena"
                      type={showPassword ? "text" : "password"}
                      value={formData.contrasena}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contrasena: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">La contraseña debe tener al menos 6 caracteres</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rol">
                    Rol <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.rol}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, rol: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesOptions.map((rol) => (
                        <SelectItem key={rol.value} value={rol.value}>
                          {rol.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="activo"
                    checked={formData.activo}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
                  />
                  <Label htmlFor="activo">Usuario Activo</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCrearUsuario} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Usuario
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
          <CardDescription>Filtre los usuarios por rol</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={filtros.rol} onValueChange={(value) => handleFiltroChange("rol", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {rolesOptions.map((rol) => (
                    <SelectItem key={rol.value} value={rol.value}>
                      {rol.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 md:col-span-2">
              <Button onClick={handleAplicarFiltros} disabled={loading}>
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={handleLimpiarFiltros} disabled={loading}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Administradores</p>
                <p className="text-2xl font-bold text-red-900">
                  {usuarios.filter((u) => u.rol === "Administrador").length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Operadores</p>
                <p className="text-2xl font-bold text-blue-900">
                  {usuarios.filter((u) => u.rol === "Operador").length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Clientes</p>
                <p className="text-2xl font-bold text-green-900">
                  {usuarios.filter((u) => u.rol === "Cliente").length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de paginación */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Mostrando {usuarios.length} de {total} usuarios
        </span>
        <span>
          Página {paginaActual} de {totalPaginas || 1}
        </span>
      </div>

      {/* Tabla de usuarios */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-10" role="status" aria-label="Cargando usuarios">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Cargando usuarios...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Nombre Completo</th>
                    <th className="p-4 font-medium">Correo Electrónico</th>
                    <th className="p-4 font-medium">Rol</th>
                    <th className="p-4 font-medium">Fecha Registro</th>
                    <th className="p-4 font-medium">Estado</th>
                    <th className="p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No hay usuarios disponibles
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((usuario, index) => (
                      <tr
                        key={usuario.id_usuario}
                        className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="p-4 font-medium">{usuario.id_usuario}</td>
                        <td className="p-4">{usuario.nombre_completo}</td>
                        <td className="p-4 text-sm text-gray-600">{usuario.correo_electronico}</td>
                        <td className="p-4">{getRolBadge(usuario.rol)}</td>
                        <td className="p-4">{formatearFecha(usuario.fecha_registro)}</td>
                        <td className="p-4">{getActivoBadge(usuario.activo)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditDialog(usuario)}
                              aria-label={`Editar usuario ${usuario.nombre_completo}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {usuario.activo && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDesactivarUsuario(usuario)}
                                aria-label={`Desactivar usuario ${usuario.nombre_completo}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {!loading && totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => handlePageChange(paginaActual - 1)} disabled={paginaActual <= 1}>
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {paginaActual} de {totalPaginas}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(paginaActual + 1)}
            disabled={paginaActual >= totalPaginas}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Mensaje si no hay usuarios */}
      {!loading && usuarios.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
            <p className="text-gray-600">No se encontraron usuarios que coincidan con los filtros aplicados.</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario #{selectedUsuario?.id_usuario}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_nombre_completo">
                Nombre Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_nombre_completo"
                value={editData.nombre_completo}
                onChange={(e) => setEditData((prev) => ({ ...prev, nombre_completo: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_correo_electronico">
                Correo Electrónico <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_correo_electronico"
                type="email"
                value={editData.correo_electronico}
                onChange={(e) => setEditData((prev) => ({ ...prev, correo_electronico: e.target.value.toLowerCase() }))}
                required
                disabled // No se puede cambiar según el controlador
              />
              <p className="text-xs text-gray-500">El correo electrónico no se puede modificar</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit_contrasena">Nueva Contraseña</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowEditPassword(!showEditPassword)}>
                  {showEditPassword ? "Ocultar" : "Cambiar contraseña"}
                </Button>
              </div>
              {showEditPassword && (
                <div className="relative">
                  <Input
                    id="edit_contrasena"
                    type="password"
                    value={editData.contrasena}
                    onChange={(e) => setEditData((prev) => ({ ...prev, contrasena: e.target.value }))}
                    placeholder="Dejar vacío para mantener actual"
                  />
                  <p className="text-xs text-gray-500 mt-1">Dejar vacío para mantener la contraseña actual</p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_rol">
                Rol <span className="text-red-500">*</span>
              </Label>
              <Select value={editData.rol} onValueChange={(value) => setEditData((prev) => ({ ...prev, rol: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rolesOptions.map((rol) => (
                    <SelectItem key={rol.value} value={rol.value}>
                      {rol.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_activo"
                checked={editData.activo}
                onCheckedChange={(checked) => setEditData((prev) => ({ ...prev, activo: checked }))}
              />
              <Label htmlFor="edit_activo">Usuario Activo</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditarUsuario} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsuariosAdmin

"use client"

import { useState } from "react"
import { useRutas } from "../hooks/useRutas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Plus, Edit, Trash2, RefreshCw, Map, Eye } from "lucide-react"

function RutasAdmin() {
  // Hook para gestionar rutas
  const {
    rutas,
    loading,
    error,
    totalPaginas,
    paginaActual,
    total,
    listarRutas,
    obtenerRuta,
    crearRuta,
    actualizarRuta,
    eliminarRuta,
    cambiarPagina,
    limpiarError,
    recargarDatos,
    formatearTiempo,
  } = useRutas()

  // Estados locales del componente
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [selectedRuta, setSelectedRuta] = useState(null)

  // Estados para formularios
  const [formData, setFormData] = useState({
    origen: "",
    destino: "",
    nombre_destino: "",
    distancia_km: "",
    tiempo_estimado_min: "",
    precio: "",
  })

  const [editData, setEditData] = useState({
    origen: "",
    destino: "",
    nombre_destino: "",
    distancia_km: "",
    tiempo_estimado_min: "",
    precio: "",
  })

  // Manejador para crear ruta
  const handleCrearRuta = async () => {
    try {
      const result = await crearRuta(formData)
      if (result.success) {
        setShowCreateDialog(false)
        setFormData({
          origen: "",
          destino: "",
          nombre_destino: "",
          distancia_km: "",
          tiempo_estimado_min: "",
          precio: "",
        })
      }
    } catch (err) {
      console.error("Error al crear ruta:", err)
    }
  }

  // Manejador para editar ruta
  const handleEditarRuta = async () => {
    if (!selectedRuta) return

    try {
      const result = await actualizarRuta(selectedRuta.id_ruta, editData)
      if (result.success) {
        setShowEditDialog(false)
        setSelectedRuta(null)
        setEditData({
          origen: "",
          destino: "",
          nombre_destino: "",
          distancia_km: "",
          tiempo_estimado_min: "",
          precio: "",
        })
      }
    } catch (err) {
      console.error("Error al editar ruta:", err)
    }
  }

  // Manejador para eliminar ruta
  const handleEliminarRuta = async (ruta) => {
    if (window.confirm(`¿Está seguro de que desea eliminar la ruta de ${ruta.origen} a ${ruta.destino}?`)) {
      await eliminarRuta(ruta.id_ruta)
    }
  }

  // Manejador para abrir dialog de edición
  const handleOpenEditDialog = (ruta) => {
    setSelectedRuta(ruta)
    setEditData({
      origen: ruta.origen,
      destino: ruta.destino,
      nombre_destino: ruta.nombre_destino || "",
      distancia_km: ruta.distancia_km,
      tiempo_estimado_min: ruta.tiempo_estimado_min || "",
      precio: ruta.precio || "",
    })
    setShowEditDialog(true)
  }

  // Manejador para abrir dialog de visualización
  const handleOpenViewDialog = async (ruta) => {
    setSelectedRuta(ruta)
    setShowViewDialog(true)
  }

  // Manejador para cambio de página
  const handlePageChange = async (nuevaPagina) => {
    await cambiarPagina(nuevaPagina)
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Rutas</h1>
          <p className="text-sm text-gray-600">Planifique y administre las rutas de transporte</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={recargarDatos} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Recargar
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Ruta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Ruta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="origen">
                    Origen <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="origen"
                    value={formData.origen}
                    onChange={(e) => setFormData((prev) => ({ ...prev, origen: e.target.value }))}
                    placeholder="Ej: Ciudad Central"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destino">
                    Destino <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="destino"
                    value={formData.destino}
                    onChange={(e) => setFormData((prev) => ({ ...prev, destino: e.target.value }))}
                    placeholder="Ej: Ciudad Norte"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre_destino">Nombre del Destino</Label>
                  <Input
                    id="nombre_destino"
                    value={formData.nombre_destino}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre_destino: e.target.value }))}
                    placeholder="Ej: Terminal Norte"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distancia_km">
                    Distancia (km) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="distancia_km"
                    type="number"
                    value={formData.distancia_km}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, distancia_km: Number.parseFloat(e.target.value) || "" }))
                    }
                    placeholder="Ej: 250"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiempo_estimado_min">Tiempo Estimado (minutos)</Label>
                  <Input
                    id="tiempo_estimado_min"
                    type="number"
                    value={formData.tiempo_estimado_min}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tiempo_estimado_min: Number.parseInt(e.target.value) || "" }))
                    }
                    placeholder="Ej: 180"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    id="precio"
                    type="number"
                    value={formData.precio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, precio: Number.parseFloat(e.target.value) || "" }))
                    }
                    placeholder="Ej: 150.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCrearRuta} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Ruta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Map className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Rutas</p>
                <p className="text-2xl font-bold text-blue-900">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Distancia Promedio</p>
                <p className="text-2xl font-bold text-green-900">
                  {rutas.length > 0
                    ? `${(rutas.reduce((sum, ruta) => sum + Number(ruta.distancia_km || 0), 0) / rutas.length).toFixed(
                        1,
                      )} km`
                    : "0 km"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-blue-900">
                  {rutas.length > 0 && rutas.some((r) => r.tiempo_estimado_min)
                    ? formatearTiempo(
                        Math.round(
                          rutas.reduce((sum, ruta) => sum + Number(ruta.tiempo_estimado_min || 0), 0) /
                            rutas.filter((r) => r.tiempo_estimado_min).length,
                        ),
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Precio Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rutas.length > 0 && rutas.some((r) => r.precio)
                    ? `$${(
                        rutas.reduce((sum, ruta) => sum + Number(ruta.precio || 0), 0) /
                          rutas.filter((r) => r.precio).length
                      ).toFixed(2)}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Información de paginación */}
      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
        <span>
          Mostrando {rutas.length} de {total} rutas
        </span>
        <span>
          Página {paginaActual} de {totalPaginas || 1}
        </span>
      </div>

      {/* Tabla de rutas */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10" role="status" aria-label="Cargando rutas">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Cargando rutas...</span>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origen - Destino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre Destino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distancia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiempo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rutas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No hay rutas disponibles
                  </td>
                </tr>
              ) : (
                rutas.map((ruta, index) => (
                  <tr key={ruta.id_ruta} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ruta.id_ruta}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ruta.origen} → {ruta.destino}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ruta.nombre_destino || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ruta.distancia_km} km</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ruta.tiempo_estimado_min ? formatearTiempo(ruta.tiempo_estimado_min) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ruta.precio ? `$${Number(ruta.precio).toFixed(2)}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenViewDialog(ruta)}
                          aria-label={`Ver ruta ${ruta.origen} a ${ruta.destino}`}
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditDialog(ruta)}
                          aria-label={`Editar ruta ${ruta.origen} a ${ruta.destino}`}
                        >
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminarRuta(ruta)}
                          aria-label={`Eliminar ruta ${ruta.origen} a ${ruta.destino}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {!loading && totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-6">
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

      {/* Dialog de edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Ruta #{selectedRuta?.id_ruta}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_origen">
                Origen <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_origen"
                value={editData.origen}
                onChange={(e) => setEditData((prev) => ({ ...prev, origen: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_destino">
                Destino <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_destino"
                value={editData.destino}
                onChange={(e) => setEditData((prev) => ({ ...prev, destino: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_nombre_destino">Nombre del Destino</Label>
              <Input
                id="edit_nombre_destino"
                value={editData.nombre_destino}
                onChange={(e) => setEditData((prev) => ({ ...prev, nombre_destino: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_distancia_km">
                Distancia (km) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_distancia_km"
                type="number"
                value={editData.distancia_km}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, distancia_km: Number.parseFloat(e.target.value) || "" }))
                }
                min="0.1"
                step="0.1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_tiempo_estimado_min">Tiempo Estimado (minutos)</Label>
              <Input
                id="edit_tiempo_estimado_min"
                type="number"
                value={editData.tiempo_estimado_min}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, tiempo_estimado_min: Number.parseInt(e.target.value) || "" }))
                }
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_precio">Precio</Label>
              <Input
                id="edit_precio"
                type="number"
                value={editData.precio}
                onChange={(e) => setEditData((prev) => ({ ...prev, precio: Number.parseFloat(e.target.value) || "" }))}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditarRuta} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de visualización */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Ruta</DialogTitle>
          </DialogHeader>
          {selectedRuta && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="text-base">{selectedRuta.id_ruta}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre Destino</p>
                  <p className="text-base">{selectedRuta.nombre_destino || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Ruta</p>
                <p className="text-base font-medium">
                  {selectedRuta.origen} → {selectedRuta.destino}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Distancia</p>
                  <p className="text-base">{selectedRuta.distancia_km} km</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tiempo Estimado</p>
                  <p className="text-base">
                    {selectedRuta.tiempo_estimado_min ? formatearTiempo(selectedRuta.tiempo_estimado_min) : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Precio</p>
                <p className="text-base">
                  {selectedRuta.precio ? `$${Number(selectedRuta.precio).toFixed(2)}` : "No establecido"}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Esta ruta puede ser asignada a pedidos para calcular costos y tiempos de entrega.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RutasAdmin

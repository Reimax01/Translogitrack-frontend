"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useReportes } from "../hooks/useReportes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  FileText,
  Package,
  Users,
  Truck,
  Map,
  Download,
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
} from "lucide-react"

function Reportes() {
  const { reporteData, loading, error, generarReporteGeneral, generarReportePedidos, exportarReporte, limpiarError } =
    useReportes()

  const [selectedReport, setSelectedReport] = useState("general")
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  })

  const reportTypes = [
    { id: "general", name: "Reporte General", icon: BarChart3, color: "text-blue-600" },
    { id: "pedidos", name: "Reporte de Pedidos", icon: Package, color: "text-green-600" },
    { id: "conductores", name: "Reporte de Conductores", icon: Users, color: "text-purple-600" },
    { id: "camiones", name: "Reporte de Flota", icon: Truck, color: "text-orange-600" },
    { id: "rutas", name: "Reporte de Rutas", icon: Map, color: "text-indigo-600" },
  ]

  // Cargar reporte general al montar el componente
  useEffect(() => {
    generarReporteGeneral()
  }, [generarReporteGeneral])

  // Función para generar reporte según el tipo seleccionado
  const handleGenerarReporte = () => {
    limpiarError()
    const fechaInicio = dateRange.start || null
    const fechaFin = dateRange.end || null

    switch (selectedReport) {
      case "general":
        generarReporteGeneral(fechaInicio, fechaFin)
        break
      case "pedidos":
        generarReportePedidos(fechaInicio, fechaFin)
        break
      default:
        // Para otros reportes que aún no están implementados
        break
    }
  }

  // Función para formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(valor || 0)
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

  const currentReportType = reportTypes.find((type) => type.id === selectedReport)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Reportes</h1>
          <p className="text-sm text-gray-600">Genere y visualice reportes detallados del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportarReporte("pdf", selectedReport)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => exportarReporte("excel", selectedReport)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de tipos de reporte */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipos de Reporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <Button
                    key={type.id}
                    variant={selectedReport === type.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedReport(type.id)}
                  >
                    <IconComponent className={`h-4 w-4 mr-2 ${type.color}`} />
                    {type.name}
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          {/* Filtros de fecha */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_fin">Fecha Fin</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                />
              </div>
              <Button onClick={handleGenerarReporte} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generar Reporte
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal del reporte */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  {currentReportType && <currentReportType.icon className={`h-5 w-5 ${currentReportType.color}`} />}
                  {currentReportType?.name}
                </CardTitle>
                {reporteData[selectedReport]?.fechaGeneracion && (
                  <CardDescription>
                    Generado: {formatearFecha(reporteData[selectedReport].fechaGeneracion)}
                  </CardDescription>
                )}
              </div>
              {reporteData[selectedReport]?.rangoFechas && (
                <CardDescription>
                  {reporteData[selectedReport].rangoFechas.inicio && reporteData[selectedReport].rangoFechas.fin
                    ? `Período: ${formatearFecha(reporteData[selectedReport].rangoFechas.inicio)} al ${formatearFecha(reporteData[selectedReport].rangoFechas.fin)}`
                    : "Todos los registros"}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Generando reporte...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error al generar reporte</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={handleGenerarReporte}>Reintentar</Button>
                </div>
              ) : (
                <>
                  {/* Reporte General */}
                  {selectedReport === "general" && reporteData.general && (
                    <div className="space-y-6">
                      {/* Estadísticas principales */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-blue-600">Total Pedidos</p>
                                <p className="text-2xl font-bold text-blue-900">{reporteData.general.pedidos.total}</p>
                              </div>
                              <Package className="h-8 w-8 text-blue-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-600">Pedidos Entregados</p>
                                <p className="text-2xl font-bold text-green-900">
                                  {reporteData.general.pedidos.entregados}
                                </p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-purple-600">Ingresos Totales</p>
                                <p className="text-2xl font-bold text-purple-900">
                                  {formatearMoneda(reporteData.general.pedidos.ingresosTotales)}
                                </p>
                              </div>
                              <DollarSign className="h-8 w-8 text-purple-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-orange-600">Conductores Activos</p>
                                <p className="text-2xl font-bold text-orange-900">
                                  {reporteData.general.conductores.activos}
                                </p>
                              </div>
                              <Users className="h-8 w-8 text-orange-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-indigo-600">Camiones Disponibles</p>
                                <p className="text-2xl font-bold text-indigo-900">
                                  {reporteData.general.camiones.disponibles}
                                </p>
                              </div>
                              <Truck className="h-8 w-8 text-indigo-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-pink-600">Rutas Activas</p>
                                <p className="text-2xl font-bold text-pink-900">{reporteData.general.rutas.total}</p>
                              </div>
                              <Map className="h-8 w-8 text-pink-600" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Separator />

                      {/* Gráfico de tendencias */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Tendencia de Pedidos (Últimos 7 días)
                        </h3>
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-end justify-between h-32 space-x-2">
                              {reporteData.general.tendenciaPedidos.map((dia, index) => (
                                <div key={index} className="flex flex-col items-center flex-1">
                                  <div
                                    className="bg-blue-500 rounded-t w-full min-w-[30px]"
                                    style={{
                                      height: `${Math.max((dia.pedidos / Math.max(...reporteData.general.tendenciaPedidos.map((d) => d.pedidos))) * 100, 5)}%`,
                                    }}
                                  ></div>
                                  <span className="text-xs text-gray-600 mt-2">{dia.dia}</span>
                                  <span className="text-xs font-medium text-gray-800">{dia.pedidos}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Detalles adicionales */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Estado de Pedidos</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Pendientes:</span>
                                <span className="font-medium">{reporteData.general.pedidos.pendientes}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>En Tránsito:</span>
                                <span className="font-medium">{reporteData.general.pedidos.enTransito}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Entregados:</span>
                                <span className="font-medium">{reporteData.general.pedidos.entregados}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cancelados:</span>
                                <span className="font-medium">{reporteData.general.pedidos.cancelados}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Estado de Flota</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Disponibles:</span>
                                <span className="font-medium">{reporteData.general.camiones.disponibles}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Asignados:</span>
                                <span className="font-medium">{reporteData.general.camiones.asignados}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>En Mantenimiento:</span>
                                <span className="font-medium">{reporteData.general.camiones.enMantenimiento}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Inactivos:</span>
                                <span className="font-medium">{reporteData.general.camiones.inactivos}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Reporte de Pedidos */}
                  {selectedReport === "pedidos" && reporteData.pedidos && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-blue-600">Total Pedidos</p>
                                <p className="text-2xl font-bold text-blue-900">{reporteData.pedidos.total}</p>
                              </div>
                              <Package className="h-8 w-8 text-blue-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-600">Entregados</p>
                                <p className="text-2xl font-bold text-green-900">
                                  {reporteData.pedidos.porEstado.Entregado.length}
                                </p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-yellow-600">En Tránsito</p>
                                <p className="text-2xl font-bold text-yellow-900">
                                  {reporteData.pedidos.porEstado["En tránsito"].length}
                                </p>
                              </div>
                              <Truck className="h-8 w-8 text-yellow-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-purple-600">Ingresos</p>
                                <p className="text-2xl font-bold text-purple-900">
                                  {formatearMoneda(reporteData.pedidos.ingresoTotal)}
                                </p>
                              </div>
                              <DollarSign className="h-8 w-8 text-purple-600" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Rutas más utilizadas */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Rutas Más Utilizadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Object.entries(reporteData.pedidos.rutasUtilizadas)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 5)
                              .map(([ruta, cantidad]) => (
                                <div key={ruta} className="flex justify-between items-center">
                                  <span className="text-sm">{ruta}</span>
                                  <span className="font-medium">{cantidad} pedidos</span>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Otros reportes en desarrollo */}
                  {!["general", "pedidos"].includes(selectedReport) && (
                    <div className="text-center py-12">
                      {currentReportType && <currentReportType.icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />}
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{currentReportType?.name}</h3>
                      <p className="text-gray-600 mb-4">
                        Este reporte está en desarrollo. Pronto estará disponible con datos detallados.
                      </p>
                      <Button onClick={handleGenerarReporte} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generar Reporte
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Reportes

"use client"

import { useAlertas } from "../../hooks/useAlertas"

function AlertasCard({ alertas = [], loading = false, titulo = "Alertas del Sistema" }) {
  const { marcarComoLeida } = useAlertas()

  // Si no hay alertas y no está cargando, mostrar mensaje predeterminado
  if (!loading && alertas.length === 0) {
    alertas = [
      {
        id: "default",
        tipo: "info",
        mensaje: "No hay alertas pendientes en este momento.",
        fecha: new Date().toISOString(),
      },
    ]
  }

  // Función para obtener el color según el tipo de alerta
  const getTipoAlertaColor = (tipo) => {
    switch (tipo.toLowerCase()) {
      case "error":
      case "peligro":
        return "bg-red-50 text-red-800 border-red-200"
      case "advertencia":
      case "warning":
        return "bg-yellow-50 text-yellow-800 border-yellow-200"
      case "info":
      case "información":
        return "bg-blue-50 text-blue-800 border-blue-200"
      case "éxito":
      case "success":
        return "bg-green-50 text-green-800 border-green-200"
      default:
        return "bg-gray-50 text-gray-800 border-gray-200"
    }
  }

  // Función para obtener el icono según el tipo de alerta
  const getTipoAlertaIcon = (tipo) => {
    switch (tipo.toLowerCase()) {
      case "error":
      case "peligro":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )
      case "advertencia":
      case "warning":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )
      case "info":
      case "información":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        )
      case "éxito":
      case "success":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )
      default:
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        )
    }
  }

  // Función para formatear la fecha
  const formatearFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr)
      return fecha.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return fechaStr
    }
  }

  const handleDismiss = async (alertaId) => {
    if (alertaId !== "default") {
      await marcarComoLeida(alertaId)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <svg className="h-5 w-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {titulo}
        </h3>
        <p className="mt-1 text-sm text-gray-500">Notificaciones importantes que requieren atención</p>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-gray-500">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Cargando alertas...
          </div>
        </div>
      )}

      {/* Lista de alertas */}
      {!loading && (
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {alertas.map((alerta) => (
            <div key={alerta.id} className={`p-4 ${getTipoAlertaColor(alerta.tipo)}`}>
              <div className="flex">
                <div className="flex-shrink-0">{getTipoAlertaIcon(alerta.tipo)}</div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{alerta.mensaje}</p>
                  {alerta.accion && (
                    <p className="mt-1 text-xs font-medium opacity-90">💡 Acción recomendada: {alerta.accion}</p>
                  )}
                  {alerta.prioridad && (
                    <span
                      className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        alerta.prioridad === "alta"
                          ? "bg-red-100 text-red-700"
                          : alerta.prioridad === "media"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Prioridad: {alerta.prioridad}
                    </span>
                  )}
                  <p className="mt-1 text-xs opacity-75">{formatearFecha(alerta.fecha)}</p>
                  {alerta.detalles && alerta.detalles.length > 0 && (
                    <div className="mt-2">
                      <details className="text-xs">
                        <summary className="cursor-pointer font-medium">Ver detalles</summary>
                        <ul className="mt-1 ml-4 list-disc">
                          {alerta.detalles.map((detalle, index) => (
                            <li key={index}>{detalle}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  )}
                </div>
                {alerta.id !== "default" && (
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        type="button"
                        onClick={() => handleDismiss(alerta.id)}
                        className="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      >
                        <span className="sr-only">Descartar</span>
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AlertasCard


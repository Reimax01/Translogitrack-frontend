export interface Conductor {
  id_conductor: number
  nombre_completo: string
  numero_licencia: string
  fecha_vencimiento_licencia: string
  activo: boolean
  historial?: EventoHistorial[]
}

export interface EventoHistorial {
  id_historial: number
  tipo_evento: "sanción" | "premio" | "incidente"
  descripcion: string
  fecha_evento: string
}

export interface ConductorFormData {
  nombre_completo: string
  numero_licencia: string
  fecha_vencimiento_licencia: string
  activo: boolean
}

export interface FiltrosConductores {
  page?: number
  activo?: boolean
  tipo_licencia?: string
}

export interface ConductoresResponse {
  total: number
  pagina: number
  porPagina: number
  conductores: Conductor[]
}

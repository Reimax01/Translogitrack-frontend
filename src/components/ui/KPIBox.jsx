function KPIBox({ titulo, valor, icono, colorFondo = "bg-white", colorTexto = "text-gray-900", loading = false }) {
  // Mapeo de colores de fondo a colores de texto y bordes
  const colorMap = {
    "bg-white": "text-gray-900",
    "bg-blue-50": "text-blue-700 border-blue-200",
    "bg-green-50": "text-green-700 border-green-200",
    "bg-yellow-50": "text-yellow-700 border-yellow-200",
    "bg-red-50": "text-red-700 border-red-200",
    "bg-purple-50": "text-purple-700 border-purple-200",
    "bg-indigo-50": "text-indigo-700 border-indigo-200",
  }

  // Determinar el color del texto basado en el color de fondo
  const textColor = colorMap[colorFondo] || colorTexto

  return (
    <div
      className={`${colorFondo} overflow-hidden shadow rounded-lg border ${textColor.includes("border") ? textColor.split(" ")[1] : "border-gray-200"}`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${textColor.split(" ")[0]}`}>{titulo}</p>
            <p className="text-2xl font-bold mt-1">{loading ? "..." : valor}</p>
          </div>
          {icono && <div className={`text-2xl ${textColor.split(" ")[0]}`}>{icono}</div>}
        </div>
      </div>
    </div>
  )
}

export default KPIBox

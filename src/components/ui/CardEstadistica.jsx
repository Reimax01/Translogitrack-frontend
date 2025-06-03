function CardEstadistica({ titulo, valor, icono, loading = false }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">{icono}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{titulo}</dt>
              <dd className="text-lg font-medium text-gray-900">{loading ? "..." : valor}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardEstadistica

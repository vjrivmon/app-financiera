/**
 * Componente de carga para widgets del dashboard
 * Skeletons animados que mantienen la estructura del layout
 */

interface LoadingWidgetProps {
  title?: string;
  rows?: number;
  showChart?: boolean;
}

export default function LoadingWidget({ 
  title = "Cargando...", 
  rows = 3,
  showChart = false 
}: LoadingWidgetProps) {
  return (
    <div className="card animate-pulse">
      {/* Header del widget */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>

      {/* Contenido principal */}
      {showChart ? (
        /* Skeleton para gráficos */
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded-lg" />
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </div>
      ) : (
        /* Skeleton para listas */
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Footer del widget */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-40" />
      </div>
    </div>
  );
} 
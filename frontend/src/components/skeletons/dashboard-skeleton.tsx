/**
 * Dashboard Loading Skeleton
 * Provides visual feedback while dashboard loads
 */

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Header Skeleton */}
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg h-32" />

      {/* User Info Card Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-5 bg-gray-300 rounded w-32" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-5 bg-gray-300 rounded w-32" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-5 bg-gray-300 rounded w-28" />
          </div>
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div>
        <div className="h-7 bg-gray-200 rounded w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-300 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Generic Card Skeleton
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  )
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-gray-300 rounded" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * List Skeleton
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

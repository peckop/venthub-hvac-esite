import React from 'react'

export const ProductsSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-gray-200 rounded mb-6" />

      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1 h-12 bg-gray-200 rounded-xl" />
        <div className="w-24 h-12 bg-gray-200 rounded-xl" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block w-64 space-y-8">
          <div className="space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 w-full bg-gray-100 rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 w-full bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-2xl" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsSkeleton

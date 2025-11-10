import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function BlogSkeleton() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Hero Skeleton */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center animate-pulse">
            <div className="h-10 bg-gray-200 rounded max-w-md mx-auto mb-6"></div>
            <div className="h-6 bg-gray-200 rounded max-w-2xl mx-auto mb-3"></div>
            <div className="h-6 bg-gray-200 rounded max-w-xl mx-auto mb-8"></div>
            <div className="flex justify-center gap-4">
              <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-32 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filter Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-pulse">
          <div className="flex-1 h-10 bg-white rounded"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-white rounded"></div>
            ))}
          </div>
        </div>

        {/* Featured Posts Skeleton */}
        <div className="mb-12">
          <div className="h-8 w-48 bg-white rounded mb-6 animate-pulse"></div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="bg-gray-200 h-2"></div>
                <CardHeader>
                  <div className="flex gap-2 mb-2">
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="flex gap-4 mb-4">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Regular Posts Skeleton */}
        <div>
          <div className="h-8 w-48 bg-white rounded mb-6 animate-pulse"></div>
          <div className="grid gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-2 mb-3">
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

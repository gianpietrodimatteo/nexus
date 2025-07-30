export default function UsersLoading() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-12 w-36 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>

      {/* Main Content Skeleton */}
      <div className="mx-4 lg:mx-6 bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Filter Tabs Skeleton */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex gap-2">
            <div className="h-12 w-32 bg-gray-200 rounded-[24px] animate-pulse"></div>
            <div className="h-12 w-28 bg-gray-200 rounded-[24px] animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="px-6 py-6">
          {/* Table Header */}
          <div className="border-b border-[#E9E7E4] pb-4 mb-4">
            <div className="grid grid-cols-7 gap-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Table Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-[#E9E7E4] py-4">
              <div className="grid grid-cols-7 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
// Example components demonstrating proper loading state usage
// These are for documentation purposes and reference

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { TablePageSkeleton, DashboardSkeleton, CardSkeleton } from "@/components/ui/skeleton"

// ✅ GOOD: Use Progress for determinate loading (file uploads, data processing)
export function FileUploadExample() {
  const [uploadProgress, setUploadProgress] = useState(0)
  
  useEffect(() => {
    // Simulate file upload progress
    const timer = setInterval(() => {
      setUploadProgress(prev => prev < 100 ? prev + 10 : 100)
    }, 500)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-4">
      <h3>File Upload Progress</h3>
      <Progress value={uploadProgress} className="w-full" />
      <p>{uploadProgress}% complete</p>
    </div>
  )
}

// ✅ GOOD: Use skeleton loading for indeterminate loading (page content)
export function TableLoadingExample() {
  return (
    <div className="space-y-4">
      <h3>Table Loading State</h3>
      <TablePageSkeleton 
        hasFilters={true}
        columns={5}
        rows={3}
        hasAvatar={true}
      />
    </div>
  )
}

// ✅ GOOD: Use dashboard skeleton for dashboard content
export function DashboardLoadingExample() {
  return (
    <div className="space-y-4">
      <h3>Dashboard Loading State</h3>
      <DashboardSkeleton />
    </div>
  )
}

// ❌ BAD: Don't use Progress for indeterminate loading
export function BadProgressExample() {
  return (
    <div className="space-y-4">
      <h3>❌ Bad: Progress for unknown duration</h3>
      <Progress value={50} className="w-full" />
      <p>Loading users... (we don't know how long this takes)</p>
    </div>
  )
}

// ❌ BAD: Don't create custom skeletons when reusable ones exist
export function BadSkeletonExample() {
  return (
    <div className="space-y-4">
      <h3>❌ Bad: Custom skeleton instead of reusable</h3>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
      </div>
    </div>
  )
}

// ✅ GOOD: Use CardSkeleton instead
export function GoodSkeletonExample() {
  return (
    <div className="space-y-4">
      <h3>✅ Good: Reusable skeleton component</h3>
      <CardSkeleton />
    </div>
  )
}
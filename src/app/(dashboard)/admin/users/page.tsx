'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import type { AuthSession } from '@/server/auth/types'

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roleFilter, setRoleFilter] = useState<'ADMIN' | 'SE' | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState('')

  // Type guard for our custom session
  const authSession = session as AuthSession | null

  // Fetch users with tRPC - MUST be called before any early returns
  const { data: users, isLoading, error, refetch } = trpc.admin.users.list.useQuery({
    role: roleFilter,
    search: searchTerm || undefined,
  }, {
    enabled: authSession?.user?.role === 'ADMIN', // Only run query if user is admin
  })

  // Handle redirects in useEffect to avoid render-time navigation
  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!authSession) {
      router.push('/login')
      return
    }

    if (authSession.user.role !== 'ADMIN') {
      router.push('/client')
      return
    }
  }, [authSession, status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // Show loading while redirecting
  if (!authSession || authSession.user.role !== 'ADMIN') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // Type guard for users data
  const usersList: any[] = users || []

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    refetch()
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading users...</div>
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">Error loading users: {(error as any)?.message || 'Unknown error'}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h1 className="text-2xl font-normal text-[#141417]">Manage Users</h1>
        <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl text-base">
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
            <path d="M6.5 1.5V7.5M6.5 7.5V13.5M6.5 7.5H0.5M6.5 7.5H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add New User
        </button>
      </div>

      {/* Main Content */}
      <div className="mx-4 lg:mx-6 bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Filter Tabs */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex gap-2">
            <button 
              onClick={() => setRoleFilter('ADMIN')}
              className={`px-4 py-3 rounded-[24px] text-base font-normal ${
                roleFilter === 'ADMIN' 
                  ? 'bg-black text-white' 
                  : 'bg-transparent border border-[#DBDBDB] text-[#1F2937]'
              }`}
            >
              Admin Users
            </button>
            <button 
              onClick={() => setRoleFilter('SE')}
              className={`px-4 py-3 rounded-[24px] text-base font-normal ${
                roleFilter === 'SE' 
                  ? 'bg-black text-white' 
                  : 'bg-transparent border border-[#DBDBDB] text-[#1F2937]'
              }`}
            >
              SE Users
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-[#1F2937]">Loading users...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center py-8">
              <div className="text-red-600">Error loading users: {(error as any)?.message || 'Unknown error'}</div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E9E7E4]">
                    <th className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[186px]">Name</th>
                    <th className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[197px]">Email</th>
                    <th className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[173px]">Phone</th>
                    <th className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[121px]">Cost Rate</th>
                    <th className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[109px]">Bill Rate</th>
                    <th className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[187px]">Assigned Clients</th>
                    <th className="text-left py-4 px-4 text-base font-bold text-[#3B3B3B] w-[116px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user: any) => (
                    <tr key={user.id} className="border-b border-[#E9E7E4]">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <span className="text-base text-[#1F2937] font-normal">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-base text-[#1F2937]">{user.email}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-base text-[#1F2937]">{user.phone || '-'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-base text-[#1F2937]">
                          {user.hourlyRateCost ? `$${user.hourlyRateCost}/hr` : '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-base text-[#1F2937]">
                          {user.hourlyRateBillable ? `$${user.hourlyRateBillable}/hr` : '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 flex-wrap">
                          {user.assignedOrganizations?.length > 0 ? (
                            user.assignedOrganizations.map((org: any) => (
                              <span 
                                key={org.id}
                                className="bg-[#E9E7E4] text-[#1F2937] px-2 py-1.5 rounded-full text-sm"
                              >
                                {org.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#1F2937] text-base">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M11.334 2C11.5091 1.82489 11.7169 1.68636 11.9457 1.59279C12.1745 1.49921 12.4197 1.45208 12.6673 1.45208C12.9149 1.45208 13.1601 1.49921 13.3889 1.59279C13.6177 1.68636 13.8255 1.82489 14.0007 2C14.1758 2.17511 14.3143 2.38289 14.4079 2.61168C14.5015 2.84048 14.5486 3.08568 14.5486 3.33333C14.5486 3.58099 14.5015 3.82619 14.4079 4.05499C14.3143 4.28378 14.1758 4.49156 14.0007 4.66667L5.00065 13.6667L1.33398 14.6667L2.33398 11L11.334 2Z" stroke="#141417" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                            <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                              <path d="M1.75 4H2.91667H12.25M4.08333 4V2.66667C4.08333 2.31304 4.22381 1.97391 4.47386 1.72386C4.72391 1.47381 5.06304 1.33333 5.41667 1.33333H8.58333C8.93696 1.33333 9.27609 1.47381 9.52614 1.72386C9.77619 1.97391 9.91667 2.31304 9.91667 2.66667V4M11.0833 4V13.3333C11.0833 13.687 10.9429 14.0261 10.6928 14.2761C10.4428 14.5262 10.1036 14.6667 9.75 14.6667H4.25C3.89637 14.6667 3.55724 14.5262 3.30719 14.2761C3.05714 14.0261 2.91667 13.687 2.91667 13.3333V4H11.0833Z" stroke="#CE4343" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {usersList.length === 0 && (
                <div className="text-center py-8 text-[#1F2937]">
                  No users found for the selected filter.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
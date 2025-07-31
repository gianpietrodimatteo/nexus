'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AdminHeaderContent {
  title: string
  navigation?: ReactNode
  actions?: ReactNode
}

interface AdminHeaderContextType {
  headerContent: AdminHeaderContent | null
  setHeaderContent: (content: AdminHeaderContent | null) => void
}

const AdminHeaderContext = createContext<AdminHeaderContextType | undefined>(undefined)

export function AdminHeaderProvider({ children }: { children: ReactNode }) {
  const [headerContent, setHeaderContent] = useState<AdminHeaderContent | null>(null)

  return (
    <AdminHeaderContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </AdminHeaderContext.Provider>
  )
}

export function useAdminHeader() {
  const context = useContext(AdminHeaderContext)
  if (context === undefined) {
    throw new Error('useAdminHeader must be used within an AdminHeaderProvider')
  }
  return context
}
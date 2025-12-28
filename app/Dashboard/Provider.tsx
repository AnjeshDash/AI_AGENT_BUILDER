import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import Appsidebar from './_components/AppSidebar'

function DashboardProvider({children}:any) {
  return (
    <SidebarProvider>
      <Appsidebar/>
      <SidebarTrigger/>
    <div>
      {children}
    </div>
    </SidebarProvider>
  )
}

export default DashboardProvider

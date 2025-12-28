import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'
import Appsidebar from './_components/AppSidebar'
import AppHeader from './_components/AppHeader'

function DashboardProvider({children}:any) {
  return (
    <SidebarProvider>
      <Appsidebar/>
    <div className='w-full'>
      <AppHeader/>
      {children}
    </div>
    </SidebarProvider>
  )
}

export default DashboardProvider

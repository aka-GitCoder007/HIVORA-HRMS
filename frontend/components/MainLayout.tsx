'use client'

import { useState } from 'react'
import { Menu, X, User, Clock, Calendar, DollarSign, Users } from 'lucide-react'
import { TopHeader } from '@/components/TopHeader'
import { HivoraWordmark } from '@/components/ui/HivoraWordmark'

interface User {
  id: string
  name: string
  email: string
  role: 'employee' | 'admin'
  avatar: string
}

interface MainLayoutProps {
  children: React.ReactNode
  currentUser: User
  activeSection: string
  onSectionChange: (section: string) => void
}

export function MainLayout({ children, currentUser, activeSection, onSectionChange }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isAdmin = currentUser.role === 'admin'

  type NavItem = { label: string; icon: React.ElementType; adminOnly?: boolean }
  const navItems: NavItem[] = [
    { label: 'Profile', icon: User },
    { label: 'Attendance', icon: Clock },
    { label: 'Leave', icon: Calendar },
    { label: 'Payroll', icon: DollarSign },
    { label: 'Employee Directory', icon: Users, adminOnly: true },
  ]

  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin)

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-gray-50 overflow-hidden">
      {/* Top Header */}
      <TopHeader />

      {/* Main Content Area */}
      <div className="flex flex-1 min-w-0 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed z-40 inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-700 shadow-lg transition-transform duration-300 lg:static lg:translate-x-0 lg:shadow-none lg:mt-0 ${
            sidebarOpen ? 'translate-x-0 top-16' : '-translate-x-full top-16'
          }`}
        >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/apple-touch-icon.png" alt="HIVORA Logo" className="w-9 h-9 rounded-lg object-cover" />
            <div>
              <HivoraWordmark size="text-base" />
              <p className="text-xs text-gray-400">HIVORA HRMS</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {visibleItems.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => {
                    onSectionChange(label)
                    setSidebarOpen(false)
                  }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    activeSection === label
                      ? 'bg-blue-900/40 text-cyan-400 font-medium'
                      : 'text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${activeSection === label ? 'text-cyan-400' : 'text-slate-500'}`} />
                  {label}
                </button>
              ))}
            </div>
          </nav>

        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Menu Toggle - Below TopHeader */}
        <div className="lg:hidden bg-slate-900 border-b border-slate-700 p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-gray-300"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-slate-950">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>

        {/* Overlay for sidebar on mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden top-16" onClick={() => setSidebarOpen(false)} />
        )}
      </div>
    </div>
  )
}

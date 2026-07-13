'use client'

import { useAuth } from '@/lib/authContext'
import { LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { HivoraWordmark } from '@/components/ui/HivoraWordmark'

export function TopHeader() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left side - Logo/Title */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/apple-touch-icon.png" alt="HIVORA Logo" className="h-8 w-8 rounded-lg object-cover" />
          <HivoraWordmark size="text-lg" />
        </div>

        {/* Right side - User Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Info & Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {/* Avatar */}
              <div className="h-8 w-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user?.avatar
                )}
              </div>

              {/* User Name - Hidden on mobile */}
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400">
                  {user?.role === 'admin' ? 'Administrator' : 'Employee'}
                </p>
              </div>

              {/* Mobile menu icon */}
              <Menu size={18} className="sm:hidden text-gray-300" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 py-2 z-50">
                {/* User Info on Mobile */}
                <div className="sm:hidden px-4 py-2 border-b border-slate-700">
                  <p className="font-medium text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.email}
                  </p>
                  <p className="text-xs text-cyan-400 mt-1">
                    {user?.role === 'admin' ? 'Administrator' : 'Employee'}
                  </p>
                </div>

                {/* Desktop User Info */}
                <div className="hidden sm:block px-4 py-2 border-b border-slate-700">
                  <p className="text-sm text-gray-300">
                    {user?.email}
                  </p>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close menu when clicking outside */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  )
}

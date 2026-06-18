'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, Users, Tag, PlusCircle,
  Building2, LogOut
} from 'lucide-react'
import clsx from 'clsx'

const nav = [
  { label: 'Dashboard',    href: '/admin',             icon: LayoutDashboard },
  { label: 'Forms',        href: '/admin/forms',        icon: FileText,  section: 'Forms' },
  { label: 'New form',     href: '/admin/forms/new',    icon: PlusCircle },
  { label: 'All suppliers', href: '/admin/suppliers',   icon: Users, section: 'Suppliers' },
  { label: 'By category',  href: '/admin/categories',   icon: Tag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Building2 size={15} className="text-white" />
            </div>
            SupplyPortal
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-9">Agency Admin</p>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {nav.map((item, i) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            const showSection = item.section && (i === 0 || nav[i - 1].section !== item.section)
            return (
              <div key={item.href}>
                {item.section && (i === 1 || nav[i-1].section !== item.section) && (
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium px-2 pt-4 pb-1">
                    {item.section}
                  </p>
                )}
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors',
                    active
                      ? 'bg-brand-50 text-brand-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              </div>
            )
          })}
        </nav>

        <div className="px-3 py-3 border-t border-gray-100">
          <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 w-full">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}

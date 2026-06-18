import { getDashboardStats, getSubmissions, getForms } from '@/lib/supabase'
import Link from 'next/link'
import { FileText, Users, Clock, CheckCircle, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const revalidate = 0

export default async function AdminDashboard() {
  const [stats, recentSubs, forms] = await Promise.all([
    getDashboardStats(),
    getSubmissions(),
    getForms(),
  ])

  const recent = recentSubs.slice(0, 6)

  return (
    <>
      <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <h1 className="font-semibold text-gray-900">Dashboard</h1>
        <Link href="/admin/forms/new" className="btn btn-primary text-xs py-1.5 px-3">
          + New form
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total submissions', value: stats.totalSubmissions, icon: Users, color: 'text-blue-600' },
            { label: 'Pending review',    value: stats.pending,          icon: Clock, color: 'text-amber-600' },
            { label: 'Approved',          value: stats.approved,         icon: CheckCircle, color: 'text-brand-600' },
            { label: 'Active forms',      value: stats.activeForms,      icon: FileText, color: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="card px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={15} className={s.color} />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <div className="text-2xl font-semibold">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-5">
          {/* Recent submissions */}
          <div className="card col-span-3">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-medium text-sm">Recent submissions</h2>
              <Link href="/admin/suppliers" className="text-xs text-brand-600 hover:underline">View all</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-2.5 text-xs text-gray-500 font-medium">Company</th>
                  <th className="text-left px-3 py-2.5 text-xs text-gray-500 font-medium">Form</th>
                  <th className="text-left px-3 py-2.5 text-xs text-gray-500 font-medium">Status</th>
                  <th className="text-left px-3 py-2.5 text-xs text-gray-500 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(sub => (
                  <tr key={sub.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-sm">
                      {(sub.data['Company name'] || sub.data['company_name'] || 'Unknown')}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">{sub.forms?.name}</td>
                    <td className="px-3 py-3">
                      <span className={`badge badge-${sub.status}`}>{sub.status}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Active forms */}
          <div className="card col-span-2">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-medium text-sm">Active forms</h2>
              <Link href="/admin/forms" className="text-xs text-brand-600 hover:underline">Manage</Link>
            </div>
            <div className="p-4 space-y-2">
              {forms.filter(f => f.is_active).map(form => (
                <div key={form.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{form.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{form.category}</p>
                  </div>
                  <a
                    href={`/f/${form.slug}`}
                    target="_blank"
                    className="flex-shrink-0 text-gray-400 hover:text-brand-600"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        {Object.keys(stats.categoryCounts).length > 0 && (
          <div className="card mt-5 p-5">
            <h2 className="font-medium text-sm mb-4">Submissions by category</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.categoryCounts).map(([cat, count]) => (
                <Link
                  key={cat}
                  href={`/admin/suppliers?category=${encodeURIComponent(cat)}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                >
                  <span className="text-sm font-medium">{cat}</span>
                  <span className="text-xs bg-white rounded-full px-2 py-0.5 text-gray-500 border border-gray-200">{count}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}

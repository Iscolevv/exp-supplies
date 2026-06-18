import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SupplyPortal',
  description: 'Supplier registration and management portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}

'use client'

import { useState } from 'react'
import { Copy, Check, Pause, Play } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function FormActions({
  formId,
  formUrl,
  isActive,
}: {
  formId: string
  formUrl: string
  isActive: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function copyLink() {
    const full = `${window.location.origin}${formUrl}`
    await navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function toggleActive() {
    setLoading(true)
    await supabase.from('forms').update({ is_active: !isActive }).eq('id', formId)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={copyLink}
        className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-brand-600 transition-colors"
        title="Copy link"
      >
        {copied ? <Check size={13} className="text-brand-600" /> : <Copy size={13} />}
      </button>
      <button
        onClick={toggleActive}
        disabled={loading}
        className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-amber-600 transition-colors"
        title={isActive ? 'Pause form' : 'Resume form'}
      >
        {isActive ? <Pause size={13} /> : <Play size={13} />}
      </button>
    </div>
  )
}

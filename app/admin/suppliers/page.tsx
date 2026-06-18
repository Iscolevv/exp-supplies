import { getSubmissions, getForms } from '@/lib/supabase'
import SuppliersClient from './SuppliersClient'

export const revalidate = 0

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: { category?: string; status?: string; form?: string }
}) {
  const [submissions, forms] = await Promise.all([
    getSubmissions(),
    getForms(),
  ])

  return (
    <SuppliersClient
      submissions={submissions}
      forms={forms}
      defaultCategory={searchParams.category}
      defaultStatus={searchParams.status}
      defaultFormId={searchParams.form}
    />
  )
}

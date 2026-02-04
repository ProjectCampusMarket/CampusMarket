import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { ServicesGrid } from '@/components/services-grid'
import type { Service } from '@/lib/types'

export default async function ServicesPage() {
  const supabase = await createClient()

  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .gte('available_date', new Date().toISOString().split('T')[0])
    .order('available_date', { ascending: true })

  if (error) {
    console.error('Error fetching services:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ServicesGrid services={(services as Service[]) || []} />
      </main>
    </div>
  )
}

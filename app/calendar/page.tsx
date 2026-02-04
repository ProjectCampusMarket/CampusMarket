import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { CalendarView } from '@/components/calendar-view'
import type { Service } from '@/lib/types'

export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .order('available_date', { ascending: true })

  if (error) {
    console.error('Error fetching services:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <CalendarView services={(services as Service[]) || []} />
      </main>
    </div>
  )
}

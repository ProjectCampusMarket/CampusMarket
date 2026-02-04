import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/header'
import { ProductsGrid } from '@/components/products-grid'
import type { Product } from '@/lib/types'

export default async function RentPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('type', 'rent')
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ProductsGrid
          products={(products as Product[]) || []}
          title="Rent Products"
          subtitle="Borrow items temporarily from fellow students"
          type="rent"
        />
      </main>
    </div>
  )
}

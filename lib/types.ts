export interface Product {
  id: string
  title: string
  description: string | null
  price: number
  category: string
  type: 'sell' | 'rent'
  condition: string | null
  duration_days: number | null
  image_url: string | null
  is_available: boolean
  seller_reputation: number
  created_at: string
  updated_at: string
  rented_at: string | null
}

export interface Service {
  id: string
  title: string
  description: string | null
  category: string
  price: number | null
  available_date: string
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export const productCategories = [
  { value: 'all', label: 'All Categories' },
  { value: 'stationary', label: 'Stationary' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'lab_equipment', label: 'Lab Equipment' },
] as const

export const serviceCategories = [
  { value: 'all', label: 'All Services' },
  { value: 'teaching', label: 'Tutoring' },
  { value: 'assignments', label: 'Assignment Help' },
  { value: 'editing', label: 'Editing' },
  { value: 'photography', label: 'Photography' },
  { value: 'designing', label: 'Design' },
  { value: 'party_prep', label: 'Events' },
] as const

export const conditionLabels: Record<string, string> = {
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
}

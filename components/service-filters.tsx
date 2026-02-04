'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { serviceCategories } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ServiceFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function ServiceFilters({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: ServiceFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 md:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {serviceCategories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(category.value)}
            className={cn(
              selectedCategory === category.value
                ? ''
                : 'bg-transparent hover:bg-secondary'
            )}
          >
            {category.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

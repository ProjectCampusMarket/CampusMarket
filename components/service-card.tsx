'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, Briefcase, CheckCircle } from 'lucide-react'
import type { Service } from '@/lib/types'
import { serviceCategories } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ServiceCardProps {
  service: Service
}

const categoryIcons: Record<string, string> = {
  teaching: 'bg-blue-100 text-blue-700',
  assignments: 'bg-amber-100 text-amber-700',
  editing: 'bg-emerald-100 text-emerald-700',
  photography: 'bg-pink-100 text-pink-700',
  designing: 'bg-indigo-100 text-indigo-700',
  party_prep: 'bg-orange-100 text-orange-700',
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const categoryItem = serviceCategories.find((c) => c.value === service.category)
  const categoryLabel = categoryItem?.label || service.category
  const categoryStyle = categoryIcons[service.category] || 'bg-muted text-muted-foreground'

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleBook = async () => {
    setIsLoading(true)
    try {
      await supabase
        .from('services')
        .update({ is_available: false })
        .eq('id', service.id)
      setShowSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error('Error booking service:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <Card className="flex min-h-[300px] items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <CheckCircle className="h-12 w-12 text-accent" />
          <p className="text-lg font-semibold text-foreground">Service Booked!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className={`rounded-lg p-2.5 ${categoryStyle}`}>
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={service.is_available ? 'default' : 'secondary'}
              className={service.is_available ? 'bg-accent text-accent-foreground' : ''}
            >
              {service.is_available ? 'Available' : 'Booked'}
            </Badge>
            <Badge variant="outline" className="shrink-0">
              {categoryLabel}
            </Badge>
          </div>
        </div>
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-foreground">
          {service.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {service.description}
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(service.available_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {formatTime(service.start_time)} - {formatTime(service.end_time)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border p-4">
        <div className="flex flex-col">
          {service.price ? (
            <span className="text-2xl font-bold text-primary">₹{service.price}</span>
          ) : (
            <span className="text-lg font-medium text-muted-foreground">Contact for price</span>
          )}
        </div>
        {service.is_available ? (
          <Button size="sm" onClick={handleBook} disabled={isLoading}>
            {isLoading ? 'Booking...' : 'Book Service'}
          </Button>
        ) : (
          <Button size="sm" variant="outline" disabled className="bg-transparent">
            Booked
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

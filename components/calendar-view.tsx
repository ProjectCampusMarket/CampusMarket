'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Clock, Briefcase, CheckCircle } from 'lucide-react'
import type { Service } from '@/lib/types'
import { serviceCategories } from '@/lib/types'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface CalendarViewProps {
  services: Service[]
}

const categoryColors: Record<string, string> = {
  teaching: 'bg-blue-500',
  assignments: 'bg-amber-500',
  editing: 'bg-emerald-500',
  photography: 'bg-pink-500',
  designing: 'bg-indigo-500',
  party_prep: 'bg-orange-500',
}

export function CalendarView({ services }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate])

  const servicesByDate = useMemo(() => {
    const map: Record<string, Service[]> = {}
    for (const service of services) {
      const date = service.available_date
      if (!map[date]) map[date] = []
      map[date].push(service)
    }
    return map
  }, [services])

  const formatDateKey = (day: number) => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${year}-${month}-${dayStr}`
  }

  const getServicesForDay = (day: number) => {
    return servicesByDate[formatDateKey(day)] || []
  }

  const selectedServices = selectedDate ? servicesByDate[selectedDate] || [] : []

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    setSelectedDate(null)
  }

  const today = new Date()
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const handleBook = async (serviceId: string) => {
    setBookingId(serviceId)
    try {
      await supabase
        .from('services')
        .update({ is_available: false })
        .eq('id', serviceId)
      setShowSuccess(serviceId)
      setTimeout(() => {
        setShowSuccess(null)
        setBookingId(null)
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error('Error booking service:', error)
      setBookingId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Service Calendar</h1>
        <p className="text-muted-foreground">View and book services by availability date</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">{monthYear}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={goToPrevMonth} className="bg-transparent">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextMonth} className="bg-transparent">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }
                const dateKey = formatDateKey(day)
                const dayServices = getServicesForDay(day)
                const hasServices = dayServices.length > 0
                const hasAvailable = dayServices.some(s => s.is_available)
                const allBooked = hasServices && !hasAvailable
                const isSelected = selectedDate === dateKey

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                    className={cn(
                      'relative flex aspect-square flex-col items-center justify-center rounded-lg p-1 transition-colors',
                      isToday(day) && 'ring-2 ring-primary',
                      isSelected && 'bg-primary text-primary-foreground',
                      !isSelected && hasServices && hasAvailable && 'bg-secondary hover:bg-secondary/80',
                      !isSelected && allBooked && 'bg-muted/50 hover:bg-muted',
                      !isSelected && !hasServices && 'hover:bg-muted'
                    )}
                  >
                    <span className={cn('text-sm font-medium', isSelected && 'text-primary-foreground')}>
                      {day}
                    </span>
                    {hasServices && (
                      <div className="mt-0.5 flex gap-0.5">
                        {dayServices.slice(0, 3).map((service) => (
                          <span
                            key={service.id}
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              isSelected 
                                ? 'bg-primary-foreground' 
                                : service.is_available 
                                  ? categoryColors[service.category] || 'bg-muted-foreground'
                                  : 'bg-muted-foreground/50'
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {selectedDate
                ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Select a Date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground">
                Click on a date to view available services
              </p>
            ) : selectedServices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No services available on this date</p>
            ) : (
              <div className="space-y-4">
                {selectedServices.map((service) => {
                  const categoryItem = serviceCategories.find((c) => c.value === service.category)
                  const isBooking = bookingId === service.id
                  const justBooked = showSuccess === service.id

                  if (justBooked) {
                    return (
                      <div
                        key={service.id}
                        className="flex items-center justify-center rounded-lg border border-border p-6"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle className="h-8 w-8 text-accent" />
                          <p className="font-medium text-foreground">Service Booked!</p>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={service.id}
                      className={cn(
                        "rounded-lg border border-border p-3 transition-colors",
                        service.is_available ? "hover:bg-muted/50" : "bg-muted/30"
                      )}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground">{service.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={service.is_available ? 'default' : 'secondary'}
                            className={cn(
                              "text-xs",
                              service.is_available && "bg-accent text-accent-foreground"
                            )}
                          >
                            {service.is_available ? 'Available' : 'Booked'}
                          </Badge>
                          {service.price && (
                            <span className="text-sm font-semibold text-primary">₹{service.price}</span>
                          )}
                        </div>
                      </div>
                      <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                        {service.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {categoryItem?.label || service.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(service.start_time)} - {formatTime(service.end_time)}
                        </div>
                      </div>
                      {service.is_available ? (
                        <Button 
                          size="sm" 
                          className="mt-3 w-full"
                          onClick={() => handleBook(service.id)}
                          disabled={isBooking}
                        >
                          {isBooking ? 'Booking...' : 'Book Service'}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="mt-3 w-full bg-transparent" disabled>
                          Booked
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Briefcase className="h-5 w-5" />
            Upcoming Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => {
              const categoryItem = serviceCategories.find((c) => c.value === service.category)
              return (
                <div
                  key={service.id}
                  className={cn(
                    "flex gap-3 rounded-lg border border-border p-3",
                    !service.is_available && "bg-muted/30"
                  )}
                >
                  <div
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full mt-2',
                      service.is_available
                        ? categoryColors[service.category] || 'bg-muted-foreground'
                        : 'bg-muted-foreground/50'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="truncate font-medium text-foreground">{service.title}</h4>
                      <Badge 
                        variant={service.is_available ? 'default' : 'secondary'}
                        className={cn(
                          "text-xs shrink-0",
                          service.is_available && "bg-accent text-accent-foreground"
                        )}
                      >
                        {service.is_available ? 'Available' : 'Booked'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(service.available_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' at '}
                      {formatTime(service.start_time)}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {categoryItem?.label || service.category}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, ShoppingCart, Clock, CheckCircle } from 'lucide-react'
import type { Product } from '@/lib/types'
import { conditionLabels } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [wasJustRented, setWasJustRented] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const categoryLabel = product.category.replace('_', ' ')
  const conditionLabel = product.condition ? conditionLabels[product.condition] || product.condition : null

  // Calculate days left for rented items
  useEffect(() => {
    if (product.type === 'rent' && product.rented_at && product.duration_days) {
      const calculateDaysLeft = () => {
        const rentedDate = new Date(product.rented_at!)
        const endDate = new Date(rentedDate.getTime() + product.duration_days! * 24 * 60 * 60 * 1000)
        const now = new Date()
        const diffTime = endDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return Math.max(0, diffDays)
      }

      setDaysLeft(calculateDaysLeft())

      // Update every minute to keep the countdown accurate
      const interval = setInterval(() => {
        const remaining = calculateDaysLeft()
        setDaysLeft(remaining)
        if (remaining <= 0) {
          // Auto-refresh when rental period ends
          router.refresh()
        }
      }, 60000)

      return () => clearInterval(interval)
    }
  }, [product.rented_at, product.duration_days, product.type, router])

  const isRented = product.type === 'rent' && (product.rented_at || wasJustRented) && daysLeft !== null && daysLeft > 0

  const handleBuy = async () => {
    setIsLoading(true)
    try {
      // Delete the product (purchased)
      await supabase.from('products').delete().eq('id', product.id)
      setShowSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error('Error purchasing product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRent = async () => {
    setIsLoading(true)
    try {
      // Update the product with rented_at timestamp
      const rentedAt = new Date().toISOString()
      const { error } = await supabase
        .from('products')
        .update({ rented_at: rentedAt })
        .eq('id', product.id)
      
      if (error) {
        console.error('Error renting product:', error)
        return
      }
      
      // Set local state to show rented status immediately
      setShowSuccess(true)
      setWasJustRented(true)
      
      // Calculate days left for immediate display after success
      if (product.duration_days) {
        setDaysLeft(product.duration_days)
      }
      
      setTimeout(() => {
        setShowSuccess(false)
      }, 1500)
    } catch (error) {
      console.error('Error renting product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <Card className="flex min-h-[320px] items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <CheckCircle className="h-12 w-12 text-accent" />
          <p className="text-lg font-semibold text-foreground">
            {product.type === 'sell' ? 'Successfully Purchased!' : 'Rented Successfully!'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <Badge
          variant={product.type === 'sell' ? 'default' : 'secondary'}
          className="absolute left-3 top-3"
        >
          {product.type === 'sell' ? 'For Sale' : 'For Rent'}
        </Badge>
        {isRented && (
          <Badge variant="destructive" className="absolute right-3 top-3">
            Rented
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-1 font-semibold text-foreground">{product.title}</h3>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {categoryLabel}
          </Badge>
          {conditionLabel && (
            <Badge variant="outline" className="text-accent-foreground border-accent bg-accent/10">
              {conditionLabel}
            </Badge>
          )}
        </div>
        {isRented && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-amber-700">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">
              Available after {daysLeft} day{daysLeft !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border p-4">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-primary">₹{product.price}</span>
          {product.type === 'rent' && product.duration_days && (
            <span className="text-xs text-muted-foreground">
              per {product.duration_days} day{product.duration_days > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {isRented ? (
          <Button size="sm" variant="outline" disabled className="gap-2 bg-transparent">
            <Clock className="h-4 w-4" />
            Rented
          </Button>
        ) : (
          <Button 
            size="sm" 
            className="gap-2" 
            onClick={product.type === 'sell' ? handleBuy : handleRent}
            disabled={isLoading}
          >
            <ShoppingCart className="h-4 w-4" />
            {isLoading ? 'Processing...' : product.type === 'sell' ? 'Buy Now' : 'Rent Now'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

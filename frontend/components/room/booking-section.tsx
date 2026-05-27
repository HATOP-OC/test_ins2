'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, addDays, isSameDay, parseISO, isToday, startOfDay } from 'date-fns'
import { CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, Trash2, CalendarDays, Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { CreateBookingModal } from '@/components/room/create-booking-modal'
import { EditBookingModal } from '@/components/room/edit-booking-modal'
import { bookingsApi, type Booking } from '@/lib/api/bookings'
import { getErrorMessage } from '@/lib/api/client'
import { cn } from '@/lib/utils'

interface BookingSectionProps {
  roomId: string
  isAdmin: boolean
  currentUserId: string
}

export function BookingSection({ roomId, isAdmin, currentUserId }: BookingSectionProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null)
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchBookings = useCallback(async () => {
    try {
      const data = await bookingsApi.getByRoom(roomId)
      setBookings(data.bookings)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return

    setIsDeleting(true)
    try {
      await bookingsApi.delete(roomId, bookingToDelete.id)
      toast.success('Booking canceled successfully')
      setBookingToDelete(null)
      fetchBookings()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = parseISO(booking.startTime)
    return isSameDay(bookingDate, selectedDate)
  })

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  })

  const datesWithBookings = bookings.map((b) => startOfDay(parseISO(b.startTime)))

  const canManageBooking = (booking: Booking) => {
    return isAdmin || booking.userId === currentUserId
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Schedule</CardTitle>
            <CardDescription>
              View and manage room bookings
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Book Room
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setSelectedDate((d) => addDays(d, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full sm:w-[240px] justify-start font-normal",
                    isToday(selectedDate) && "border-accent text-accent"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {isToday(selectedDate) ? 'Today, ' : ''}
                    {format(selectedDate, 'EEE, MMM d, yyyy')}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  modifiers={{
                    booked: datesWithBookings,
                  }}
                  modifiersClassNames={{
                    booked: 'bg-accent/20 font-semibold',
                  }}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setSelectedDate((d) => addDays(d, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {!isToday(selectedDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="text-muted-foreground hover:text-foreground"
            >
              Jump to Today
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg border border-border/50">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-6 w-px" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedBookings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/50 bg-secondary/20">
            <Empty className="py-12">
              <EmptyMedia>
                <div className="rounded-full bg-secondary p-3">
                  <CalendarDays className="h-6 w-6 text-muted-foreground" />
                </div>
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle className="text-base font-medium">No bookings</EmptyTitle>
                <EmptyDescription className="text-muted-foreground">
                  No bookings scheduled for {format(selectedDate, 'MMMM d, yyyy')}.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Book This Time
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBookings.map((booking) => {
              const startTime = parseISO(booking.startTime)
              const endTime = parseISO(booking.endTime)
              const isOwner = booking.userId === currentUserId

              return (
                <div
                  key={booking.id}
                  className={cn(
                    'group relative flex items-start gap-4 rounded-lg border p-4 transition-all',
                    isOwner 
                      ? 'border-accent/30 bg-accent/5 hover:border-accent/50' 
                      : 'border-border/50 hover:border-border hover:bg-secondary/30'
                  )}
                >
                  <div className="flex flex-col items-center gap-1 shrink-0 w-14 text-center">
                    <span className="text-sm font-semibold tabular-nums">
                      {format(startTime, 'HH:mm')}
                    </span>
                    <div className="h-5 w-px bg-border" />
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {format(endTime, 'HH:mm')}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {booking.description || 'Meeting'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {booking.user.name}
                          </p>
                          {isOwner && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              You
                            </Badge>
                          )}
                        </div>
                      </div>
                      {canManageBooking(booking) && (
                        <div className="flex items-center gap-1 shrink-0 opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                            onClick={() => setBookingToEdit(booking)}
                            title="Edit booking"
                            aria-label="Edit booking"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setBookingToDelete(booking)}
                            title="Cancel booking"
                            aria-label="Cancel booking"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <CreateBookingModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        roomId={roomId}
        selectedDate={selectedDate}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          fetchBookings()
        }}
      />

      <EditBookingModal
        open={!!bookingToEdit}
        onOpenChange={(open) => !open && setBookingToEdit(null)}
        roomId={roomId}
        booking={bookingToEdit}
        onSuccess={() => {
          setBookingToEdit(null)
          fetchBookings()
        }}
      />

      <AlertDialog open={!!bookingToDelete} onOpenChange={(open) => !open && setBookingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBooking}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Canceling...' : 'Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

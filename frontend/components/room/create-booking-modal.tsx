'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, set } from 'date-fns'
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'

import { createBookingSchema, type CreateBookingFormData } from '@/lib/schemas/booking'
import { bookingsApi } from '@/lib/api/bookings'
import { getErrorMessage } from '@/lib/api/client'
import { cn } from '@/lib/utils'

interface CreateBookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: string
  selectedDate: Date
  onSuccess: () => void
}

export function CreateBookingModal({
  open,
  onOpenChange,
  roomId,
  selectedDate,
  onSuccess,
}: CreateBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      date: selectedDate,
      startTime: '09:00',
      endTime: '10:00',
      description: '',
    },
  })

  useEffect(() => {
    form.setValue('date', selectedDate)
  }, [selectedDate, form])

  async function onSubmit(data: CreateBookingFormData) {
    setIsSubmitting(true)
    try {
      const [startHour, startMinute] = data.startTime.split(':').map(Number)
      const [endHour, endMinute] = data.endTime.split(':').map(Number)

      const startDateTime = set(data.date, {
        hours: startHour,
        minutes: startMinute,
        seconds: 0,
        milliseconds: 0,
      })

      const endDateTime = set(data.date, {
        hours: endHour,
        minutes: endMinute,
        seconds: 0,
        milliseconds: 0,
      })

      await bookingsApi.create(
        roomId,
        startDateTime.toISOString(),
        endDateTime.toISOString(),
        data.description || undefined
      )

      toast.success('Booking created', {
        description: `Scheduled for ${format(startDateTime, 'MMM d')} at ${format(startDateTime, 'HH:mm')} - ${format(endDateTime, 'HH:mm')}`,
      })
      form.reset()
      onSuccess()
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      
      if (errorMessage.toLowerCase().includes('conflict') || 
          errorMessage.toLowerCase().includes('overlap') ||
          errorMessage.toLowerCase().includes('already booked') ||
          errorMessage.toLowerCase().includes('time slot')) {
        toast.error('Booking Conflict', {
          description: 'This time slot overlaps with an existing booking. Please select a different time.',
          icon: <AlertCircle className="h-5 w-5" />,
          duration: 5000,
        })
      } else {
        toast.error('Failed to create booking', {
          description: errorMessage,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset({
        date: selectedDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
      })
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1 text-center">
            <DialogTitle className="text-xl">Book Room</DialogTitle>
            <DialogDescription>
              Schedule a meeting for this room
            </DialogDescription>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'h-11 w-full justify-start text-left font-normal bg-secondary/50 border-border/50 hover:bg-background',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                          {field.value ? (
                            format(field.value, 'EEEE, MMMM d, yyyy')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Start Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        className="h-11 bg-secondary/50 border-border/50 focus:bg-background transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">End Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        className="h-11 bg-secondary/50 border-border/50 focus:bg-background transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Description <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Team standup, Client meeting..."
                      className="resize-none min-h-[80px] bg-secondary/50 border-border/50 focus:bg-background transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 sm:flex-none min-w-[120px]"
              >
                {isSubmitting ? <Spinner className="h-4 w-4" /> : 'Create Booking'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

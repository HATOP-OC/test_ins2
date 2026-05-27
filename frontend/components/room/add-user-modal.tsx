'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { UserPlus, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

import { addUserToRoomSchema, type AddUserToRoomFormData } from '@/lib/schemas/room'
import { roomsApi } from '@/lib/api/rooms'
import { getErrorMessage } from '@/lib/api/client'

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: string
  onSuccess: () => void
}

export function AddUserModal({ open, onOpenChange, roomId, onSuccess }: AddUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AddUserToRoomFormData>({
    resolver: zodResolver(addUserToRoomSchema),
    defaultValues: {
      email: '',
      role: 'USER',
    },
  })

  async function onSubmit(data: AddUserToRoomFormData) {
    setIsSubmitting(true)
    try {
      await roomsApi.addUser(roomId, data.email, data.role)
      toast.success('User added', {
        description: `${data.email} now has access to this room`,
      })
      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1 text-center">
            <DialogTitle className="text-xl">Add User to Room</DialogTitle>
            <DialogDescription>
              Invite someone by their email address
            </DialogDescription>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="colleague@example.com"
                        className="pl-10 h-11 bg-secondary/50 border-border/50 focus:bg-background transition-colors"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Permission Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 bg-secondary/50 border-border/50 focus:bg-background">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">
                        <div className="flex flex-col">
                          <span>User</span>
                          <span className="text-xs text-muted-foreground">Can view schedule and make bookings</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex flex-col">
                          <span>Admin</span>
                          <span className="text-xs text-muted-foreground">Full control including managing users</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                className="flex-1 sm:flex-none min-w-[100px]"
              >
                {isSubmitting ? <Spinner className="h-4 w-4" /> : 'Add User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

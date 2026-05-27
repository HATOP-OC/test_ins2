'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, UserPlus, Crown, Users, Settings, Calendar } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddUserModal } from '@/components/room/add-user-modal'
import { UserList } from '@/components/room/user-list'
import { BookingSection } from '@/components/room/booking-section'
import { roomsApi, type RoomDetail } from '@/lib/api/rooms'
import { getErrorMessage } from '@/lib/api/client'
import { useAuthStore } from '@/lib/store/auth'
import { updateRoomSchema, type UpdateRoomFormData } from '@/lib/schemas/room'

export default function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuthStore()
  const [room, setRoom] = useState<RoomDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isUpdatingRoom, setIsUpdatingRoom] = useState(false)

  const isAdmin = room?.role === 'ADMIN'

  const fetchRoom = useCallback(async () => {
    try {
      const data = await roomsApi.getById(id)
      setRoom(data.room)
    } catch (error) {
      toast.error(getErrorMessage(error))
      router.replace('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchRoom()
  }, [fetchRoom])

  const form = useForm<UpdateRoomFormData>({
    resolver: zodResolver(updateRoomSchema),
    defaultValues: {
      name: room?.name ?? '',
      description: room?.description ?? '',
    },
  })

  useEffect(() => {
    if (room) {
      form.reset({
        name: room.name ?? '',
        description: room.description ?? '',
      })
    }
  }, [room, form])

  const handleDeleteRoom = async () => {
    setIsDeleting(true)
    try {
      await roomsApi.delete(id)
      toast.success('Room deleted successfully')
      router.replace('/dashboard')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdateRoom = async (data: UpdateRoomFormData) => {
    setIsUpdatingRoom(true)
    try {
      await roomsApi.update(id, data.name, data.description || undefined)
      toast.success('Room updated successfully')
      fetchRoom()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsUpdatingRoom(false)
    }
  }

  if (isLoading) {
    return <RoomDetailSkeleton />
  }

  if (!room) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold tracking-tight truncate">{room.name}</h1>
            <Badge 
              variant={isAdmin ? 'default' : 'secondary'}
              className="shrink-0"
            >
              {isAdmin && <Crown className="mr-1 h-3 w-3" />}
              {room.role}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {room.description || 'No description provided'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddUserModalOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Room</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this room? This action cannot be undone.
                    All bookings and user access will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteRoom}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Room'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1">
          <TabsTrigger value="bookings" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {room.users.length}
            </Badge>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="bookings" className="mt-6">
          <BookingSection roomId={id} isAdmin={isAdmin} currentUserId={user?.id || ''} />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Room Access</CardTitle>
              <CardDescription>
                Manage who can view and book this room
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserList
                roomId={id}
                users={room.users}
                isAdmin={isAdmin}
                currentUserId={user?.id || ''}
                onUserUpdated={fetchRoom}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings" className="mt-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Room Settings</CardTitle>
                <CardDescription>
                  View room configuration and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold">Edit Room Details</h4>
                    <p className="text-sm text-muted-foreground">
                      Update the room name and description
                    </p>
                  </div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleUpdateRoom)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Room Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Conference Room A"
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
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Description <span className="text-muted-foreground font-normal">(optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add a brief description of this room..."
                                className="resize-none min-h-[100px] bg-secondary/50 border-border/50 focus:bg-background transition-colors"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isUpdatingRoom} className="min-w-[140px]">
                          {isUpdatingRoom ? <Spinner className="h-4 w-4" /> : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
                <Separator />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Room ID</h4>
                  <p className="text-sm font-mono bg-secondary/50 px-3 py-2 rounded-md">{room.id}</p>
                </div>
                <Separator />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                  <p className="text-sm">
                    {new Date(room.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <AddUserModal
        open={isAddUserModalOpen}
        onOpenChange={setIsAddUserModalOpen}
        roomId={id}
        onSuccess={fetchRoom}
      />
    </div>
  )
}

function RoomDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      <Skeleton className="h-10 w-80" />
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    </div>
  )
}

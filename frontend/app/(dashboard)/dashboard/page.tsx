'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Users, Crown, ArrowRight, Calendar } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { CreateRoomModal } from '@/components/dashboard/create-room-modal'
import { roomsApi, type RoomWithAccess } from '@/lib/api/rooms'
import { getErrorMessage } from '@/lib/api/client'

export default function DashboardPage() {
  const [rooms, setRooms] = useState<RoomWithAccess[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const fetchRooms = useCallback(async () => {
    try {
      const data = await roomsApi.getAll()
      setRooms(data.rooms)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const handleRoomCreated = () => {
    setIsCreateModalOpen(false)
    fetchRooms()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Your Rooms</h1>
          <p className="text-muted-foreground">
            Manage meeting rooms and schedule bookings
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Room
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-4 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <Card className="border-border/50 border-dashed">
          <Empty className="py-16">
            <EmptyMedia>
              <div className="rounded-full bg-secondary p-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle className="text-lg font-medium">No rooms yet</EmptyTitle>
              <EmptyDescription className="text-muted-foreground max-w-sm mx-auto">
                Create your first meeting room to start organizing and scheduling bookings with your team.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Room
              </Button>
            </EmptyContent>
          </Empty>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Link key={room.id} href={`/dashboard/room/${room.id}`}>
              <Card className="group h-full border-border/50 transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="line-clamp-1 text-base font-medium group-hover:text-accent transition-colors">
                      {room.name}
                    </CardTitle>
                    <Badge 
                      variant={room.role === 'ADMIN' ? 'default' : 'secondary'}
                      className="shrink-0 text-xs"
                    >
                      {room.role === 'ADMIN' && <Crown className="mr-1 h-3 w-3" />}
                      {room.role}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 text-sm">
                    {room.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(room.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateRoomModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleRoomCreated}
      />
    </div>
  )
}

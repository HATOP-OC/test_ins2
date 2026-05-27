'use client'

import { useState } from 'react'
import { Crown, MoreHorizontal, Trash2, ShieldCheck, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

import { roomsApi, type RoomAccess } from '@/lib/api/rooms'
import { getErrorMessage } from '@/lib/api/client'
import { cn } from '@/lib/utils'

interface UserListProps {
  roomId: string
  users: RoomAccess[]
  isAdmin: boolean
  currentUserId: string
  onUserUpdated: () => void
}

export function UserList({ roomId, users, isAdmin, currentUserId, onUserUpdated }: UserListProps) {
  const [userToRemove, setUserToRemove] = useState<RoomAccess | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleUpdateRole = async (access: RoomAccess, newRole: 'ADMIN' | 'USER') => {
    try {
      await roomsApi.updateUserRole(roomId, access.userId, newRole)
      toast.success('Role updated successfully')
      onUserUpdated()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleRemoveUser = async () => {
    if (!userToRemove) return

    setIsRemoving(true)
    try {
      await roomsApi.removeUser(roomId, userToRemove.userId)
      toast.success('User removed successfully')
      setUserToRemove(null)
      onUserUpdated()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <>
      <div className="space-y-2">
        {users.map((access) => {
          const initials = access.user.name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U'

          const isCurrentUser = access.userId === currentUserId

          return (
            <div
              key={access.id}
              className={cn(
                'group flex items-center justify-between p-3 rounded-lg border transition-colors',
                isCurrentUser 
                  ? 'border-accent/30 bg-accent/5' 
                  : 'border-border/50 hover:border-border hover:bg-secondary/30'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9 shrink-0 border border-border/50">
                  <AvatarFallback className="text-xs font-medium bg-secondary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{access.user.name}</span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 shrink-0">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{access.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge 
                  variant={access.role === 'ADMIN' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {access.role === 'ADMIN' && <Crown className="mr-1 h-3 w-3" />}
                  {access.role}
                </Badge>
                {isAdmin && !isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {access.role === 'USER' ? (
                        <DropdownMenuItem onClick={() => handleUpdateRole(access, 'ADMIN')}>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Promote to Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleUpdateRole(access, 'USER')}>
                          <User className="mr-2 h-4 w-4" />
                          Demote to User
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setUserToRemove(access)}
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove from Room
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog open={!!userToRemove} onOpenChange={(open) => !open && setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-medium">{userToRemove?.user.name}</span> from this room?
              They will lose access to all bookings in this room.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveUser}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? 'Removing...' : 'Remove User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NotificationUser {
  id: string
  name: string | null
  email: string
}

interface NotificationDisplayProps {
  notifications: Array<{
    user: NotificationUser | null
  }>
  maxVisible?: number
  className?: string
}

export function NotificationDisplay({ 
  notifications, 
  maxVisible = 2, 
  className 
}: NotificationDisplayProps) {
  // Filter out notifications without users and get unique users
  const uniqueUsers = Array.from(
    new Map(
      notifications
        .filter(n => n.user)
        .map(n => [n.user!.id, n.user!])
    ).values()
  )

  const visibleUsers = uniqueUsers.slice(0, maxVisible)
  const remainingCount = uniqueUsers.length - maxVisible

  if (uniqueUsers.length === 0) {
    return <span className="text-sm text-gray-500">No notifications</span>
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {visibleUsers.map((user, index) => (
        <Avatar key={user.id} className="h-6 w-6 border-2 border-white">
          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&size=24`} />
          <AvatarFallback className="text-xs">
            {(user.name || user.email).slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {remainingCount > 0 && (
        <span className="text-sm text-gray-600 font-medium ml-1">
          +{remainingCount} more
        </span>
      )}
    </div>
  )
}
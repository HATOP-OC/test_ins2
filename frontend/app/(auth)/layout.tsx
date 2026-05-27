'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { Spinner } from '@/components/ui/spinner'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <header className="flex items-center justify-between px-6 py-4 lg:px-8">
        <Link 
          href="/" 
          className="flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity"
        >
          <span className="font-semibold text-lg tracking-tight">RoomBook</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Insiders test task: Created HATOP_OC
        </p>
      </footer>
    </div>
  )
}

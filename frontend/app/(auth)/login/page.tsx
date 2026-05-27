'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Mail, Lock, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'

import { loginSchema, type LoginFormData } from '@/lib/schemas/auth'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/auth'
import { getErrorMessage } from '@/lib/api/client'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormData) {
    setIsSubmitting(true)
    try {
      const response = await authApi.login(data.email, data.password)
      setAuth(response.user, response.token)
      toast.success('Welcome back')
      router.replace('/dashboard')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-[420px] border-border/50 shadow-xl shadow-black/5 dark:shadow-black/20">
      <CardHeader className="space-y-2 pb-6">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="pl-10 h-11 bg-secondary/50 border-border/50 focus:bg-background transition-colors"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full h-11 font-medium mt-2 group" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center pt-2 pb-6">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link 
            href="/register" 
            className="font-medium text-foreground hover:text-accent transition-colors"
          >
            Create account
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

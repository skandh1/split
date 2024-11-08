'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).optional(),
})

export default function Component() {
  const [isSignUp, setIsSignUp] = useState(false)
  const { signup, login } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: any) => {
    try {
      if (isSignUp) {
        await signup(data.email, data.password, data.username!)
      } else {
        await login(data.email, data.password)
      }
      navigate('/')
    } catch (error) {
      toast.error('Failed to sign in')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-blue-100 to-purple-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">SplitBuddy</CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isSignUp && (
              <div>
                <Input
                  {...register('username')}
                  placeholder="Username"
                  className="w-full"
                />
                {errors.username && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.username.message as string}
                  </p>
                )}
              </div>
            )}

            <div>
              <Input
                {...register('email')}
                type="email"
                placeholder="Email address"
                className="w-full"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <div>
              <Input
                {...register('password')}
                type="password"
                placeholder="Password"
                className="w-full"
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
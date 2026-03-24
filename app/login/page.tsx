'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthStore } from '@/lib/auth-store'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
  remember: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'password123',
      remember: true,
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true)
    try {
      await login(values.email, values.password)
      toast.success('登录成功！')
      router.push('/dashboard')
    } catch (error) {
      toast.error('登录失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block p-3 bg-primary/10 rounded-lg mb-4">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.3671a19.8062 19.8062 0 00-4.885-1.515a.074.074 0 00-.079.0366c-.211.3754-.444.8623-.607 1.25a18.27 18.27 0 00-5.487 0c-.163-.3875-.399-.8746-.61-1.25a.077.077 0 00-.079-.0365c-1.751.3013-3.4444.8679-4.8845 1.515a.072.072 0 00-.033.0264C.5087 7.1064.20577 9.7581 1.943 12.2324a.083.083 0 00.032.0456c2.04 1.52 4.025 2.44 5.975 3.0552a.081.081 0 00.088-.0328c.462-.6335.873-1.305 1.226-2.0093a.076.076 0 00-.042-.106c-.634-.2017-1.239-.4925-1.823-.8063a.077.077 0 01-.008-.128c.122-.0922.245-.1884.361-.2887a.077.077 0 01.08-.0105c3.928 1.7953 8.18 1.7953 12.062 0a.077.077 0 01.083.0095c.116.099.242.1964.361.2887a.077.077 0 01-.006.127c-.584.3138-1.189.604-1.823.8062a.077.077 0 00-.042.107c.353.7045.764 1.3745 1.226 2.0093a.076.076 0 00.088.0327c1.95-.6151 3.938-1.548 5.975-3.0524a.077.077 0 00.032-.0456c1.856-2.6672 1.57-5.1878.838-7.5039a.07.07 0 00-.031-.0264z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bot Control Panel</h1>
          <p className="text-muted-foreground">管理您的 Discord 机器人</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 backdrop-blur-sm bg-card/50 border border-border/50">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱地址</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin@example.com"
                        type="email"
                        disabled={isSubmitting || isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>密码</FormLabel>
                      <Link href="#" className="text-sm text-primary hover:underline">
                        忘记密码？
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        disabled={isSubmitting || isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me */}
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting || isLoading}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      记住我
                    </FormLabel>
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    登录中...
                  </>
                ) : (
                  '登 录'
                )}
              </Button>

              {/* Demo Hint */}
              <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                <p className="font-medium mb-1">演示账户：</p>
                <p>邮箱: admin@example.com</p>
                <p>密码: password123</p>
              </div>
            </form>
          </Form>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          这是一个前端演示。所有数据均为模拟数据。
        </p>
      </div>
    </div>
  )
}

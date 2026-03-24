'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Bot, Sparkles, Shield, Zap } from 'lucide-react'

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
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20">
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8">
              <Bot className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Discord Bot Panel</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-6">
              强大的机器人
              <br />
              <span className="text-primary">管理控制台</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              一站式管理您的 Discord 机器人，支持命令配置、自动回复、数据统计等丰富功能。
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">实时数据监控</h3>
                <p className="text-sm text-muted-foreground">查看机器人运行状态和使用统计</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">安全可靠</h3>
                <p className="text-sm text-muted-foreground">企业级安全防护，数据加密传输</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">智能自动化</h3>
                <p className="text-sm text-muted-foreground">灵活的自动回复和命令配置</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Bot className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Bot Panel</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">欢迎回来</h2>
            <p className="text-muted-foreground">请登录您的账户以继续</p>
          </div>

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">邮箱地址</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your@email.com"
                        type="email"
                        className="h-11 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        disabled={isSubmitting || isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-foreground">密码</FormLabel>
                      <Link href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                        忘记密码？
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="输入您的密码"
                        type="password"
                        className="h-11 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        disabled={isSubmitting || isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting || isLoading}
                        className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </FormControl>
                    <FormLabel className="font-normal text-muted-foreground cursor-pointer !mt-0">
                      保持登录状态
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
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
            </form>
          </Form>

          {/* Demo Account Info */}
          <div className="mt-6 p-4 bg-secondary/30 border border-border/30 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-primary/10 rounded-md mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">演示账户</p>
                <p className="text-muted-foreground">
                  邮箱: <span className="text-foreground font-mono">admin@example.com</span>
                </p>
                <p className="text-muted-foreground">
                  密码: <span className="text-foreground font-mono">password123</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            前端演示项目，所有数据均为模拟
          </p>
        </div>
      </div>
    </div>
  )
}

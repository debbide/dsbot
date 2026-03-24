'use client'

import { useState } from 'react'
import { useRouter, useEffect } from 'next/navigation'
import { Sidebar, TopBar, MobileNav } from '@/components/layout'
import { useAuthStore } from '@/lib/auth-store'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Copy, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const botSettingsSchema = z.object({
  name: z.string().min(1, '机器人名不能为空'),
  prefix: z.string().min(1, '前缀不能为空'),
})

type BotSettingsFormValues = z.infer<typeof botSettingsSchema>

export default function SettingsPage() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const router = useRouter()
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey] = useState('sk_live_51234567890abcdefghijklmnopqrstuvwxyz')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const botForm = useForm<BotSettingsFormValues>({
    resolver: zodResolver(botSettingsSchema),
    defaultValues: {
      name: 'MyAwesomeBot',
      prefix: '!',
    },
  })

  if (!isAuthenticated) {
    return null
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast.success('已复制到剪贴板')
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />

      <main className="lg:ml-64 pt-20 pb-20 lg:pb-4 px-4 lg:px-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold">设置</h1>
            <p className="text-muted-foreground mt-1">管理您的机器人和账户设置</p>
          </div>

          <Tabs defaultValue="bot" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bot">机器人设置</TabsTrigger>
              <TabsTrigger value="notifications">通知设置</TabsTrigger>
              <TabsTrigger value="account">账户设置</TabsTrigger>
            </TabsList>

            {/* Bot Settings Tab */}
            <TabsContent value="bot" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">基础配置</h2>

                <Form {...botForm}>
                  <form className="space-y-6">
                    <FormField
                      control={botForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>机器人名称</FormLabel>
                          <FormControl>
                            <Input placeholder="输入机器人名称" {...field} />
                          </FormControl>
                          <FormDescription>
                            这是您机器人在 Discord 中显示的名称
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={botForm.control}
                      name="prefix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>命令前缀</FormLabel>
                          <FormControl>
                            <Input placeholder="!" maxLength={1} {...field} />
                          </FormControl>
                          <FormDescription>
                            用于触发机器人命令的符号
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button onClick={() => toast.success('设置已保存')}>
                      保存更改
                    </Button>
                  </form>
                </Form>
              </Card>

              {/* API Key */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">API 密钥</h2>
                <FormDescription className="mb-4">
                  使用此密钥来进行 API 调用。请妥善保管，不要分享给任何人。
                </FormDescription>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 text-sm break-all">
                    {showApiKey ? apiKey : apiKey.replace(/./g, '*')}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyApiKey}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <Button variant="outline" className="mt-4 w-full">
                  重新生成密钥
                </Button>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">邮件通知</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">错误告警</p>
                      <p className="text-sm text-muted-foreground">
                        当机器人发生错误时接收邮件通知
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">每日摘要</p>
                      <p className="text-sm text-muted-foreground">
                        接收每日活动摘要
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">更新通知</p>
                      <p className="text-sm text-muted-foreground">
                        收到重要更新和新功能的通知
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">站内通知</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">命令执行提醒</p>
                      <p className="text-sm text-muted-foreground">
                        在仪表盘显示命令执行提醒
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">安全告警</p>
                      <p className="text-sm text-muted-foreground">
                        检测到可疑活动时立即通知
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">账户信息</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">邮箱地址</p>
                    <p className="mt-1">{user?.email}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">用户名</p>
                    <p className="mt-1">{user?.username}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">账户状态</p>
                    <div className="mt-1">
                      <Badge>活跃</Badge>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-destructive/50">
                <h2 className="text-lg font-semibold mb-4">危险操作</h2>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    修改密码
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    退出登录
                  </Button>

                  <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                    删除账户
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  删除账户将不可恢复地移除所有数据。请谨慎操作。
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

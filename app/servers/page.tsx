'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Sidebar, TopBar, MobileNav } from '@/components/layout'
import { useAuthStore } from '@/lib/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Switch,
} from '@/components/ui/switch'
import { Search, Settings2, Users } from 'lucide-react'
import { Label } from '@/components/ui/label'

export default function ServersPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const { data: guilds, isLoading } = useQuery({
    queryKey: ['guilds'],
    queryFn: () => apiClient.getGuilds(),
  })

  if (!isAuthenticated) {
    return null
  }

  const filteredGuilds = guilds?.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const selectedGuildData = guilds?.find(g => g.id === selectedGuild)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />

      <main className="lg:ml-64 pt-20 pb-20 lg:pb-4 px-4 lg:px-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold">服务器管理</h1>
            <p className="text-muted-foreground mt-1">管理您的 Discord 服务器设置</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索服务器..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Guilds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))
            ) : filteredGuilds.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">没有找到服务器</p>
              </div>
            ) : (
              filteredGuilds.map((guild) => (
                <Card
                  key={guild.id}
                  className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedGuild(guild.id)}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{guild.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        <Users className="w-3 h-3 inline mr-1" />
                        {guild.member_count} 成员
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {guild.enabled_modules.map((module) => (
                        <Badge key={module} variant="secondary" className="text-xs">
                          {module === 'welcome' && '欢迎消息'}
                          {module === 'auto_reply' && '自动回复'}
                          {module === 'logging' && '日志记录'}
                          {module === 'commands' && '命令'}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedGuild(guild.id)
                      }}
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      设置
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Guild Details Dialog */}
      <Dialog open={!!selectedGuild} onOpenChange={(open) => !open && setSelectedGuild(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedGuildData?.name}</DialogTitle>
            <DialogDescription>
              配置服务器模块和设置
            </DialogDescription>
          </DialogHeader>

          {selectedGuildData && (
            <div className="space-y-6">
              {/* Members Info */}
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">服务器成员</p>
                <p className="text-2xl font-bold">{selectedGuildData.member_count}</p>
              </div>

              {/* Module Toggles */}
              <div className="space-y-4">
                <p className="font-medium text-sm">启用的模块</p>
                {['welcome', 'auto_reply', 'logging', 'commands'].map((module) => (
                  <div key={module} className="flex items-center justify-between">
                    <Label htmlFor={`module-${module}`} className="text-sm cursor-pointer">
                      {module === 'welcome' && '欢迎消息'}
                      {module === 'auto_reply' && '自动回复'}
                      {module === 'logging' && '日志记录'}
                      {module === 'commands' && '命令'}
                    </Label>
                    <Switch
                      id={`module-${module}`}
                      checked={selectedGuildData.enabled_modules.includes(module)}
                    />
                  </div>
                ))}
              </div>

              <Button className="w-full">保存更改</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MobileNav />
    </div>
  )
}

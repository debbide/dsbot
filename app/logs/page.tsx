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
import { Search, Eye } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function LogsPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [logType, setLogType] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const { data: logs, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: () => apiClient.getLogs(),
  })

  if (!isAuthenticated) {
    return null
  }

  const filteredLogs = logs?.filter(log => {
    const matchType = logType === 'all' || log.type === logType
    const matchSearch = log.guild_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       log.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchType && matchSearch
  }) || []

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'command': '命令',
      'auto_reply': '自动回复',
      'error': '错误',
      'member_join': '成员加入',
      'member_leave': '成员退出',
    }
    return labels[type] || type
  }

  const getTypeBadgeVariant = (type: string) => {
    const variants: Record<string, any> = {
      'command': 'default',
      'auto_reply': 'secondary',
      'error': 'destructive',
      'member_join': 'default',
      'member_leave': 'outline',
    }
    return variants[type] || 'default'
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />

      <main className="lg:ml-64 pt-20 pb-20 lg:pb-4 px-4 lg:px-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold">日志中心</h1>
            <p className="text-muted-foreground mt-1">查看机器人的所有活动日志</p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索日志..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
              className="p-2 border border-input rounded-md bg-background"
            >
              <option value="all">所有类型</option>
              <option value="command">命令</option>
              <option value="auto_reply">自动回复</option>
              <option value="error">错误</option>
              <option value="member_join">成员加入</option>
              <option value="member_leave">成员退出</option>
            </select>
          </div>

          {/* Logs Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>服务器</TableHead>
                  <TableHead>详情</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">没有找到日志</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.timestamp).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(log.type)}>
                          {getTypeLabel(log.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.guild_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {log.message}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>日志详情</DialogTitle>
            <DialogDescription>
              {selectedLog?.guild_name} - {getTypeLabel(selectedLog?.type)}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">时间</p>
                  <p className="mt-1">
                    {new Date(selectedLog.timestamp).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">类型</p>
                  <p className="mt-1">
                    <Badge variant={getTypeBadgeVariant(selectedLog.type)}>
                      {getTypeLabel(selectedLog.type)}
                    </Badge>
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">服务器</p>
                <p className="mt-1">{selectedLog.guild_name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">消息</p>
                <p className="mt-1 bg-muted p-3 rounded text-sm">
                  {selectedLog.message}
                </p>
              </div>

              {selectedLog.details && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">其他详情</p>
                  <pre className="mt-1 bg-muted p-3 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

              <Button variant="outline" className="w-full">
                导出日志
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MobileNav />
    </div>
  )
}

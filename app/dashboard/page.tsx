'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Sidebar, TopBar, MobileNav } from '@/components/layout'
import { useAuthStore } from '@/lib/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { Activity, AlertCircle, Clock, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading,
}: {
  icon: any
  label: string
  value: string | number
  isLoading: boolean
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-2" />
          ) : (
            <p className="text-2xl font-bold mt-2">{value}</p>
          )}
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats(),
  })

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['chart-data'],
    queryFn: () => apiClient.getChartData(),
  })

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: () => apiClient.getLogs(),
  })

  if (!isAuthenticated) {
    return null
  }

  const recentLogs = logs?.slice(0, 5) || []

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />

      <main className="lg:ml-64 pt-20 pb-20 lg:pb-4 px-4 lg:px-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold">仪表盘</h1>
            <p className="text-muted-foreground mt-1">欢迎回来！查看您的机器人概览</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Zap}
              label="活跃命令"
              value={stats?.commands_today || 0}
              isLoading={statsLoading}
            />
            <StatCard
              icon={Users}
              label="活跃用户"
              value={stats?.active_users || 0}
              isLoading={statsLoading}
            />
            <StatCard
              icon={Activity}
              label="服务器数"
              value={stats?.server_count || 0}
              isLoading={statsLoading}
            />
            <StatCard
              icon={AlertCircle}
              label="错误率"
              value={stats?.error_rate || '0%'}
              isLoading={statsLoading}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-lg font-semibold mb-4">命令活动趋势</h2>
              {chartLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="commands"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      name="命令数"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Stats Card */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">系统状态</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">运行时间</span>
                    <Badge variant="outline">{stats?.uptime}</Badge>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">响应时间</span>
                    <Badge variant="outline">{stats?.response_time}</Badge>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">错误率</span>
                    <Badge variant={parseInt(stats?.error_rate || '0') > 5 ? 'destructive' : 'default'}>
                      {stats?.error_rate}
                    </Badge>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">快捷操作</p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      + 新增自动回复
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      + 创建命令规则
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">最近活动</h2>
            {logsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-medium">{log.guild_name}</p>
                        <p className="text-xs text-muted-foreground">{log.type}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('zh-CN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

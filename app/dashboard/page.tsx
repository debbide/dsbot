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
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Activity, AlertCircle, ArrowUpRight, Clock, Server, TrendingUp, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  isLoading,
  className,
}: {
  icon: any
  label: string
  value: string | number
  trend?: 'up' | 'down'
  trendLabel?: string
  isLoading: boolean
  className?: string
}) {
  return (
    <Card className={cn("p-5 border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
              {trend && trendLabel && (
                <span className={cn(
                  "text-xs font-medium flex items-center gap-0.5",
                  trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                )}>
                  <TrendingUp className={cn("w-3 h-3", trend === 'down' && 'rotate-180')} />
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border/50 rounded-lg p-3 shadow-xl backdrop-blur-sm">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-foreground">{payload[0].value} 次命令</p>
      </div>
    )
  }
  return null
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

      <main className="lg:ml-64 pt-20 pb-20 lg:pb-6 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">仪表盘</h1>
              <p className="text-muted-foreground mt-1">机器人运行状态概览</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                运行中
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Zap}
              label="今日命令"
              value={stats?.commands_today?.toLocaleString() || '0'}
              trend="up"
              trendLabel="+12%"
              isLoading={statsLoading}
            />
            <StatCard
              icon={Users}
              label="活跃用户"
              value={stats?.active_users?.toLocaleString() || '0'}
              trend="up"
              trendLabel="+5%"
              isLoading={statsLoading}
            />
            <StatCard
              icon={Server}
              label="服务器数"
              value={stats?.server_count || '0'}
              isLoading={statsLoading}
            />
            <StatCard
              icon={AlertCircle}
              label="错误率"
              value={stats?.error_rate || '0%'}
              trend="down"
              trendLabel="-2%"
              isLoading={statsLoading}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <Card className="lg:col-span-2 border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">命令活动趋势</h2>
                    <p className="text-sm text-muted-foreground">最近 7 天命令使用统计</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    查看详情
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="p-6 pt-2">
                {chartLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCommands" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.65 0.2 285)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="oklch(0.65 0.2 285)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.015 285)" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="oklch(0.6 0.02 285)" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="oklch(0.6 0.02 285)" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="commands"
                        stroke="oklch(0.65 0.2 285)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCommands)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* System Status */}
            <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="p-6 border-b border-border/50">
                <h2 className="text-lg font-semibold text-foreground">系统状态</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Activity className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">运行时间</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{stats?.uptime || '99.9%'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">响应时间</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{stats?.response_time || '45ms'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      </div>
                      <span className="text-sm text-muted-foreground">错误率</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{stats?.error_rate || '0.1%'}</span>
                  </div>
                </div>
                
                <div className="pt-5 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-3">快捷操作</p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start bg-secondary/30 border-border/50 hover:bg-secondary/50"
                      onClick={() => router.push('/auto-reply')}
                    >
                      <span className="text-primary mr-2">+</span>
                      新增自动回复
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start bg-secondary/30 border-border/50 hover:bg-secondary/50"
                      onClick={() => router.push('/commands')}
                    >
                      <span className="text-primary mr-2">+</span>
                      创建命令规则
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">最近活动</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => router.push('/logs')}>
                  查看全部
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
            <div className="divide-y divide-border/50">
              {logsLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        log.type === 'command' ? 'bg-primary' :
                        log.type === 'error' ? 'bg-red-500' :
                        log.type === 'auto_reply' ? 'bg-emerald-500' : 'bg-muted-foreground'
                      )} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{log.guild_name}</p>
                        <p className="text-xs text-muted-foreground">{log.type === 'command' ? '命令执行' : log.type === 'auto_reply' ? '自动回复' : log.type}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground">暂无活动记录</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}

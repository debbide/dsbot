'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Search, Plus, Edit2, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

const commandSchema = z.object({
  name: z.string().min(1, '命令名不能为空'),
  description: z.string().min(1, '描述不能为空'),
  status: z.enum(['active', 'inactive']),
})

type CommandFormValues = z.infer<typeof commandSchema>

export default function CommandsPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const form = useForm<CommandFormValues>({
    resolver: zodResolver(commandSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
    },
  })

  const { data: commands, isLoading } = useQuery({
    queryKey: ['commands'],
    queryFn: () => apiClient.getCommands(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CommandFormValues) =>
      apiClient.createCommand({
        ...data,
        trigger_count: 0,
        updated_at: new Date().toISOString().split('T')[0],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] })
      toast.success('命令创建成功')
      setIsDialogOpen(false)
      form.reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: CommandFormValues) =>
      editingId
        ? apiClient.updateCommand(editingId, data)
        : Promise.reject('No command selected'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] })
      toast.success('命令更新成功')
      setIsDialogOpen(false)
      setEditingId(null)
      form.reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCommand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commands'] })
      toast.success('命令删除成功')
    },
  })

  if (!isAuthenticated) {
    return null
  }

  const filteredCommands = commands?.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleEdit = (command: any) => {
    form.setValue('name', command.name)
    form.setValue('description', command.description)
    form.setValue('status', command.status)
    setEditingId(command.id)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此命令吗？')) {
      deleteMutation.mutate(id)
    }
  }

  async function onSubmit(values: CommandFormValues) {
    if (editingId) {
      await updateMutation.mutateAsync(values)
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />

      <main className="lg:ml-64 pt-20 pb-20 lg:pb-4 px-4 lg:px-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">命令管理</h1>
              <p className="text-muted-foreground mt-1">管理机器人命令</p>
            </div>
            <Button onClick={() => { setEditingId(null); form.reset(); setIsDialogOpen(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              新建命令
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索命令..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Commands Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>命令名</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>触发次数</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredCommands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">没有找到命令</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCommands.map((cmd) => (
                    <TableRow key={cmd.id}>
                      <TableCell className="font-medium">{cmd.name}</TableCell>
                      <TableCell className="text-sm">{cmd.description}</TableCell>
                      <TableCell>
                        <Badge variant={cmd.status === 'active' ? 'default' : 'outline'}>
                          {cmd.status === 'active' ? '激活' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell>{cmd.trigger_count}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cmd.updated_at}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cmd)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cmd.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      {/* Command Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? '编辑命令' : '新建命令'}</DialogTitle>
            <DialogDescription>
              {editingId ? '修改命令配置' : '创建一个新的机器人命令'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>命令名</FormLabel>
                    <FormControl>
                      <Input placeholder="例如: ping" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Input placeholder="命令的用途" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full p-2 border border-input rounded-md">
                        <option value="active">激活</option>
                        <option value="inactive">禁用</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingId ? '更新' : '创建'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  取消
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <MobileNav />
    </div>
  )
}

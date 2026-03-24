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
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const autoReplySchema = z.object({
  keywords: z.string().min(1, '关键词不能为空'),
  match_type: z.enum(['exact', 'contains', 'regex']),
  reply: z.string().min(1, '回复内容不能为空'),
})

type AutoReplyFormValues = z.infer<typeof autoReplySchema>

export default function AutoReplyPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const form = useForm<AutoReplyFormValues>({
    resolver: zodResolver(autoReplySchema),
    defaultValues: {
      keywords: '',
      match_type: 'contains',
      reply: '',
    },
  })

  const { data: replies, isLoading } = useQuery({
    queryKey: ['auto-replies'],
    queryFn: () => apiClient.getAutoReplies(),
  })

  const createMutation = useMutation({
    mutationFn: (data: AutoReplyFormValues) =>
      apiClient.createAutoReply({
        keywords: data.keywords.split(',').map(k => k.trim()),
        match_type: data.match_type,
        reply: data.reply,
        enabled: true,
        priority: (replies?.length || 0) + 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-replies'] })
      toast.success('自动回复创建成功')
      setIsDialogOpen(false)
      form.reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: AutoReplyFormValues) =>
      editingId
        ? apiClient.updateAutoReply(editingId, {
            keywords: data.keywords.split(',').map(k => k.trim()),
            match_type: data.match_type,
            reply: data.reply,
          })
        : Promise.reject('No reply selected'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-replies'] })
      toast.success('自动回复更新成功')
      setIsDialogOpen(false)
      setEditingId(null)
      form.reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteAutoReply(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-replies'] })
      toast.success('自动回复删除成功')
    },
  })

  if (!isAuthenticated) {
    return null
  }

  const handleEdit = (reply: any) => {
    form.setValue('keywords', reply.keywords.join(', '))
    form.setValue('match_type', reply.match_type)
    form.setValue('reply', reply.reply)
    setEditingId(reply.id)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此自动回复吗？')) {
      deleteMutation.mutate(id)
    }
  }

  async function onSubmit(values: AutoReplyFormValues) {
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
              <h1 className="text-3xl font-bold">自动回复</h1>
              <p className="text-muted-foreground mt-1">设置关键词自动回复规则</p>
            </div>
            <Button onClick={() => { setEditingId(null); form.reset(); setIsDialogOpen(true) }}>
              <Plus className="w-4 h-4 mr-2" />
              新增规则
            </Button>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))
            ) : replies && replies.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">没有自动回复规则</p>
              </Card>
            ) : (
              replies?.map((reply) => (
                <Card key={reply.id} className="p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 text-muted-foreground cursor-grab">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Switch checked={reply.enabled} />
                        <div>
                          <p className="font-medium">
                            {reply.keywords.join(', ')}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {reply.match_type === 'exact' && '精确匹配'}
                              {reply.match_type === 'contains' && '包含匹配'}
                              {reply.match_type === 'regex' && '正则匹配'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              优先级: {reply.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded mt-2">
                        {reply.reply}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(reply)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reply.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? '编辑规则' : '新增规则'}</DialogTitle>
            <DialogDescription>
              {editingId ? '修改自动回复规则' : '创建新的自动回复规则'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>关键词（用逗号分隔）</FormLabel>
                    <FormControl>
                      <Input placeholder="例如: hi, hello, hey" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="match_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>匹配方式</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="exact">精确匹配</SelectItem>
                        <SelectItem value="contains">包含匹配</SelectItem>
                        <SelectItem value="regex">正则表达式</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>回复内容</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="输入自动回复的内容"
                        className="min-h-24"
                        {...field}
                      />
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

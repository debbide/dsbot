// Mock data and API layer for Discord Bot Control Panel
// This file contains all mock data and API endpoints
// Future: Replace with real API calls by updating this file

export interface Guild {
  id: string
  name: string
  icon?: string
  member_count: number
  enabled_modules: string[]
}

export interface Command {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive'
  trigger_count: number
  updated_at: string
}

export interface AutoReply {
  id: string
  keywords: string[]
  match_type: 'exact' | 'contains' | 'regex'
  reply: string
  enabled: boolean
  priority: number
}

export interface LogEntry {
  id: string
  timestamp: string
  type: 'command' | 'auto_reply' | 'error' | 'member_join' | 'member_leave'
  guild_id: string
  guild_name: string
  message?: string
  details?: Record<string, any>
}

// Mock Guilds
const mockGuilds: Guild[] = [
  {
    id: '123456789',
    name: 'My Gaming Community',
    member_count: 1250,
    enabled_modules: ['welcome', 'auto_reply', 'logging'],
  },
  {
    id: '987654321',
    name: 'Development Server',
    member_count: 45,
    enabled_modules: ['commands', 'logging'],
  },
  {
    id: '555555555',
    name: 'Support Hub',
    member_count: 3200,
    enabled_modules: ['auto_reply', 'logging', 'welcome'],
  },
]

// Mock Commands
const mockCommands: Command[] = [
  { id: '1', name: 'ping', description: '检查机器人是否在线', status: 'active', trigger_count: 1250, updated_at: '2024-03-15' },
  { id: '2', name: 'help', description: '获取帮助信息', status: 'active', trigger_count: 890, updated_at: '2024-03-14' },
  { id: '3', name: 'stats', description: '显示服务器统计数据', status: 'active', trigger_count: 450, updated_at: '2024-03-13' },
  { id: '4', name: 'warn', description: '警告用户', status: 'active', trigger_count: 120, updated_at: '2024-03-12' },
  { id: '5', name: 'ban', description: '封禁用户', status: 'active', trigger_count: 45, updated_at: '2024-03-11' },
  { id: '6', name: 'mute', description: '禁言用户', status: 'inactive', trigger_count: 80, updated_at: '2024-03-10' },
]

// Mock Auto Replies
const mockAutoReplies: AutoReply[] = [
  {
    id: '1',
    keywords: ['hi', 'hello', 'hey'],
    match_type: 'exact',
    reply: '你好！有什么我可以帮助的吗？',
    enabled: true,
    priority: 1,
  },
  {
    id: '2',
    keywords: ['thanks', 'thank you'],
    match_type: 'contains',
    reply: '不客气！很高兴为您服务。',
    enabled: true,
    priority: 2,
  },
  {
    id: '3',
    keywords: ['rules'],
    match_type: 'exact',
    reply: '请查看 #rules 频道获取服务器规则。',
    enabled: true,
    priority: 1,
  },
]

// Mock Logs
const generateMockLogs = (): LogEntry[] => {
  const types: LogEntry['type'][] = ['command', 'auto_reply', 'error', 'member_join', 'member_leave']
  const logs: LogEntry[] = []
  
  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const guildIndex = Math.floor(Math.random() * mockGuilds.length)
    const guild = mockGuilds[guildIndex]
    
    logs.push({
      id: `log-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      type,
      guild_id: guild.id,
      guild_name: guild.name,
      message: `${type} event occurred`,
      details: {
        user: `user_${Math.floor(Math.random() * 1000)}`,
        action: type,
      },
    })
  }
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// API Functions
export const apiClient = {
  // Guilds
  getGuilds: async (): Promise<Guild[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockGuilds
  },
  
  getGuild: async (id: string): Promise<Guild | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockGuilds.find(g => g.id === id) || null
  },
  
  updateGuild: async (id: string, data: Partial<Guild>): Promise<Guild> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const guild = mockGuilds.find(g => g.id === id)
    if (guild) {
      Object.assign(guild, data)
    }
    return guild || mockGuilds[0]
  },
  
  // Commands
  getCommands: async (): Promise<Command[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockCommands
  },
  
  getCommand: async (id: string): Promise<Command | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockCommands.find(c => c.id === id) || null
  },
  
  createCommand: async (data: Omit<Command, 'id'>): Promise<Command> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newCommand: Command = { id: `cmd-${Date.now()}`, ...data }
    mockCommands.push(newCommand)
    return newCommand
  },
  
  updateCommand: async (id: string, data: Partial<Command>): Promise<Command> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const command = mockCommands.find(c => c.id === id)
    if (command) {
      Object.assign(command, data)
    }
    return command || mockCommands[0]
  },
  
  deleteCommand: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = mockCommands.findIndex(c => c.id === id)
    if (index > -1) {
      mockCommands.splice(index, 1)
    }
  },
  
  // Auto Replies
  getAutoReplies: async (): Promise<AutoReply[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockAutoReplies
  },
  
  createAutoReply: async (data: Omit<AutoReply, 'id'>): Promise<AutoReply> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newReply: AutoReply = { id: `reply-${Date.now()}`, ...data }
    mockAutoReplies.push(newReply)
    return newReply
  },
  
  updateAutoReply: async (id: string, data: Partial<AutoReply>): Promise<AutoReply> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const reply = mockAutoReplies.find(r => r.id === id)
    if (reply) {
      Object.assign(reply, data)
    }
    return reply || mockAutoReplies[0]
  },
  
  deleteAutoReply: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = mockAutoReplies.findIndex(r => r.id === id)
    if (index > -1) {
      mockAutoReplies.splice(index, 1)
    }
  },
  
  // Logs
  getLogs: async (): Promise<LogEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return generateMockLogs()
  },
  
  // Dashboard Stats
  getDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      server_count: mockGuilds.length,
      active_users: Math.floor(Math.random() * 5000) + 1000,
      commands_today: Math.floor(Math.random() * 10000) + 5000,
      error_rate: (Math.random() * 5).toFixed(2) + '%',
      uptime: '99.98%',
      response_time: Math.floor(Math.random() * 100) + 50 + 'ms',
    }
  },
  
  // Chart data
  getChartData: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return [
      { date: '03-19', commands: 2400, errors: 24 },
      { date: '03-20', commands: 3210, errors: 13 },
      { date: '03-21', commands: 2290, errors: 20 },
      { date: '03-22', commands: 2000, errors: 18 },
      { date: '03-23', commands: 2500, errors: 22 },
      { date: '03-24', commands: 3100, errors: 15 },
      { date: '03-25', commands: 2400, errors: 10 },
    ]
  },
}

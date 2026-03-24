# Discord Bot Control Panel

这是一个现代化的 Discord 机器人控制面板，提供完整的前端 UI 和交互逻辑，带有 API 占位层准备集成真实后端。

## 项目特点

- 🎨 **深色科技风设计** - Discord 品牌调性的现代化 UI
- ⚡ **完整的前端功能** - 所有页面均已实现
- 📊 **数据可视化** - 使用 Recharts 进行图表展示
- 🔐 **模拟认证系统** - 完整的登录流程
- 📱 **响应式设计** - 支持桌面和移动设备
- ♿ **无障碍支持** - 完整的 ARIA 属性和键盘导航
- 🌙 **深色/浅色主题** - 全站主题切换支持

## 技术栈

- **前端框架**: Next.js 16.2.0 (React 19.2.4)
- **样式**: Tailwind CSS 4.2.0
- **UI 组件**: shadcn/ui
- **状态管理**: Zustand
- **数据获取**: TanStack Query
- **表单**: React Hook Form + Zod
- **图表**: Recharts
- **图标**: Lucide React

## 项目结构

```
├── app/
│   ├── layout.tsx                    # 根布局
│   ├── page.tsx                      # 首页（重定向）
│   ├── globals.css                   # 全局样式
│   ├── login/
│   │   └── page.tsx                  # 登录页
│   ├── dashboard/
│   │   └── page.tsx                  # 仪表盘
│   ├── servers/
│   │   └── page.tsx                  # 服务器管理
│   ├── commands/
│   │   └── page.tsx                  # 命令管理
│   ├── auto-reply/
│   │   └── page.tsx                  # 自动回复
│   ├── logs/
│   │   └── page.tsx                  # 日志中心
│   └── settings/
│       └── page.tsx                  # 设置页
├── components/
│   ├── layout.tsx                    # 侧边栏和顶栏
│   └── ui/                           # shadcn/ui 组件库
├── lib/
│   ├── auth-store.ts                 # Zustand 认证存储
│   ├── api-client.ts                 # API 客户端和 mock 数据
│   ├── query-provider.tsx            # React Query 配置
│   └── utils.ts                      # 工具函数
├── hooks/
│   └── use-mobile.ts                 # 移动端检测 hook
└── public/                           # 静态资源
```

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 在浏览器中查看。

### 构建生产版本

```bash
npm run build
npm start
```

## 默认登录凭证

- **邮箱**: admin@example.com
- **密码**: password123

## 页面说明

### 1. 登录页 (`/login`)
- 邮箱和密码表单验证
- 记住我功能
- 忘记密码链接占位
- 演示账户提示

### 2. 仪表盘 (`/dashboard`)
- 4 个统计卡片（活跃命令、活跃用户、服务器数、错误率）
- 命令活动趋势图表
- 系统状态面板
- 最近活动列表

### 3. 服务器管理 (`/servers`)
- 服务器网格展示
- 搜索功能
- 服务器详情弹窗
- 模块开关配置

### 4. 命令管理 (`/commands`)
- 命令列表表格
- 新建/编辑/删除命令
- 状态切换
- 搜索和筛选

### 5. 自动回复 (`/auto-reply`)
- 关键词规则管理
- 匹配方式选择（精确/包含/正则）
- 优先级排序
- 启用/禁用开关

### 6. 日志中心 (`/logs`)
- 日志表格展示
- 多种日志类型筛选
- 日志详情查看
- 导出功能占位

### 7. 设置页 (`/settings`)
- **机器人设置**: 名称、前缀、API 密钥
- **通知设置**: 邮件和站内通知选项
- **账户设置**: 个人信息、修改密码、登出

## 状态管理

### Zustand 存储 (`lib/auth-store.ts`)
- `user`: 当前登录用户信息
- `isAuthenticated`: 认证状态
- `login()`: 登录方法
- `logout()`: 登出方法
- `setUser()`: 设置用户信息

### React Query
- 自动缓存数据
- 后台数据同步
- 错误处理
- 加载状态管理

## API 集成指南

### 从 Mock 切换到真实 API

所有 API 调用都集中在 `/lib/api-client.ts` 中。要集成真实后端：

1. **替换 API 端点**

```typescript
// 当前 (mock)
export const apiClient = {
  getGuilds: async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockGuilds
  }
}

// 替换为真实 API
export const apiClient = {
  getGuilds: async () => {
    const response = await fetch(`${process.env.VITE_API_BASE_URL}/guilds`)
    return response.json()
  }
}
```

2. **更新环境变量**

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

3. **保持接口一致性**

确保后端返回的数据结构与类型定义匹配。

## 后端接口期望

### 认证
- `POST /auth/login` - 用户登录
- `POST /auth/logout` - 用户登出
- `POST /auth/refresh` - 刷新 token

### 服务器
- `GET /guilds` - 获取服务器列表
- `GET /guilds/:id` - 获取服务器详情
- `PUT /guilds/:id` - 更新服务器配置

### 命令
- `GET /commands` - 获取命令列表
- `POST /commands` - 创建命令
- `PUT /commands/:id` - 更新命令
- `DELETE /commands/:id` - 删除命令

### 自动回复
- `GET /auto-replies` - 获取自动回复列表
- `POST /auto-replies` - 创建自动回复
- `PUT /auto-replies/:id` - 更新自动回复
- `DELETE /auto-replies/:id` - 删除自动回复

### 日志
- `GET /logs` - 获取日志列表（支持筛选）

### 统计
- `GET /stats` - 获取仪表盘统计数据
- `GET /chart-data` - 获取图表数据

## 代码规范

- TypeScript 类型完善
- 使用 ESLint 进行代码检查
- React Hook Form 进行表单处理
- Zod 进行数据验证
- 组件化和模块化设计

## 可访问性

- ✅ ARIA 标签和角色
- ✅ 键盘导航支持
- ✅ 屏幕阅读器支持
- ✅ 焦点管理
- ✅ 对比度符合 WCAG 2.1

## 响应式设计

- 📱 移动优先设计
- 🖥️ 响应式断点 (md, lg)
- 📊 适配各种屏幕大小
- 🎯 顶部导航 + 侧边栏（桌面）
- 🎯 底部导航（移动设备）

## 环境变量

```env
# API 基础 URL (可选)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## 部署

### Vercel (推荐)

```bash
# 连接 GitHub 仓库后自动部署
vercel deploy
```

### 其他平台

```bash
# 构建
npm run build

# 启动
npm start
```

## 常见问题

### Q: 数据是否保存到数据库？
A: 不，当前使用的是 mock 数据。切换到真实 API 后，所有数据将持久化到后端。

### Q: 如何添加新页面？
A: 在 `app/` 目录下创建新文件夹，添加 `page.tsx`，然后在 `components/layout.tsx` 中更新导航。

### Q: 如何修改主题？
A: 编辑 `app/globals.css` 中的 CSS 变量来自定义颜色主题。

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

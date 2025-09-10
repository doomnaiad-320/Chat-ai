# 角色卡后端管理系统方案（v1）

## 背景
- 当前项目为基于 Vite + React + TS 的前端应用，角色数据存储在浏览器 IndexedDB（`idb-keyval`）中，未有后端。
- 目标是在不打断现有前端开发的前提下，引入一个“角色卡后端管理”服务，提供角色卡的增删改查和面向前端的只读查询/导入能力。

## 目标
- 提供稳定的角色卡数据源（后端角色库）。
- 提供管理端 API：角色卡的创建、编辑、发布/归档、删除、批量操作、上传头像。
- 提供前端可用的只读 API：列表、详情、导出为前端 `Character` 结构，用于导入到 IndexedDB。
- 提供查询（搜索/分页/排序/过滤）、基础权限校验、审计字段（创建/更新时间）。
- 保持最小可用：本地用 SQLite，生产建议 PostgreSQL；接口稳定且可扩展。

## 非目标
- 不实现复杂多租户/组织与 RBAC（v1 使用管理密钥/Basic Auth 即可）。
- 不改变前端当前的本地存储模型（前端仍将导入后写入 IndexedDB）。
- 不处理大规模图片/CDN（v1 先用文件或 base64，后续可外挂对象存储）。

## 总体架构
- 形态：本仓库内新增 `server/` 服务（Node.js + TypeScript）。
- 前后端通信：RESTful JSON，前端开发时通过 Vite 代理 `/api` 到后端端口。
- 数据库：Prisma ORM；本地 SQLite，生产 PostgreSQL。
- 部署：容器化可选；提供健康检查与简单日志。

目录结构建议：
```
server/
  src/
    app.ts              # 启动与全局中间件
    routes/
      public.roles.ts   # 面向前端（只读）
      admin.roles.ts    # 管理端（需认证）
      health.ts
    modules/
      roles/
        service.ts
        repo.ts
        mapper.ts       # 后端模型 -> 前端 Character 的映射
    schemas/
      roles.ts          # Zod 校验
    utils/
      auth.ts           # 管理端认证（API Key / Basic）
      errors.ts
  prisma/
    schema.prisma
  .env.example
```

## 技术选型
- 运行时与框架：Node.js + Fastify（轻量高性能）或 NestJS（工程化）。v1 推荐 Fastify + Zod + Prisma，减少样板代码。
- ORM：Prisma（迁移、类型良好、开发友好）。
- 数据库：开发用 SQLite；生产推荐 PostgreSQL。
- 校验：Zod（请求体验证与错误提示）。
- 鉴权：管理端使用 `x-admin-key`（环境变量），后续可平滑升级 JWT/OAuth。

## 数据模型（后端）
实体：`RoleCard`
- id: string（uuid）
- name: string（≤ 50）
- gender: enum['male','female','other']
- avatarUrl: string | null（支持 base64 或静态资源路径）
- likes: string
- dislikes: string
- background: string（长文本）
- voiceStyle: enum['cute','serious','humorous','gentle','energetic']
- status: enum['draft','published','archived']（默认 draft）
- tags: string[]（可选）
- version: int（默认 1）
- author: string | null
- source: string | null（导入来源标识）
- createdAt: Date
- updatedAt: Date

索引建议：
- `status + updatedAt`（列表/筛选）
- `name`（模糊查询）
- `tags`（数组包含查询，按数据库能力实现）

前端字段（与现有代码一致）：
```ts
// src/types/index.ts
export interface Character {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  likes: string;
  dislikes: string;
  background: string;
  voiceStyle: 'cute' | 'serious' | 'humorous' | 'gentle' | 'energetic';
  createdAt: Date;
  updatedAt: Date;
}
```

映射关系：
- `avatar <- avatarUrl`，其余字段同名。
- `createdAt/updatedAt`：API 传输层无法直接传递 Date 对象。为与前端 `addCharacter` 对接无缝，推荐导出“草稿形态”（不含 id/时间），由前端在写入 IndexedDB 时生成 `id/createdAt/updatedAt`（与当前 `useCharacterStore.addCharacter` 一致）。

## API 设计
统一响应：
```
{
  "success": boolean,
  "data"?: any,
  "error"?: string,
  "message"?: string
}
```

认证：
- 管理端路由需 Header：`x-admin-key: <ENV.ADMIN_KEY>`。
- 公共只读路由无需认证，启用 CORS + 限流。

公共（前端只读）
- GET `/api/roles`
  - 查询参数：`q`（搜索 name/likes/background），`tag`，`gender`，`page`，`pageSize`，`sort`（`updatedAt:desc` 等）
  - 仅返回 `status=published` 的角色卡
  - 返回：分页数据 `{ items, page, pageSize, total }`
- GET `/api/roles/:id`
  - 仅 `published`
- GET `/api/roles/:id/export`
  - 默认导出为前端“草稿形态”（见下），字段集合精确匹配 `addCharacter` 需要的参数：
    `{ name, gender, avatar?, likes, dislikes, background, voiceStyle }`
- POST `/api/roles/export:batch`
  - `body: { ids: string[] }`，返回上述“草稿形态”数组，便于批量导入
- （可选）GET `/api/roles/:id/exportFull`
  - 返回完整 `CharacterDTO`（含 `id/createdAt/updatedAt`，其中时间为 ISO 字符串），适用于需要保留后端 id 的场景；前端导入时应映射/转换为 `Date`

管理端（需认证）
- GET `/admin/roles`
  - 查询参数同上，但可查看 `draft|published|archived`
- POST `/admin/roles`
  - 创建角色卡（默认 `draft`），Zod 校验
- PUT `/admin/roles/:id`
  - 全量更新
- PATCH `/admin/roles/:id`
  - 部分更新
- PATCH `/admin/roles/:id/publish`
  - 置为 `published`
- PATCH `/admin/roles/:id/archive`
  - 置为 `archived`
- POST `/admin/roles/:id/duplicate`
  - 复制一个草稿版本（`version+1` 可选）
- DELETE `/admin/roles/:id`
  - 软删或硬删（v1 先硬删，可在 schema 中留 `deletedAt` 以便后续软删）
- PUT `/admin/roles/:id/avatar`
  - 上传头像（`multipart/form-data` 或 base64 JSON）

错误码建议（示例）：
- 400：`VALIDATION_FAILED`（Zod 错误对象）
- 401：`UNAUTHORIZED`
- 403：`FORBIDDEN`
- 404：`NOT_FOUND`
- 409：`CONFLICT`
- 429：`RATE_LIMITED`
- 500：`INTERNAL_ERROR`

## 导入/导出与前端对接
前端导入流程（推荐最简 v1）：
1. 前端调用 `GET /api/roles` 列表，用户选择目标角色。
2. 前端调用 `GET /api/roles/:id/export` 获取“草稿形态”，字段正好可传入 `useCharacterStore.addCharacter`。
3. 写入 IndexedDB（`addCharacter` 会自动生成 `id/createdAt/updatedAt`）。
4. （可选）支持批量导入：`POST /api/roles/export:batch` 一次获取多个 `Character`。

类型映射
- 后端在 `mapper.ts` 提供两种映射：
  - `toCharacterDraft(roleCard)` -> `{ name, gender, avatar?, likes, dislikes, background, voiceStyle }`
  - `toCharacterDTO(roleCard)` -> `{ id, name, gender, avatar?, likes, dislikes, background, voiceStyle, createdAt: ISO, updatedAt: ISO }`

开发代理
- Vite 开发代理：将 `/api` 代理到 `http://localhost:8787`（或 `.env` 指定）。

## 校验与安全
- 输入：所有写入接口使用 Zod 校验，限制长度、必填、枚举。
- 限流：公共 GET 接口按 IP 限速（例如 60 rpm）。
- CORS：允许前端站点域名；本地调试允许 `http://localhost:5173`。
- 认证：管理端使用 `x-admin-key`；Rotate Key 建议。
- 审计：保留 `createdAt/updatedAt`；后续可加 `createdBy/updatedBy`。

## 迁移与种子数据
- 使用 Prisma Migrate 管理 schema。
- 提供 `prisma/seed.ts`：初始化 3～5 个示例角色（`draft` 与 `published` 混合）。

## 日志与运维
- 健康检查：`GET /healthz` 返回 `{ ok: true, uptime }`。
- 日志：按访问日志、错误日志区分，生产建议 JSON 结构化输出（pino）。
- 环境变量：
  - `DATABASE_URL`（必需）
  - `ADMIN_KEY`（必需）
  - `PORT`（默认 8787）
  - `CORS_ORIGINS`（逗号分隔）

## 测试计划
- 单元测试：服务层与映射层（字段映射、验证）。
- 接口测试：对核心路由做 Supertest 覆盖（CRUD、权限、分页/搜索）。
- 契约测试：导出 `Character` 结构与前端类型对齐。

## 里程碑（建议）
- M1（0.5 天）：初始化后端骨架、Prisma schema、healthz。
- M2（1 天）：管理端 CRUD + 校验 + 分页/搜索。
- M3（0.5 天）：公共只读接口 + 导出映射。
- M4（0.5 天）：头像上传（base64）与限流/CORS/认证硬化。
- M5（0.5 天）：种子数据、文档与前端对接说明、Vite 代理。

## 风险与对策
- 字段演进：通过映射层松耦合（后端模型 ⟷ 前端 `Character`）。
- 前端本地存储差异：返回 Date/ISO 需与前端解析一致，必要时在导出端统一为 ISO 字符串。
- 图片存储：v1 简化为 base64 或静态目录，后续切换对象存储时仅更改 `avatarUrl` 生成逻辑。
- 认证升级：从 `x-admin-key` 平滑升级 JWT/OAuth，不破坏路由形态。

## 附录 A：示例 JSON
- 公共列表项（后端模型）
```json
{
  "id": "rc_123",
  "name": "可爱猫娘",
  "gender": "female",
  "avatarUrl": "/static/avatars/catgirl.png",
  "likes": "小鱼干、贴贴",
  "dislikes": "打雷",
  "background": "来自喵星的猫娘…",
  "voiceStyle": "cute",
  "status": "published",
  "tags": ["治愈", "萌"],
  "version": 1,
  "author": "admin",
  "createdAt": "2025-09-10T00:00:00.000Z",
  "updatedAt": "2025-09-10T00:00:00.000Z"
}
```

- 导出（默认，草稿形态，用于 `addCharacter`）
```json
{
  "name": "可爱猫娘",
  "gender": "female",
  "avatar": "/static/avatars/catgirl.png",
  "likes": "小鱼干、贴贴",
  "dislikes": "打雷",
  "background": "来自喵星的猫娘…",
  "voiceStyle": "cute"
}
```

- 导出（完整形态，`exportFull`，含时间为 ISO 字符串）
```json
{
  "id": "rc_123",
  "name": "可爱猫娘",
  "gender": "female",
  "avatar": "/static/avatars/catgirl.png",
  "likes": "小鱼干、贴贴",
  "dislikes": "打雷",
  "background": "来自喵星的猫娘…",
  "voiceStyle": "cute",
  "createdAt": "2025-09-10T00:00:00.000Z",
  "updatedAt": "2025-09-10T00:00:00.000Z"
}
```

## 附录 B：Prisma schema（摘要）
```prisma
model RoleCard {
  id         String   @id @default(uuid())
  name       String   @db.VarChar(50)
  gender     RoleGender
  avatarUrl  String?
  likes      String
  dislikes   String
  background String
  voiceStyle VoiceStyle
  status     RoleStatus @default(draft)
  tags       String[]
  version    Int       @default(1)
  author     String?
  source     String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([status, updatedAt])
  @@index([name])
}

enum RoleGender {
  male
  female
  other
}

enum VoiceStyle {
  cute
  serious
  humorous
  gentle
  energetic
}

enum RoleStatus {
  draft
  published
  archived
}
```

## 附录 C：Vite 代理（开发）
- 在 `vite.config.ts` 中新增：
```ts
server: {
  host: '0.0.0.0',
  port: 5173,
  strictPort: true,
  proxy: {
    '/api': {
      target: 'http://localhost:8787',
      changeOrigin: true,
    },
  },
}
```

---
如需我继续：
- 初始化 `server/` 目录与基本脚手架；
- 补充 OpenAPI/Swagger 文档；
- 在前端新增一个“从后端导入”入口（列表与导入按钮）。

% 前端功能方案：AI 写角色卡（v1）

## 背景与目标
- 在前端提供“AI 写角色卡”的能力，用户输入少量设定/关键词，AI 自动生成完整角色卡字段。
- 生成的结果严格匹配当前前端 `Character` 的字段与类型，并以 `useCharacterStore.addCharacter` 的入参（草稿形态）写入通讯录。
- 纯前端实现，不依赖后端；复用现有 AI 配置（OpenAI/Vercel AI SDK）。

## 非目标
- 不做长链路设定构建（世界观、人物关系网等）。
- 不做头像生成（v1 使用可选占位头像，或用户后续手动上传）。
- 不引入服务端代理（保留后续升级空间）。

## 字段契约（与现有前端一致）
- 生成目标：`CharacterDraft`
```ts
// addCharacter 的入参形态（草稿）：
// Omit<Character, 'id' | 'createdAt' | 'updatedAt'>
export type CharacterDraft = {
  name: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string; // 可为空
  likes: string;   // 简短文本
  dislikes: string;// 简短文本
  background: string; // 段落
  voiceStyle: 'cute' | 'serious' | 'humorous' | 'gentle' | 'energetic';
};
```
- 写入：调用 `useCharacterStore.addCharacter(draft)`，由 Store 生成 `id/createdAt/updatedAt`。

## 产品设计（UX）
- 入口位置（两种都可）：
  - 通讯录页顶部加按钮“AI 写角色卡”。
  - 角色表单 `CharacterForm` 中增加“AI 自动填充”按钮（可覆盖/合并现有输入）。
- 生成向导（建议新建 `AICharacterWizard` 弹窗）：
  - 基本输入：
    - 一句话设定 / 关键词（必填）
    - 性别（可选，默认“其他”）
    - 语音风格（可选，默认“可爱”）
    - 禁忌/喜好关键词（可选，辅助约束）
  - 操作按钮：
    - 生成、重生成（保留上次输入）、应用到表单、编辑后保存
  - 预览区：展示生成的 `name/gender/voiceStyle/likes/dislikes/background`
  - 合规提示：字段长度与枚举校验即时反馈
- 一键添加：将草稿填充至 `CharacterForm`，用户可再编辑后保存。

## 提示词与生成策略
- 首选方式：Vercel AI SDK `generateObject` + Zod Schema（强约束输出 JSON）。
- 备选方式：`generateText`/`sendMessage` + 严格提示“仅输出 JSON”，解析失败则自动重试一次。

### Zod Schema（用于 generateObject）
```ts
const CharacterDraftSchema = z.object({
  name: z.string().min(1).max(20),
  gender: z.enum(['male','female','other']).default('other'),
  avatar: z.string().url().optional().or(z.literal('')).transform(v => v || undefined),
  likes: z.string().min(1).max(60),
  dislikes: z.string().min(1).max(60),
  background: z.string().min(40).max(400),
  voiceStyle: z.enum(['cute','serious','humorous','gentle','energetic']).default('cute'),
});
```

### 系统提示词（示例）
- 角色：你是一个面向聊天应用的“角色卡生成器”。
- 目标：根据用户给定的少量线索，生成完整且一致的角色设定。
- 语言：使用简体中文。
- 约束：
  - name ≤ 20 字；likes/dislikes 各 ≤ 60 字；background 40–400 字。
  - gender 仅取 male/female/other；voiceStyle 仅取可用枚举。
  - likes/dislikes 用自然中文短语，避免项目符号/列表符号。
  - 输出为严格 JSON，不要输出额外文本或注释。

### 用户提示词拼装（示例）
```
【设定】{一句话设定/关键词}
【性别（可选）】{male/female/other}
【语气（可选）】{cute/serious/humorous/gentle/energetic}
【偏好关键词】{可选}
【禁忌关键词】{可选}

请基于以上线索补全角色卡字段，并满足长度与枚举约束，仅输出 JSON。
```

## 架构与模块
- 新增服务：`src/services/characterGenService.ts`
  - `generateCharacterDraft(input): Promise<CharacterDraft>`
  - 内部优先走 `ai` 的 `generateObject`，降级到 `generateText` 解析。
  - 统一校验：Zod 校验 + 本地约束裁剪（超长截断、空值修正）。
- 新增组件：`src/components/character/AICharacterWizard.tsx`
  - 收集输入、显示预览、触发生成/重生成/应用到表单。
  - 提示校验错误与 loading 状态。
- 集成点：
  - `ContactsPage` 顶部按钮；或 `CharacterForm` 内“AI 自动填充”。
- 复用能力：
  - `useCharacterStore.addCharacter` 写入 IndexedDB。
  - `useAppStore.showNotification` 反馈用户状态。

## 质量与合规
- 校验：Zod 严格检查字段与长度；不符合时提示并允许“重试生成”。
- 一致性：
  - gender/voiceStyle 若未显式选择，按默认值回退（`other/cute`）。
  - likes/dislikes 若过长，自动截断并提示。
- 安全：
  - 禁止注入代码与 URL；avatar 仅接受可选 URL（v1 默认不生成）。
  - 过滤明显不当内容关键字（可选，简单黑名单）。

## 交互流程（时序）
1) 用户打开“AI 写角色卡”
2) 填写一句话设定 + 可选性别/语气
3) 点击“生成” → 调用 `characterGenService.generateCharacterDraft`
4) 获得草稿 JSON → 预览 → 可“重生成”或“应用到表单”
5) 应用到 `CharacterForm` → 用户可微调 → 点击“创建角色”
6) Store 生成 `id/createdAt/updatedAt` → 加入通讯录

## 错误与重试策略
- 解析失败：自动重试 1 次；仍失败则提示用户并允许再次生成。
- 校验失败：给出具体字段错误与建议（如缩短 background）。
- AI 服务不可用：提示配置 AI API Key 或切换模型。

## 配置项（前端设置）
- 模型：沿用现有 AI 配置（OpenAI/Vercel AI）。
- 温度：默认 0.7，可在生成向导中调整（0.3–1.0）。
- 语言：固定 zh-CN。

## 开发任务拆解
- T1 组件：`AICharacterWizard`（UI、输入校验、预览，事件）
- T2 服务：`characterGenService`（提示词、生成、Zod 校验、降级解析）
- T3 集成：在 `ContactsPage` 和/或 `CharacterForm` 按钮入口与数据流对接
- T4 提示词打磨：根据体验调整长度与风格约束
- T5 验证：模拟 10 条输入样例，确保字段合法并与 `addCharacter` 流畅对接

## 验收标准（Definition of Done）
- 用户可在 2 步内从“一句话设定”生成角色卡并加入通讯录。
- 生成结果字段完全符合 `CharacterDraft`，不需手工修复即可保存。
- 错误处理明确：解析/校验失败均有可理解提示与可重试路径。
- 代码结构清晰，易于后续迁移到后端生成。

## 后续可迭代点
- 支持“多样化重生成”与“锁定字段不变”。
- 头像占位：首字母/渐变色；或对接轻量图片生成接口。
- 模板预设：二次元/科幻/职场等主题模板。
- 将生成过程搬到后端（稳定性与配额控制）。

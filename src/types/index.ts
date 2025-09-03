// 角色卡类型定义
export interface Character {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  likes: string[];
  dislikes: string[];
  background: string;
  voiceStyle: 'cute' | 'serious' | 'humorous' | 'gentle' | 'energetic';
  createdAt: Date;
  updatedAt: Date;
}

// 消息类型定义
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  characterId?: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  // AI回复拆分相关字段
  messageType?: 'text' | 'emoji' | 'voice' | 'quote' | 'inner_voice' | 'essay' | 'system' | 'narrator';
  shouldRetract?: boolean;
  retractDelay?: number;
  displayDelay?: number;
  originalSender?: string; // 用于多角色场景
}

// 对话会话类型定义
export interface Conversation {
  id: string;
  characterId: string;
  messages: Message[];
  lastMessageAt: Date;
  title?: string;
}

// API配置类型定义
export interface APIConfig {
  id: string;
  name: string;
  baseURL: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isDefault: boolean;
  createdAt: Date;
}

// 应用设置类型定义
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  enableAnimations: boolean;
  enableSounds: boolean;
  defaultAPIConfigId?: string;
}

// 全局Prompt配置
export interface GlobalPrompt {
  id: string;
  name: string;
  content: string;
  isActive: boolean;
  type: 'system' | 'personality' | 'style' | 'custom';
  priority: number; // 优先级，数字越大优先级越高
  createdAt: Date;
  updatedAt: Date;
}

// 语气词配置
export interface ToneConfig {
  cute: string[];
  gentle: string[];
  serious: string[];
  humorous: string[];
  energetic: string[];
}

// AI回复风格配置
export interface AIStyleConfig {
  useEmoji: boolean;
  maxSentences: number;
  useToneWords: boolean;
  conversationalStyle: boolean;
  characterConsistency: boolean;
}

// 标签页类型
export type TabType = 'messages' | 'contacts' | 'settings';

// 动画类型
export type AnimationType = 
  | 'bounce-gentle'
  | 'float'
  | 'pulse-soft'
  | 'wiggle'
  | 'heart-beat'
  | 'slide-up'
  | 'slide-down'
  | 'fade-in'
  | 'scale-in';

// 组件Props基础类型
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// 表单验证错误类型
export interface FormErrors {
  [key: string]: string | undefined;
}

// API响应类型
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 聊天API请求类型
export interface ChatRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model: string;
  temperature: number;
  max_tokens: number;
}

// 聊天API响应类型
export interface ChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

import OpenAI from 'openai';

// 临时 Character 类型定义（避免导入问题）
interface Character {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  likes: string[];
  dislikes: string[];
  background: string;
  personality?: string;
  voiceStyle: 'cute' | 'serious' | 'humorous' | 'gentle' | 'energetic';
  createdAt: Date;
  updatedAt: Date;
}

// AI 服务配置接口
export interface AIConfig {
  apiKey: string;
  baseURL?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// 消息接口
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

// AI 响应接口
export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
  finish_reason?: string;
}

// 流式响应回调
export type StreamCallback = (chunk: string, isComplete: boolean) => void;

class AIService {
  private client: OpenAI | null = null;
  private config: AIConfig | null = null;

  // 初始化 AI 服务
  initialize(config: AIConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      dangerouslyAllowBrowser: true, // 允许在浏览器中使用（注意：生产环境应该通过后端代理）
    });
  }

  // 检查是否已初始化
  isInitialized(): boolean {
    return this.client !== null && this.config !== null;
  }

  // 获取当前配置
  getConfig(): AIConfig | null {
    return this.config;
  }

  // 构建系统提示词
  private buildSystemPrompt(character: Character, globalPrompt?: string): string {
    const prompts: string[] = [];

    // 添加全局提示词
    if (globalPrompt?.trim()) {
      prompts.push(globalPrompt.trim());
    }

    // 添加角色基本信息
    prompts.push(`你是 ${character.name}，一个 ${character.gender === 'male' ? '男性' : '女性'} 角色。`);

    // 添加角色背景
    if (character.background?.trim()) {
      prompts.push(`背景信息：${character.background.trim()}`);
    }

    // 添加角色性格特征
    if (character.personality?.trim()) {
      prompts.push(`性格特征：${character.personality.trim()}`);
    }

    // 添加喜好
    if (character.likes && character.likes.length > 0) {
      prompts.push(`喜欢的事物：${character.likes.join('、')}`);
    }

    // 添加厌恶
    if (character.dislikes && character.dislikes.length > 0) {
      prompts.push(`不喜欢的事物：${character.dislikes.join('、')}`);
    }

    // 添加语音风格指导
    if (character.voiceStyle?.trim()) {
      prompts.push(`说话风格：${character.voiceStyle.trim()}`);
    }

    // 添加行为指导
    prompts.push('请始终保持角色设定，用符合角色性格的方式回应对话。');

    return prompts.join('\n\n');
  }

  // 发送聊天消息（非流式）
  async sendMessage(
    messages: ChatMessage[],
    character: Character,
    globalPrompt?: string
  ): Promise<AIResponse> {
    if (!this.isInitialized()) {
      throw new Error('AI 服务未初始化，请先配置 API 密钥');
    }

    try {
      // 构建完整的消息列表
      const systemPrompt = this.buildSystemPrompt(character, globalPrompt);
      const fullMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const completion = await this.client!.chat.completions.create({
        model: this.config!.model,
        messages: fullMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: this.config!.temperature || 0.7,
        max_tokens: this.config!.maxTokens || 2000,
      });

      const choice = completion.choices[0];
      if (!choice?.message?.content) {
        throw new Error('AI 响应为空');
      }

      return {
        content: choice.message.content,
        usage: completion.usage ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens,
        } : undefined,
        model: completion.model,
        finish_reason: choice.finish_reason || undefined,
      };
    } catch (error) {
      console.error('AI 服务错误:', error);
      if (error instanceof Error) {
        throw new Error(`AI 服务错误: ${error.message}`);
      }
      throw new Error('未知的 AI 服务错误');
    }
  }

  // 发送聊天消息（流式）
  async sendMessageStream(
    messages: ChatMessage[],
    character: Character,
    onChunk: StreamCallback,
    globalPrompt?: string
  ): Promise<void> {
    if (!this.isInitialized()) {
      throw new Error('AI 服务未初始化，请先配置 API 密钥');
    }

    try {
      // 构建完整的消息列表
      const systemPrompt = this.buildSystemPrompt(character, globalPrompt);
      const fullMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const stream = await this.client!.chat.completions.create({
        model: this.config!.model,
        messages: fullMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: this.config!.temperature || 0.7,
        max_tokens: this.config!.maxTokens || 2000,
        stream: true,
      });

      let fullContent = '';
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullContent += delta;
          onChunk(delta, false);
        }
      }

      // 标记完成
      onChunk('', true);
    } catch (error) {
      console.error('AI 流式服务错误:', error);
      if (error instanceof Error) {
        throw new Error(`AI 流式服务错误: ${error.message}`);
      }
      throw new Error('未知的 AI 流式服务错误');
    }
  }

  // 测试 API 连接
  async testConnection(): Promise<boolean> {
    if (!this.isInitialized()) {
      return false;
    }

    try {
      const response = await this.client!.chat.completions.create({
        model: this.config!.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      });

      return response.choices.length > 0;
    } catch (error) {
      console.error('API 连接测试失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const aiService = new AIService();

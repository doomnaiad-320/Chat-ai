import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { Character, APIConfig, GlobalPrompt } from '../types';

export interface VercelAIConfig {
  apiKey: string;
  baseURL?: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class VercelAIService {
  private config: VercelAIConfig | null = null;

  // 初始化配置
  initialize(config: VercelAIConfig) {
    this.config = config;
  }

  // 检查是否已配置
  isConfigured(): boolean {
    return this.config !== null;
  }

  // 构建系统提示词（复用现有逻辑）
  private buildSystemPrompt(character: Character, globalPrompts?: GlobalPrompt[]): string {
    let systemPrompt = '';
    
    // 添加全局提示词（按优先级排序）
    if (globalPrompts && globalPrompts.length > 0) {
      const activePrompts = globalPrompts
        .filter(prompt => prompt.isActive)
        .sort((a, b) => b.priority - a.priority);
      
      for (const prompt of activePrompts) {
        systemPrompt += prompt.content + '\n\n';
      }
    }
    
    // 添加角色专属提示词
    const voiceStyleMap = {
      cute: '可爱',
      serious: '严肃', 
      humorous: '幽默',
      gentle: '温柔',
      energetic: '活泼'
    };
    
    const genderMap = {
      male: '男',
      female: '女',
      other: '其他'
    };
    
    const characterPrompt = `你现在是${character.name}，性别${genderMap[character.gender]}，喜欢${character.likes}，讨厌${character.dislikes}。

背景故事：${character.background}

请完全沉浸在这个角色中，用${voiceStyleMap[character.voiceStyle] || '自然'}的语气与我对话。
保持角色一致性，不要跳出角色设定。`;

    systemPrompt += characterPrompt;
    
    return systemPrompt;
  }

  // 发送聊天消息（非流式）
  async sendMessage(
    messages: AIMessage[],
    character: Character,
    globalPrompts?: GlobalPrompt[],
    signal?: AbortSignal
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('AI服务未配置');
    }

    try {
      // 构建完整的消息列表
      const systemPrompt = this.buildSystemPrompt(character, globalPrompts);
      const fullMessages: AIMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const { text } = await generateText({
        model: openai(this.config!.model, {
          apiKey: this.config!.apiKey,
          baseURL: this.config!.baseURL,
        }),
        messages: fullMessages,
        temperature: this.config!.temperature,
        maxTokens: this.config!.maxTokens,
        abortSignal: signal,
      });

      return text;
    } catch (error) {
      console.error('Vercel AI服务错误:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('请求超时或被取消');
        }
        throw new Error(`AI服务错误: ${error.message}`);
      }
      throw new Error('未知的AI服务错误');
    }
  }

  // 发送聊天消息（流式）
  async sendMessageStream(
    messages: AIMessage[],
    character: Character,
    onChunk: (chunk: string) => void,
    globalPrompts?: GlobalPrompt[],
    signal?: AbortSignal
  ): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('AI服务未配置');
    }

    try {
      // 构建完整的消息列表
      const systemPrompt = this.buildSystemPrompt(character, globalPrompts);
      const fullMessages: AIMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const { textStream } = await streamText({
        model: openai(this.config!.model, {
          apiKey: this.config!.apiKey,
          baseURL: this.config!.baseURL,
        }),
        messages: fullMessages,
        temperature: this.config!.temperature,
        maxTokens: this.config!.maxTokens,
        abortSignal: signal,
      });

      for await (const delta of textStream) {
        onChunk(delta);
      }
    } catch (error) {
      console.error('Vercel AI流式服务错误:', error);
      if (error instanceof Error) {
        throw new Error(`AI流式服务错误: ${error.message}`);
      }
      throw new Error('未知的AI流式服务错误');
    }
  }

  // 测试连接
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const { text } = await generateText({
        model: openai(this.config!.model, {
          apiKey: this.config!.apiKey,
          baseURL: this.config!.baseURL,
        }),
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 10,
      });

      return text.length > 0;
    } catch (error) {
      console.error('连接测试失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const vercelAIService = new VercelAIService();

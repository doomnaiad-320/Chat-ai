import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { vercelAIService } from '../services/vercelAIService';
import type { Character, APIConfig, GlobalPrompt } from '../types';

// 将APIConfig转换为VercelAIConfig
const convertToVercelConfig = (apiConfig: APIConfig) => ({
  apiKey: apiConfig.apiKey,
  baseURL: apiConfig.baseURL === 'https://api.openai.com/v1' ? undefined : apiConfig.baseURL,
  model: apiConfig.model,
  temperature: apiConfig.temperature,
  maxTokens: apiConfig.maxTokens,
});

// 增强版发送聊天请求函数
export const sendChatRequestWithVercel = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  apiConfig: APIConfig,
  character: Character,
  globalPrompts?: GlobalPrompt[],
  signal?: AbortSignal
): Promise<string> => {
  // 初始化Vercel AI服务
  const vercelConfig = convertToVercelConfig(apiConfig);
  vercelAIService.initialize(vercelConfig);

  // 过滤掉system消息，因为会在服务内部重新构建
  const userMessages = messages.filter(msg => msg.role !== 'system');

  return await vercelAIService.sendMessage(
    userMessages,
    character,
    globalPrompts,
    signal
  );
};

// 兼容性包装函数（保持原有接口）
export const sendChatRequestCompatible = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  apiConfig: APIConfig,
  signal?: AbortSignal
): Promise<string> => {
  // 这个函数保持与原API完全相同的接口
  // 但内部使用Vercel AI SDK
  
  const vercelConfig = convertToVercelConfig(apiConfig);

  try {
    const { text } = await generateText({
      model: createOpenAI({
        apiKey: vercelConfig.apiKey,
        baseURL: vercelConfig.baseURL,
      })(vercelConfig.model),
      messages: messages,
      temperature: vercelConfig.temperature,
      abortSignal: signal,
    });

    return text;
  } catch (error) {
    console.error('Vercel AI兼容性调用错误:', error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时或被取消');
      }
      throw new Error(`AI服务错误: ${error.message}`);
    }
    throw new Error('未知的AI服务错误');
  }
};

// 流式发送聊天请求函数
export const sendChatRequestStreamWithVercel = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  character: Character,
  apiConfig: APIConfig,
  onChunk: (chunk: string) => void,
  globalPrompts?: GlobalPrompt[],
  signal?: AbortSignal
): Promise<void> => {
  // 初始化Vercel AI服务
  const vercelConfig = convertToVercelConfig(apiConfig);
  vercelAIService.initialize(vercelConfig);

  // 过滤掉system消息，因为会在服务内部重新构建
  const userMessages = messages.filter(msg => msg.role !== 'system');

  return await vercelAIService.sendMessageStream(
    userMessages,
    character,
    onChunk,
    globalPrompts,
    signal
  );
};

// 测试API连接
export const testAPIConnectionWithVercel = async (apiConfig: APIConfig): Promise<{ success: boolean; error?: string }> => {
  try {
    const vercelConfig = convertToVercelConfig(apiConfig);
    vercelAIService.initialize(vercelConfig);
    
    const success = await vercelAIService.testConnection();
    return { success };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '连接测试失败' 
    };
  }
};

// 获取可用模型列表（使用Vercel AI SDK）
export const fetchAvailableModelsWithVercel = async (apiConfig: { baseURL: string; apiKey: string }): Promise<string[]> => {
  try {
    // 对于OpenAI兼容的API，我们可以直接返回常见模型
    // Vercel AI SDK会在运行时验证模型是否可用
    const commonModels = [
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4o',
      'gpt-4o-mini'
    ];

    // 如果是非标准baseURL，可能是其他提供商
    if (apiConfig.baseURL && !apiConfig.baseURL.includes('openai.com')) {
      return [
        ...commonModels,
        'claude-3-sonnet',
        'claude-3-opus',
        'claude-3-haiku',
        'claude-3-5-sonnet'
      ];
    }

    return commonModels;
  } catch (error) {
    console.warn('获取模型列表失败，使用默认模型:', error);
    return [
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4o'
    ];
  }
};

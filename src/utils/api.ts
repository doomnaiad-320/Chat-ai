import type { ChatRequest, ChatResponse, APIConfig, Character, GlobalPrompt } from '../types/index';

// API请求基础配置
const DEFAULT_TIMEOUT = 30000; // 30秒超时

// 构建聊天请求的系统提示词
export const buildSystemPrompt = (character: Character, globalPrompt?: GlobalPrompt): string => {
  let systemPrompt = '';
  
  // 添加全局提示词
  if (globalPrompt && globalPrompt.isActive) {
    systemPrompt += globalPrompt.content + '\n\n';
  }
  
  // 添加角色专属提示词
  const characterPrompt = `你现在是${character.name}，性别${character.gender === 'male' ? '男' : character.gender === 'female' ? '女' : '其他'}，喜欢${character.likes.join('、')}，讨厌${character.dislikes.join('、')}。

背景故事：${character.background}

请完全沉浸在这个角色中，用${character.voiceStyle === 'cute' ? '可爱' : character.voiceStyle === 'serious' ? '严肃' : character.voiceStyle === 'humorous' ? '幽默' : character.voiceStyle === 'gentle' ? '温柔' : '活泼'}的语气与我对话。
保持角色一致性，不要跳出角色设定。`;

  systemPrompt += characterPrompt;
  
  return systemPrompt;
};

// 发送聊天请求
export const sendChatRequest = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  apiConfig: APIConfig,
  signal?: AbortSignal
): Promise<string> => {
  const requestBody: ChatRequest = {
    model: apiConfig.model,
    messages,
    temperature: apiConfig.temperature,
    max_tokens: apiConfig.maxTokens,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    
    // 如果传入了外部signal，监听它的abort事件
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    const response = await fetch(`${apiConfig.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API请求失败: ${response.status} ${response.statusText}`);
    }

    const data: ChatResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('API返回数据格式错误：没有choices');
    }

    const assistantMessage = data.choices[0].message;
    if (!assistantMessage || !assistantMessage.content) {
      throw new Error('API返回数据格式错误：没有消息内容');
    }

    return assistantMessage.content.trim();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时或被取消');
      }
      throw error;
    }
    throw new Error('未知错误');
  }
};

// 测试API配置
export const testAPIConnection = async (apiConfig: Partial<APIConfig>): Promise<{ success: boolean; error?: string }> => {
  try {
    const testMessages = [
      { role: 'user' as const, content: 'Hello, this is a test message.' }
    ];

    const requestBody = {
      model: apiConfig.model || 'gpt-3.5-turbo',
      messages: testMessages,
      max_tokens: 10,
      temperature: 0.1,
    };

    const response = await fetch(`${apiConfig.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(10000), // 10秒超时
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.error?.message || `连接失败: ${response.status}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '连接测试失败' 
    };
  }
};

// 格式化错误消息
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '发生未知错误';
};

// 验证API配置
export const validateAPIConfig = (config: Partial<APIConfig>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.name?.trim()) {
    errors.push('配置名称不能为空');
  }

  if (!config.baseURL?.trim()) {
    errors.push('API地址不能为空');
  } else if (!isValidURL(config.baseURL)) {
    errors.push('API地址格式不正确');
  }

  if (!config.apiKey?.trim()) {
    errors.push('API密钥不能为空');
  }

  if (!config.model?.trim()) {
    errors.push('模型名称不能为空');
  }

  if (typeof config.temperature !== 'number' || config.temperature < 0 || config.temperature > 2) {
    errors.push('Temperature必须在0-2之间');
  }

  if (typeof config.maxTokens !== 'number' || config.maxTokens < 1 || config.maxTokens > 4096) {
    errors.push('Max Tokens必须在1-4096之间');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// 验证URL格式
const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 生成对话标题
export const generateConversationTitle = (firstMessage: string): string => {
  const maxLength = 20;
  const cleaned = firstMessage.trim().replace(/\n/g, ' ');
  
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  
  return cleaned.substring(0, maxLength) + '...';
};

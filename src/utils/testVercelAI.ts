import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// 简单的Vercel AI SDK测试函数
export const testVercelAIBasic = async (apiKey: string, message: string = 'Hello') => {
  try {
    console.log('🧪 开始测试Vercel AI SDK...');
    
    const { text } = await generateText({
      model: openai('gpt-3.5-turbo', {
        apiKey: apiKey,
      }),
      messages: [
        { role: 'user', content: message }
      ],
      maxTokens: 50,
      temperature: 0.7,
    });

    console.log('✅ Vercel AI SDK测试成功!');
    console.log('📝 AI回复:', text);
    return { success: true, response: text };
  } catch (error) {
    console.error('❌ Vercel AI SDK测试失败:', error);
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
};

// 测试不同的配置
export const testVercelAIWithConfig = async (config: {
  apiKey: string;
  baseURL?: string;
  model?: string;
  message?: string;
}) => {
  try {
    console.log('🧪 开始测试Vercel AI SDK (自定义配置)...');
    console.log('配置:', config);
    
    const { text } = await generateText({
      model: openai(config.model || 'gpt-3.5-turbo', {
        apiKey: config.apiKey,
        baseURL: config.baseURL,
      }),
      messages: [
        { role: 'user', content: config.message || 'Hello, this is a test' }
      ],
      maxTokens: 100,
      temperature: 0.7,
    });

    console.log('✅ Vercel AI SDK测试成功!');
    console.log('📝 AI回复:', text);
    return { success: true, response: text };
  } catch (error) {
    console.error('❌ Vercel AI SDK测试失败:', error);
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
};

// 将测试函数暴露到全局，方便在浏览器控制台中调用
if (typeof window !== 'undefined') {
  (window as any).testVercelAI = testVercelAIBasic;
  (window as any).testVercelAIWithConfig = testVercelAIWithConfig;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { aiService } from '../services/aiService';
import type { AIConfig } from '../services/aiService';

interface AIStore {
  // 配置状态
  config: AIConfig | null;
  isConfigured: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // 全局提示词
  globalPrompt: string;
  
  // 操作方法
  setConfig: (config: AIConfig) => Promise<boolean>;
  updateConfig: (updates: Partial<AIConfig>) => Promise<boolean>;
  clearConfig: () => void;
  testConnection: () => Promise<boolean>;
  setGlobalPrompt: (prompt: string) => void;
  
  // 初始化
  initialize: () => void;
}

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      config: null,
      isConfigured: false,
      isConnecting: false,
      connectionError: null,
      globalPrompt: '你是一个有用的AI助手，请用友好、自然的方式与用户对话。',

      // 设置配置
      setConfig: async (config: AIConfig) => {
        set({ isConnecting: true, connectionError: null });
        
        try {
          // 初始化 AI 服务
          aiService.initialize(config);
          
          // 测试连接
          const isConnected = await aiService.testConnection();
          
          if (isConnected) {
            set({
              config,
              isConfigured: true,
              isConnecting: false,
              connectionError: null,
            });
            return true;
          } else {
            set({
              isConnecting: false,
              connectionError: 'API 连接测试失败，请检查配置',
            });
            return false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '配置失败';
          set({
            isConnecting: false,
            connectionError: errorMessage,
          });
          return false;
        }
      },

      // 更新配置
      updateConfig: async (updates: Partial<AIConfig>) => {
        const currentConfig = get().config;
        if (!currentConfig) {
          return false;
        }

        const newConfig = { ...currentConfig, ...updates };
        return get().setConfig(newConfig);
      },

      // 清除配置
      clearConfig: () => {
        set({
          config: null,
          isConfigured: false,
          connectionError: null,
        });
      },

      // 测试连接
      testConnection: async () => {
        const { config } = get();
        if (!config) {
          return false;
        }

        set({ isConnecting: true, connectionError: null });
        
        try {
          aiService.initialize(config);
          const isConnected = await aiService.testConnection();
          
          set({
            isConnecting: false,
            connectionError: isConnected ? null : 'API 连接测试失败',
          });
          
          return isConnected;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '连接测试失败';
          set({
            isConnecting: false,
            connectionError: errorMessage,
          });
          return false;
        }
      },

      // 设置全局提示词
      setGlobalPrompt: (prompt: string) => {
        set({ globalPrompt: prompt });
      },

      // 初始化
      initialize: () => {
        const { config } = get();
        if (config) {
          try {
            aiService.initialize(config);
            set({ isConfigured: true });
          } catch (error) {
            console.error('AI 服务初始化失败:', error);
            set({ isConfigured: false });
          }
        }
      },
    }),
    {
      name: 'ai-store',
      // 只持久化配置相关的数据
      partialize: (state) => ({
        config: state.config,
        globalPrompt: state.globalPrompt,
      }),
    }
  )
);

// 默认配置选项
export const DEFAULT_AI_CONFIGS = {
  openai: {
    name: 'OpenAI',
    model: 'gpt-4o-mini',
    baseURL: 'https://api.openai.com/v1',
    temperature: 0.7,
    maxTokens: 2000,
  },
  azure: {
    name: 'Azure OpenAI',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
  },
  custom: {
    name: '自定义',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 2000,
  },
};

// 常用模型列表
export const COMMON_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-4',
  'gpt-3.5-turbo',
  'claude-3-5-sonnet-20241022',
  'claude-3-opus-20240229',
  'claude-3-haiku-20240307',
];

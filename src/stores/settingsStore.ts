import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { APIConfig, AppSettings, GlobalPrompt } from '../types';
import { get, set } from 'idb-keyval';

interface SettingsStore {
  apiConfigs: APIConfig[];
  currentAPIConfig: APIConfig | null;
  appSettings: AppSettings;
  globalPrompts: GlobalPrompt[];
  activeGlobalPrompt: GlobalPrompt | null;
  loading: boolean;
  error: string | null;
  
  // API配置相关
  addAPIConfig: (config: Omit<APIConfig, 'id' | 'createdAt'>) => Promise<void>;
  updateAPIConfig: (id: string, updates: Partial<APIConfig>) => Promise<void>;
  deleteAPIConfig: (id: string) => Promise<void>;
  setCurrentAPIConfig: (config: APIConfig) => void;
  testAPIConfig: (config: Partial<APIConfig>) => Promise<boolean>;
  
  // 应用设置相关
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  
  // 全局Prompt相关
  addGlobalPrompt: (prompt: Omit<GlobalPrompt, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGlobalPrompt: (id: string, updates: Partial<GlobalPrompt>) => Promise<void>;
  deleteGlobalPrompt: (id: string) => Promise<void>;
  setActiveGlobalPrompt: (prompt: GlobalPrompt | null) => void;
  
  // 通用方法
  loadSettings: () => Promise<void>;
  clearError: () => void;
}

const generateId = () => `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generatePromptId = () => `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 默认应用设置
const defaultAppSettings: AppSettings = {
  theme: 'light',
  language: 'zh-CN',
  enableAnimations: true,
  enableSounds: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      apiConfigs: [],
      currentAPIConfig: null,
      appSettings: defaultAppSettings,
      globalPrompts: [],
      activeGlobalPrompt: null,
      loading: false,
      error: null,

      addAPIConfig: async (configData) => {
        try {
          set({ loading: true, error: null });
          
          const newConfig: APIConfig = {
            ...configData,
            id: generateId(),
            createdAt: new Date(),
          };

          const currentConfigs = get().apiConfigs;
          
          // 如果是第一个配置或者设置为默认，更新其他配置的默认状态
          if (currentConfigs.length === 0 || newConfig.isDefault) {
            const updatedConfigs = currentConfigs.map(config => ({
              ...config,
              isDefault: false
            }));
            const finalConfigs = [...updatedConfigs, newConfig];
            
            await set('apiConfigs', finalConfigs);
            
            set({ 
              apiConfigs: finalConfigs,
              currentAPIConfig: newConfig,
              loading: false 
            });
          } else {
            const updatedConfigs = [...currentConfigs, newConfig];
            await set('apiConfigs', updatedConfigs);
            
            set({ 
              apiConfigs: updatedConfigs,
              loading: false 
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '添加API配置失败',
            loading: false 
          });
        }
      },

      updateAPIConfig: async (id, updates) => {
        try {
          set({ loading: true, error: null });
          
          const currentConfigs = get().apiConfigs;
          let updatedConfigs = currentConfigs.map(config =>
            config.id === id ? { ...config, ...updates } : config
          );

          // 如果更新为默认配置，取消其他配置的默认状态
          if (updates.isDefault) {
            updatedConfigs = updatedConfigs.map(config =>
              config.id === id 
                ? { ...config, ...updates, isDefault: true }
                : { ...config, isDefault: false }
            );
          }
          
          await set('apiConfigs', updatedConfigs);
          
          set({ 
            apiConfigs: updatedConfigs,
            loading: false 
          });

          // 如果更新的是当前配置，也更新currentAPIConfig
          const currentConfig = get().currentAPIConfig;
          if (currentConfig && currentConfig.id === id) {
            set({ 
              currentAPIConfig: { ...currentConfig, ...updates }
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '更新API配置失败',
            loading: false 
          });
        }
      },

      deleteAPIConfig: async (id) => {
        try {
          set({ loading: true, error: null });
          
          const currentConfigs = get().apiConfigs;
          const configToDelete = currentConfigs.find(config => config.id === id);
          const updatedConfigs = currentConfigs.filter(config => config.id !== id);
          
          // 如果删除的是默认配置，设置第一个配置为默认
          if (configToDelete?.isDefault && updatedConfigs.length > 0) {
            updatedConfigs[0].isDefault = true;
          }
          
          await set('apiConfigs', updatedConfigs);
          
          set({ 
            apiConfigs: updatedConfigs,
            loading: false 
          });

          // 如果删除的是当前配置，清空或设置新的当前配置
          const currentConfig = get().currentAPIConfig;
          if (currentConfig && currentConfig.id === id) {
            const newCurrentConfig = updatedConfigs.find(config => config.isDefault) || updatedConfigs[0] || null;
            set({ currentAPIConfig: newCurrentConfig });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '删除API配置失败',
            loading: false 
          });
        }
      },

      setCurrentAPIConfig: (config) => {
        set({ currentAPIConfig: config });
      },

      testAPIConfig: async (config) => {
        try {
          set({ loading: true, error: null });
          
          const testPayload = {
            model: config.model || 'gpt-3.5-turbo',
            messages: [
              { role: 'user', content: 'Hello, this is a test message.' }
            ],
            max_tokens: 10,
            temperature: 0.1
          };

          const response = await fetch(`${config.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify(testPayload)
          });

          set({ loading: false });
          
          if (response.ok) {
            return true;
          } else {
            const errorData = await response.json().catch(() => ({}));
            set({ error: errorData.error?.message || `API测试失败: ${response.status}` });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'API连接测试失败',
            loading: false 
          });
          return false;
        }
      },

      updateAppSettings: (settings) => {
        const updatedSettings = { ...get().appSettings, ...settings };
        set({ appSettings: updatedSettings });
      },

      addGlobalPrompt: async (promptData) => {
        try {
          const newPrompt: GlobalPrompt = {
            ...promptData,
            id: generatePromptId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const currentPrompts = get().globalPrompts;
          const updatedPrompts = [...currentPrompts, newPrompt];
          
          await set('globalPrompts', updatedPrompts);
          
          set({ globalPrompts: updatedPrompts });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '添加全局Prompt失败'
          });
        }
      },

      updateGlobalPrompt: async (id, updates) => {
        try {
          const currentPrompts = get().globalPrompts;
          const updatedPrompts = currentPrompts.map(prompt =>
            prompt.id === id 
              ? { ...prompt, ...updates, updatedAt: new Date() }
              : prompt
          );
          
          await set('globalPrompts', updatedPrompts);
          
          set({ globalPrompts: updatedPrompts });

          // 如果更新的是当前激活的Prompt
          const activePrompt = get().activeGlobalPrompt;
          if (activePrompt && activePrompt.id === id) {
            set({ 
              activeGlobalPrompt: { ...activePrompt, ...updates, updatedAt: new Date() }
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '更新全局Prompt失败'
          });
        }
      },

      deleteGlobalPrompt: async (id) => {
        try {
          const currentPrompts = get().globalPrompts;
          const updatedPrompts = currentPrompts.filter(prompt => prompt.id !== id);
          
          await set('globalPrompts', updatedPrompts);
          
          set({ globalPrompts: updatedPrompts });

          // 如果删除的是当前激活的Prompt，清空激活状态
          const activePrompt = get().activeGlobalPrompt;
          if (activePrompt && activePrompt.id === id) {
            set({ activeGlobalPrompt: null });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '删除全局Prompt失败'
          });
        }
      },

      setActiveGlobalPrompt: (prompt) => {
        set({ activeGlobalPrompt: prompt });
      },

      loadSettings: async () => {
        try {
          set({ loading: true, error: null });
          
          const [savedAPIConfigs, savedGlobalPrompts] = await Promise.all([
            get('apiConfigs') || [],
            get('globalPrompts') || []
          ]);
          
          const defaultConfig = savedAPIConfigs.find((config: APIConfig) => config.isDefault) || savedAPIConfigs[0] || null;
          const activePrompt = savedGlobalPrompts.find((prompt: GlobalPrompt) => prompt.isActive) || null;
          
          set({ 
            apiConfigs: savedAPIConfigs,
            currentAPIConfig: defaultConfig,
            globalPrompts: savedGlobalPrompts,
            activeGlobalPrompt: activePrompt,
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '加载设置失败',
            loading: false 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'settings-store',
      partialize: (state) => ({
        apiConfigs: state.apiConfigs,
        currentAPIConfig: state.currentAPIConfig,
        appSettings: state.appSettings,
        globalPrompts: state.globalPrompts,
        activeGlobalPrompt: state.activeGlobalPrompt,
      }),
    }
  )
);

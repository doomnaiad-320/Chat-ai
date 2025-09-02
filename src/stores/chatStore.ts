import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Conversation } from '../types/index';
import { get as idbGet, set as idbSet } from 'idb-keyval';
import { sendChatRequest, buildSystemPrompt, formatErrorMessage } from '../utils/api';
import { useSettingsStore } from './settingsStore';
import { useCharacterStore } from './characterStore';

interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createConversation: (characterId: string) => Promise<string>;
  setCurrentConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, characterId: string) => Promise<void>;
  addAIMessage: (content: string, characterId: string) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  loadConversations: () => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  clearCurrentConversation: () => void;
  clearError: () => void;
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateConversationId = () => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      messages: [],
      loading: false,
      error: null,

      createConversation: async (characterId: string) => {
        try {
          const conversationId = generateConversationId();
          const newConversation: Conversation = {
            id: conversationId,
            characterId,
            messages: [],
            lastMessageAt: new Date(),
          };

          const currentConversations = get().conversations;
          const updatedConversations = [newConversation, ...currentConversations];
          
          // 保存到IndexedDB
          await idbSet('conversations', updatedConversations);
          
          set({ 
            conversations: updatedConversations,
            currentConversation: newConversation,
            messages: []
          });

          return conversationId;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '创建对话失败'
          });
          throw error;
        }
      },

      setCurrentConversation: async (conversationId: string) => {
        try {
          set({ loading: true, error: null });
          
          const conversation = get().conversations.find(c => c.id === conversationId);
          if (!conversation) {
            throw new Error('对话不存在');
          }

          set({ 
            currentConversation: conversation,
            messages: conversation.messages,
            loading: false
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '加载对话失败',
            loading: false 
          });
        }
      },

      sendMessage: async (content: string, characterId: string) => {
        try {
          set({ loading: true, error: null });

          const messageId = generateId();
          const userMessage: Message = {
            id: messageId,
            content,
            sender: 'user',
            characterId,
            timestamp: new Date(),
            status: 'sent'
          };

          let currentConversation = get().currentConversation;

          // 如果没有当前对话，创建一个新的
          if (!currentConversation || currentConversation.characterId !== characterId) {
            const conversationId = await get().createConversation(characterId);
            currentConversation = get().currentConversation;
          }

          if (!currentConversation) {
            throw new Error('无法创建对话');
          }

          // 添加用户消息
          const messagesWithUser = [...currentConversation.messages, userMessage];

          // 更新对话状态（添加用户消息）
          let updatedConversation: Conversation = {
            ...currentConversation,
            messages: messagesWithUser,
            lastMessageAt: new Date()
          };

          let conversations = get().conversations;
          let updatedConversations = conversations.map(conv =>
            conv.id === currentConversation!.id ? updatedConversation : conv
          );

          // 保存用户消息
          await idbSet('conversations', updatedConversations);

          set({
            conversations: updatedConversations,
            currentConversation: updatedConversation,
            messages: messagesWithUser
          });

          // 获取配置和角色信息
          const settingsStore = useSettingsStore.getState();
          const characterStore = useCharacterStore.getState();
          const character = characterStore.characters.find(c => c.id === characterId);

          if (!character) {
            throw new Error('角色不存在');
          }

          if (!settingsStore.currentAPIConfig) {
            throw new Error('AI 服务未配置，请先在设置中配置 API 密钥');
          }

          // 准备 AI 消息历史
          const chatMessages = messagesWithUser
            .filter(msg => msg.sender === 'user' || msg.sender === 'ai')
            .map(msg => ({
              role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
              content: msg.content
            }));

          // 构建系统提示词
          const systemPrompt = buildSystemPrompt(character, settingsStore.activeGlobalPrompt || undefined);
          
          // 构建完整的API消息
          const apiMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...chatMessages.slice(-10), // 只取最近10条消息
            { role: 'user' as const, content }
          ];

          // 发送API请求
          const aiResponse = await sendChatRequest(
            apiMessages,
            settingsStore.currentAPIConfig
          );

          // 创建 AI 响应消息
          const aiMessageId = generateId();
          const aiMessage: Message = {
            id: aiMessageId,
            content: aiResponse,
            sender: 'ai',
            characterId,
            timestamp: new Date(),
            status: 'sent'
          };

          // 添加 AI 消息
          const messagesWithAI = [...messagesWithUser, aiMessage];
          updatedConversation = {
            ...updatedConversation,
            messages: messagesWithAI,
            lastMessageAt: new Date()
          };

          updatedConversations = conversations.map(conv =>
            conv.id === currentConversation!.id ? updatedConversation : conv
          );

          // 保存到IndexedDB
          await idbSet('conversations', updatedConversations);

          set({
            conversations: updatedConversations,
            currentConversation: updatedConversation,
            messages: messagesWithAI,
            loading: false
          });

        } catch (error) {
          console.error('发送消息失败:', error);
          set({
            loading: false,
            error: error instanceof Error ? error.message : '发送消息失败'
          });
        }
      },

      addAIMessage: (content: string, characterId: string) => {
        const messageId = generateId();
        const newMessage: Message = {
          id: messageId,
          content,
          sender: 'ai',
          characterId,
          timestamp: new Date(),
          status: 'sent'
        };

        const currentConversation = get().currentConversation;
        if (!currentConversation) return;

        const updatedMessages = [...currentConversation.messages, newMessage];
        const updatedConversation: Conversation = {
          ...currentConversation,
          messages: updatedMessages,
          lastMessageAt: new Date()
        };

        const conversations = get().conversations;
        const updatedConversations = conversations.map(conv =>
          conv.id === currentConversation.id ? updatedConversation : conv
        );

        // 异步保存到IndexedDB
        idbSet('conversations', updatedConversations).catch(console.error);

        set({
          conversations: updatedConversations,
          currentConversation: updatedConversation,
          messages: updatedMessages
        });
      },

      updateMessageStatus: (messageId: string, status: Message['status']) => {
        const currentConversation = get().currentConversation;
        if (!currentConversation) return;

        const updatedMessages = currentConversation.messages.map(msg =>
          msg.id === messageId ? { ...msg, status } : msg
        );

        const updatedConversation: Conversation = {
          ...currentConversation,
          messages: updatedMessages
        };

        const conversations = get().conversations;
        const updatedConversations = conversations.map(conv =>
          conv.id === currentConversation.id ? updatedConversation : conv
        );

        set({
          conversations: updatedConversations,
          currentConversation: updatedConversation,
          messages: updatedMessages
        });
      },

      loadConversations: async () => {
        try {
          set({ loading: true, error: null });
          
          const savedConversations = await idbGet('conversations') || [];
          
          set({ 
            conversations: savedConversations,
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '加载对话失败',
            loading: false 
          });
        }
      },

      deleteConversation: async (conversationId: string) => {
        try {
          const conversations = get().conversations;
          const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
          
          await idbSet('conversations', updatedConversations);
          
          set({ conversations: updatedConversations });

          // 如果删除的是当前对话，清空当前对话
          const currentConversation = get().currentConversation;
          if (currentConversation && currentConversation.id === conversationId) {
            set({ 
              currentConversation: null,
              messages: []
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '删除对话失败'
          });
        }
      },

      clearCurrentConversation: () => {
        set({ 
          currentConversation: null,
          messages: []
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        conversations: state.conversations,
      }),
    }
  )
);

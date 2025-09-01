import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, Conversation } from '../types';
import { get, set } from 'idb-keyval';

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
          await set('conversations', updatedConversations);
          
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
          const messageId = generateId();
          const newMessage: Message = {
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

          // 更新消息列表
          const updatedMessages = [...currentConversation.messages, newMessage];
          const updatedConversation: Conversation = {
            ...currentConversation,
            messages: updatedMessages,
            lastMessageAt: new Date()
          };

          // 更新conversations数组
          const conversations = get().conversations;
          const updatedConversations = conversations.map(conv =>
            conv.id === currentConversation!.id ? updatedConversation : conv
          );

          // 保存到IndexedDB
          await set('conversations', updatedConversations);

          set({
            conversations: updatedConversations,
            currentConversation: updatedConversation,
            messages: updatedMessages
          });

        } catch (error) {
          set({ 
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
        set('conversations', updatedConversations).catch(console.error);

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
          
          const savedConversations = await get('conversations') || [];
          
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
          
          await set('conversations', updatedConversations);
          
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

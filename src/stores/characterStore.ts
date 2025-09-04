import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, Conversation } from '../types/index';
import { get as idbGet, set as idbSet } from 'idb-keyval';

interface CharacterStore {
  characters: Character[];
  currentCharacter: Character | null;
  loading: boolean;
  error: string | null;

  // Actions
  addCharacter: (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  deleteCharacterWithData: (id: string) => Promise<{ conversationCount: number; messageCount: number }>;
  getCharacterStats: (id: string) => Promise<{ conversationCount: number; messageCount: number }>;
  setCurrentCharacter: (character: Character | null) => void;
  loadCharacters: () => Promise<void>;
  clearError: () => void;
}

const generateId = () => `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      characters: [],
      currentCharacter: null,
      loading: false,
      error: null,

      addCharacter: async (characterData) => {
        try {
          set({ loading: true, error: null });
          
          const newCharacter: Character = {
            ...characterData,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const currentCharacters = get().characters;
          const updatedCharacters = [...currentCharacters, newCharacter];
          
          // 保存到IndexedDB
          await idbSet('characters', updatedCharacters);
          
          set({ 
            characters: updatedCharacters,
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '添加角色失败',
            loading: false 
          });
        }
      },

      updateCharacter: async (id, updates) => {
        try {
          set({ loading: true, error: null });
          
          const currentCharacters = get().characters;
          const updatedCharacters = currentCharacters.map(char =>
            char.id === id 
              ? { ...char, ...updates, updatedAt: new Date() }
              : char
          );
          
          // 保存到IndexedDB
          await idbSet('characters', updatedCharacters);
          
          set({ 
            characters: updatedCharacters,
            loading: false 
          });

          // 如果更新的是当前角色，也更新currentCharacter
          const currentChar = get().currentCharacter;
          if (currentChar && currentChar.id === id) {
            set({ 
              currentCharacter: { ...currentChar, ...updates, updatedAt: new Date() }
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '更新角色失败',
            loading: false 
          });
        }
      },

      deleteCharacter: async (id) => {
        try {
          set({ loading: true, error: null });

          const currentCharacters = get().characters;
          const updatedCharacters = currentCharacters.filter(char => char.id !== id);

          // 保存到IndexedDB
          await idbSet('characters', updatedCharacters);

          set({
            characters: updatedCharacters,
            loading: false
          });

          // 如果删除的是当前角色，清空currentCharacter
          const currentChar = get().currentCharacter;
          if (currentChar && currentChar.id === id) {
            set({ currentCharacter: null });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '删除角色失败',
            loading: false
          });
        }
      },

      deleteCharacterWithData: async (id) => {
        try {
          set({ loading: true, error: null });

          // 获取统计信息
          const stats = await get().getCharacterStats(id);

          // 删除角色
          const currentCharacters = get().characters;
          const updatedCharacters = currentCharacters.filter(char => char.id !== id);
          await idbSet('characters', updatedCharacters);

          // 删除相关的聊天记录
          const conversations: Conversation[] = await idbGet('conversations') || [];
          const updatedConversations = conversations.filter(conv => conv.characterId !== id);
          await idbSet('conversations', updatedConversations);

          set({
            characters: updatedCharacters,
            loading: false
          });

          // 如果删除的是当前角色，清空currentCharacter
          const currentChar = get().currentCharacter;
          if (currentChar && currentChar.id === id) {
            set({ currentCharacter: null });
          }

          return stats;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '删除角色失败',
            loading: false
          });
          throw error;
        }
      },

      getCharacterStats: async (id) => {
        try {
          const conversations: Conversation[] = await idbGet('conversations') || [];
          const characterConversations = conversations.filter(conv => conv.characterId === id);

          const conversationCount = characterConversations.length;
          const messageCount = characterConversations.reduce((total, conv) => {
            return total + (conv.messages?.length || 0);
          }, 0);

          return { conversationCount, messageCount };
        } catch (error) {
          console.error('获取角色统计信息失败:', error);
          return { conversationCount: 0, messageCount: 0 };
        }
      },

      setCurrentCharacter: (character) => {
        set({ currentCharacter: character });
      },

      loadCharacters: async () => {
        try {
          set({ loading: true, error: null });
          
          const savedCharacters = await idbGet('characters') || [];
          
          set({ 
            characters: savedCharacters,
            loading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '加载角色失败',
            loading: false 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'character-store',
      // 只持久化基本数据，不持久化loading和error状态
      partialize: (state) => ({
        characters: state.characters,
        currentCharacter: state.currentCharacter,
      }),
    }
  )
);

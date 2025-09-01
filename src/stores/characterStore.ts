import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character } from '../types/index';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';

interface CharacterStore {
  characters: Character[];
  currentCharacter: Character | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  addCharacter: (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
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

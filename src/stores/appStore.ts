import { create } from 'zustand';
import type { TabType } from '../types';

interface AppStore {
  currentTab: TabType;
  isLoading: boolean;
  notification: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
  } | null;
  
  // Actions
  setCurrentTab: (tab: TabType) => void;
  setLoading: (loading: boolean) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideNotification: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentTab: 'messages',
  isLoading: false,
  notification: null,

  setCurrentTab: (tab) => {
    set({ currentTab: tab });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  showNotification: (message, type = 'info') => {
    set({
      notification: {
        message,
        type,
        visible: true
      }
    });

    // 3秒后自动隐藏通知
    setTimeout(() => {
      const currentNotification = get().notification;
      if (currentNotification && currentNotification.message === message) {
        set({ notification: null });
      }
    }, 3000);
  },

  hideNotification: () => {
    set({ notification: null });
  },
}));

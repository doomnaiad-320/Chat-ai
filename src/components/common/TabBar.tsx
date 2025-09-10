import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/appStore';
import type { TabType } from '../../types';
import { CharacterCardSkeleton } from '../character/CharacterCardSkeleton';
import {
  MessageCircle,
  Users,
  Heart,
  Settings,
  Wand2,
} from 'lucide-react';

// 可爱的图标组件 - 无阴影版本
const CuteMessageIcon = () => (
  <MessageCircle
    size={22}
    strokeWidth={2.5}
  />
);

const CuteContactIcon = () => (
  <Users
    size={22}
    strokeWidth={2.5}
  />
);



const CuteMoreIcon = () => (
  <Heart
    size={22}
    strokeWidth={2.5}
  />
);

const CuteSettingsIcon = () => (
  <Settings
    size={22}
    strokeWidth={2.5}
  />
);

const CuteAIGenerateIcon = () => (
  <Wand2
    size={24}
    strokeWidth={2.5}
  />
);

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType;
}

const tabs: TabItem[] = [
  {
    id: 'messages',
    label: '信息',
    icon: CuteMessageIcon,
  },
  {
    id: 'contacts',
    label: '通讯录',
    icon: CuteContactIcon,
  },
  // 中间的 AI 生成按钮（居中）
  {
    id: 'ai',
    label: '生成',
    icon: CuteAIGenerateIcon,
  },
  {
    id: 'more',
    label: '喜欢',
    icon: CuteMoreIcon,
  },
  {
    id: 'settings',
    label: '设置',
    icon: CuteSettingsIcon,
  },
];

export const TabBar: React.FC = () => {
  const { currentTab, setCurrentTab } = useAppStore();

  const handleTabClick = (tabId: TabType) => {
    // 直接切换到对应页面，包括占位符和更多功能页面
    setCurrentTab(tabId);
  };

  return (
    <div className="fixed bottom-6 left-6 right-6 z-20">
      <div
        className="rounded-2xl px-10 py-2 mx-auto max-w-md"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 15px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="flex items-center justify-center gap-8 w-full">
          {tabs.map((tab, _index) => {
            const isActive = currentTab === tab.id;
            const IconComponent = tab.icon;

            return (
              <motion.button
                key={tab.id}
                className="flex items-center justify-center p-2"
                onClick={() => handleTabClick(tab.id)}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: tab.id === 'ai' ? 1.12 : 1.1 }}
                animate={{
                  y: isActive ? -3 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* 图标区：AI 选项稍作凸显（不改变整体布局） */}
                <motion.div
                  style={{
                    color: isActive ? '#FF6B9D' : '#9CA3AF',
                    backgroundColor: tab.id === 'ai' ? 'rgba(255, 107, 157, 0.08)' : 'transparent',
                    borderRadius: tab.id === 'ai' ? 12 : 0,
                    padding: tab.id === 'ai' ? 6 : 0,
                  }}
                  animate={{
                    color: isActive ? '#FF6B9D' : '#9CA3AF',
                    backgroundColor: tab.id === 'ai' ? (isActive ? 'rgba(255, 107, 157, 0.16)' : 'rgba(255, 107, 157, 0.08)') : 'transparent',
                  }}
                  whileHover={{
                    color: isActive ? '#FF8E9B' : '#6B7280',
                    transition: { duration: 0.2 }
                  }}
                  transition={{ duration: 0.3 }}
                  aria-label={tab.label}
                >
                  <IconComponent />
                </motion.div>
              </motion.button>
            );
          })}

          {/* 角色卡骨架占位：默认隐藏，后续用于在 TabBar 弹层中展示角色卡 */}
          <div className="hidden absolute -top-40 left-0 right-0 px-4" aria-hidden="true" data-skeleton="character-card-placeholder">
            {/* 角色卡骨架示例：移除 hidden 可预览样式 */}
            <CharacterCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

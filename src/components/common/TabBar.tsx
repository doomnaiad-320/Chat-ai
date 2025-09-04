import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/appStore';
import type { TabType } from '../../types';
import {
  MessageCircle,
  Users,
  Heart,
  Settings
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
        className="rounded-2xl px-8 py-3 mx-auto max-w-xs"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 15px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="flex items-center justify-between w-full">
          {tabs.map((tab, index) => {
            const isActive = currentTab === tab.id;
            const IconComponent = tab.icon;

            return (
              <motion.button
                key={tab.id}
                className="flex items-center justify-center p-2"
                onClick={() => handleTabClick(tab.id)}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                animate={{
                  y: isActive ? -3 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* 只显示图标，无背景边框 */}
                <motion.div
                  style={{
                    color: isActive ? '#FF6B9D' : '#9CA3AF'
                  }}
                  animate={{
                    color: isActive ? '#FF6B9D' : '#9CA3AF'
                  }}
                  whileHover={{
                    color: isActive ? '#FF8E9B' : '#6B7280',
                    transition: { duration: 0.2 }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <IconComponent />
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../stores/appStore';
import type { TabType } from '../../types';

// 图标组件
const MessageIcon = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    style={{ color: 'currentColor' }}
  >
    <path
      d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
      fill="currentColor"
    />
  </svg>
);

const ContactIcon = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    style={{ color: 'currentColor' }}
  >
    <path
      d="M16 4C18.2091 4 20 5.79086 20 8C20 10.2091 18.2091 12 16 12C13.7909 12 12 10.2091 12 8C12 5.79086 13.7909 4 16 4Z"
      fill="currentColor"
    />
    <path
      d="M12 14C16.4183 14 20 17.5817 20 22H12H4C4 17.5817 7.58172 14 12 14Z"
      fill="currentColor"
    />
    <circle cx="8" cy="8" r="4" fill="currentColor"/>
  </svg>
);

const SettingsIcon = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    style={{ color: 'currentColor' }}
  >
    <path
      d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5A3.5 3.5 0 0 1 15.5 12A3.5 3.5 0 0 1 12 15.5M19.43 12.98C19.47 12.66 19.5 12.34 19.5 12C19.5 11.66 19.47 11.34 19.43 11.02L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.22 8.95 2.27 9.22 2.46 9.37L4.57 11.02C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.66 4.57 12.98L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.98Z"
      fill="currentColor"
    />
  </svg>
);

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ active: boolean }>;
}

const tabs: TabItem[] = [
  {
    id: 'messages',
    label: '信息',
    icon: MessageIcon,
  },
  {
    id: 'contacts',
    label: '通讯录',
    icon: ContactIcon,
  },
  {
    id: 'settings',
    label: '设置',
    icon: SettingsIcon,
  },
];

export const TabBar: React.FC = () => {
  const { currentTab, setCurrentTab } = useAppStore();

  const handleTabClick = (tabId: TabType) => {
    setCurrentTab(tabId);
  };

  const getTabColors = (index: number) => {
    const colors = [
      { bg: '#D1E7FE', color: '#4A90E2', activeBg: '#F0F4FF' },
      { bg: '#F3D9FF', color: '#8B5CF6', activeBg: '#F8F0FF' },
      { bg: '#BAF1E3', color: '#10B981', activeBg: '#F0FDF9' }
    ];
    return colors[index];
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 z-20">
      <div
        className="rounded-3xl mx-auto max-w-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(232, 239, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(209, 231, 254, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="px-4 py-3 flex items-center justify-around">
          {tabs.map((tab, index) => {
            const isActive = currentTab === tab.id;
            const IconComponent = tab.icon;
            const tabColors = getTabColors(index);

            return (
              <motion.button
                key={tab.id}
                className="relative flex flex-col items-center p-3 rounded-2xl transition-all duration-300"
                onClick={() => handleTabClick(tab.id)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: isActive ? 1.1 : 1.05 }}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -4 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {/* 活跃状态背景 */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl opacity-60"
                    style={{ backgroundColor: tabColors.activeBg }}
                    layoutId="activeTab"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}

                {/* 图标容器 */}
                <div
                  className="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mb-1 transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? tabColors.bg : '#F8FAFF',
                    color: isActive ? tabColors.color : '#9CA3AF',
                    boxShadow: isActive ? `0 4px 12px ${tabColors.bg}40` : '0 2px 6px rgba(248, 250, 255, 0.3)'
                  }}
                >
                  <IconComponent active={isActive} />
                </div>

                {/* 标签文字 */}
                <span
                  className="relative z-10 text-xs font-medium transition-all duration-300"
                  style={{
                    color: isActive ? '#6B7280' : '#9CA3AF',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {tab.label}
                </span>

                {/* 活跃指示器 */}
                {isActive && (
                  <motion.div
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: tabColors.bg }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

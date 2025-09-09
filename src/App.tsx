import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';

// 通用组件
import { TabBar } from './components/common/TabBar';
import { MobileTestPanel } from './components/common/MobileTestPanel';

// 页面组件
import { ContactsPage } from './pages/ContactsPage';
import { MessagesPage } from './pages/MessagesPage';
import { ChatPage } from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';
import { DevelopmentPage } from './pages/DevelopmentPage';

// Stores
import { useAppStore } from './stores/appStore';
import { useCharacterStore } from './stores/characterStore';
import { useChatStore } from './stores/chatStore';
import { useSettingsStore } from './stores/settingsStore';





// 通知组件
const Notification: React.FC = () => {
  const { notification, hideNotification } = useAppStore();

  if (!notification?.visible) return null;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return { bg: '#BAF1E3', color: '#10B981' };
      case 'error':
        return { bg: '#FED7D7', color: '#E53E3E' };
      case 'warning':
        return { bg: '#FEF5E7', color: '#DD6B20' };
      default:
        return { bg: '#D1E7FE', color: '#4A90E2' };
    }
  };

  const colors = getNotificationColor(notification.type);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-4 left-4 right-4 z-50"
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <div
          className="text-white px-4 py-3 rounded-2xl backdrop-blur-md"
          style={{
            backgroundColor: colors.bg,
            color: colors.color,
            boxShadow: `0 4px 12px ${colors.bg}40`
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{notification.message}</p>
            <button
              onClick={hideNotification}
              className="ml-4 hover:opacity-70 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// 加载组件
const LoadingSpinner: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: '#FAFBFF' }}>
    <motion.div
      className="w-12 h-12 border-4 rounded-full"
      style={{
        borderColor: '#E8EFFF',
        borderTopColor: '#D1E7FE'
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// 页面容器组件
const PageContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parent] = useAutoAnimate();

  return (
    <div ref={parent} className="h-full">
      {children}
    </div>
  );
};

// 条件显示的 TabBar 组件
const ConditionalTabBar: React.FC = () => {
  const location = useLocation();

  // 判断是否在聊天页面
  const isInChatPage = location.pathname === '/chat';

  // 只在非聊天页面显示 TabBar
  if (isInChatPage) {
    return null;
  }

  return <TabBar />;
};

// 主应用组件
const App: React.FC = () => {
  const { currentTab, isLoading } = useAppStore();
  const { loadCharacters } = useCharacterStore();
  const { loadConversations } = useChatStore();
  const { loadSettings } = useSettingsStore();

  // 应用初始化
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 并行加载所有数据
        await Promise.all([
          loadCharacters(),
          loadConversations(),
          loadSettings(),
        ]);
      } catch (error) {
        console.error('应用初始化失败:', error);
      }
    };

    initializeApp();
  }, [loadCharacters, loadConversations, loadSettings]);

  // 页面切换动画配置
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.3
  };

  // 根据当前标签页渲染对应页面
  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'messages':
        return <MessagesPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'more':
        return (
          <DevelopmentPage
            title="喜欢功能"
            description="💖 更多让您心动的功能即将上线，为您提供更温馨的使用体验！"
          />
        );
      case 'settings':
        return <SettingsPage />;
      default:
        return <MessagesPage />;
    }
  };

  return (
    <Router basename="/Chat-ai">
      <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#FAFBFF' }}>
        {/* 全局加载状态 */}
        <AnimatePresence>
          {isLoading && <LoadingSpinner />}
        </AnimatePresence>

        {/* 通知组件 */}
        <Notification />

        {/* 主要内容区域 */}
        <div className="flex-1 relative">
          <Routes>
            <Route
              path="/"
              element={
                <PageContainer>
                  <motion.div
                    key={currentTab}
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    className="h-full"
                  >
                    {renderCurrentPage()}
                  </motion.div>
                </PageContainer>
              }
            />
            <Route
              path="/chat"
              element={
                <PageContainer>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    className="h-full"
                  >
                    <ChatPage />
                  </motion.div>
                </PageContainer>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* 底部导航栏 - 只在非聊天页面显示 */}
        <ConditionalTabBar />

        {/* 移动端测试面板 (仅在开发环境显示) */}
        {import.meta.env.DEV && <MobileTestPanel />}
      </div>
    </Router>
  );
};

export default App;

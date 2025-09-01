import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';

// 通用组件
import { TabBar } from './components/common/TabBar';
import { MobileTestPanel } from './components/common/MobileTestPanel';

// 页面组件
import { ContactsPage } from './pages/ContactsPage';

// Stores
import { useAppStore } from './stores/appStore';
import { useCharacterStore } from './stores/characterStore';
import { useChatStore } from './stores/chatStore';
import { useSettingsStore } from './stores/settingsStore';

// 临时页面组件（保持清淡配色）
const TempMessagesPage: React.FC = () => (
  <div className="flex flex-col h-full" style={{ backgroundColor: '#FAFBFF' }}>
    {/* 导航栏 */}
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b" style={{ borderColor: '#E8EFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-medium" style={{ color: '#6B7280' }}>
          信息
        </h1>
        <button 
          className="w-10 h-10 rounded-full transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          style={{ 
            backgroundColor: '#D1E7FE', 
            color: '#4A90E2',
            boxShadow: '0 2px 8px rgba(209, 231, 254, 0.3)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C1D7EE'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D1E7FE'}
        >
          <span className="text-lg font-medium">+</span>
        </button>
      </div>
    </div>
    
    {/* 内容区域 */}
    <div className="flex-1 pt-20 pb-24 px-6 flex items-center justify-center">
      <div className="text-center max-w-sm">
        {/* 图标容器 */}
        <div className="relative mb-8">
          <div 
            className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto"
            style={{ 
              backgroundColor: '#F0F4FF',
              boxShadow: '0 4px 12px rgba(240, 244, 255, 0.4)'
            }}
          >
            <span className="text-5xl">💬</span>
          </div>
          {/* 装饰性小圆点 */}
          <div 
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full animate-pulse"
            style={{ backgroundColor: '#D1E7FE' }}
          ></div>
          <div 
            className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full animate-pulse delay-300"
            style={{ backgroundColor: '#F3D9FF' }}
          ></div>
        </div>
        
        <h3 className="text-2xl font-medium mb-3" style={{ color: '#6B7280' }}>还没有对话</h3>
        <p className="mb-8 leading-relaxed" style={{ color: '#9CA3AF' }}>
          选择一个可爱的AI角色，开始你们的温馨对话吧！✨
        </p>
        
        {/* 按钮 */}
        <button 
          className="font-medium py-4 px-8 rounded-2xl transform hover:scale-105 transition-all duration-300"
          style={{ 
            backgroundColor: '#D1E7FE', 
            color: '#4A90E2',
            boxShadow: '0 4px 12px rgba(209, 231, 254, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#C1D7EE';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(209, 231, 254, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#D1E7FE';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(209, 231, 254, 0.3)';
          }}
        >
          开始新对话 🌸
        </button>
      </div>
    </div>
  </div>
);


const TempSettingsPage: React.FC = () => (
  <div className="flex flex-col h-full" style={{ backgroundColor: '#FAFBFF' }}>
    {/* 导航栏 */}
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b" style={{ borderColor: '#E8EFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="px-6 py-4">
        <h1 className="text-xl font-medium" style={{ color: '#6B7280' }}>
          设置
        </h1>
      </div>
    </div>
    
    {/* 内容区域 */}
    <div className="flex-1 pt-20 pb-24 px-6">
      <div className="space-y-6">
        {/* API配置卡片 */}
        <div 
          className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border transition-all duration-300 group"
          style={{ 
            borderColor: 'rgba(232, 239, 255, 0.5)',
            boxShadow: '0 4px 12px rgba(209, 231, 254, 0.15)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 16px rgba(209, 231, 254, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(209, 231, 254, 0.15)'}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                style={{ 
                  backgroundColor: '#D1E7FE',
                  boxShadow: '0 2px 8px rgba(209, 231, 254, 0.3)'
                }}
              >
                <span className="text-xl" style={{ color: '#4A90E2' }}>🔧</span>
              </div>
              <div>
                <h3 className="text-lg font-medium" style={{ color: '#6B7280' }}>API配置</h3>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>配置AI服务接口</p>
              </div>
            </div>
            <button 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200"
              style={{ 
                backgroundColor: '#D1E7FE', 
                color: '#4A90E2',
                boxShadow: '0 2px 6px rgba(209, 231, 254, 0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C1D7EE'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D1E7FE'}
            >
              <span className="text-sm">→</span>
            </button>
          </div>
          <div 
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#F8FAFF' }}
          >
            <p className="text-sm" style={{ color: '#6B7280' }}>🤖 支持 OpenAI、Claude 等多种AI服务</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

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
        return <TempMessagesPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'settings':
        return <TempSettingsPage />;
      default:
        return <TempMessagesPage />;
    }
  };

  return (
    <Router>
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
                    <div className="h-full flex items-center justify-center" style={{ backgroundColor: '#FAFBFF' }}>
                      <p style={{ color: '#9CA3AF' }}>聊天页面开发中...</p>
                    </div>
                  </motion.div>
                </PageContainer>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* 底部导航栏 */}
        <TabBar />

        {/* 移动端测试面板 (仅在开发环境显示) */}
        {import.meta.env.DEV && <MobileTestPanel />}
      </div>
    </Router>
  );
};

export default App;

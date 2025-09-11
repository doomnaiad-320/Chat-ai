import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../stores/settingsStore';
import { useAppStore } from '../stores/appStore';
import { APIConfigCard } from '../components/settings/APIConfigCard';
// import { GlobalPromptSettings } from '../components/settings/GlobalPromptSettings';

interface SettingItemProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  animationProps?: any;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  title, 
  description, 
  children, 
  animationProps 
}) => {
  return (
    <motion.div
      className={`card mb-4 ${animationProps?.animationClass || ''}`}
      style={animationProps?.style}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-text-primary">{title}</h3>
          {description && (
            <p className="text-sm text-text-muted mt-1">{description}</p>
          )}
        </div>
        <div className="ml-4">
          {children}
        </div>
      </div>
    </motion.div>
  );
};



export const SettingsPage: React.FC = () => {
  const {
    appSettings,
    loadSettings,
    updateAppSettings,
  } = useSettingsStore();

  const { showNotification } = useAppStore();

  // 确保 appSettings 有默认值，防止 undefined 错误
  const safeAppSettings = appSettings || {
    theme: 'light' as const,
    language: 'zh-CN' as const,
    enableAnimations: true,
    enableSounds: true,
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    updateAppSettings({ theme });
    showNotification('主题设置已更新', 'success');
  };

  const handleAnimationToggle = () => {
    updateAppSettings({ enableAnimations: !safeAppSettings.enableAnimations });
    showNotification(
      `动画效果已${!safeAppSettings.enableAnimations ? '开启' : '关闭'}`,
      'success'
    );
  };

  const handleSoundToggle = () => {
    updateAppSettings({ enableSounds: !safeAppSettings.enableSounds });
    showNotification(
      `声音效果已${!safeAppSettings.enableSounds ? '开启' : '关闭'}`,
      'success'
    );
  };



  return (
    <div className="h-screen bg-warm-50 overflow-hidden">
      {/* 顶部导航栏 */}
      <div className="navbar">
        <h1 className="text-lg font-semibold text-text-primary">设置</h1>
      </div>

      {/* 设置内容 */}
      <div className="h-full overflow-y-auto">
        <div className="px-4 pt-20" style={{ paddingBottom: 'calc(8rem + env(safe-area-inset-bottom))' }}>
          {/* 应用设置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-text-primary mb-4">应用设置</h2>
          
          <SettingItem title="主题模式" description="选择应用的外观主题">
            <select
              value={safeAppSettings.theme}
              onChange={(e) => handleThemeChange(e.target.value as any)}
              className="input-field w-32"
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="auto">跟随系统</option>
            </select>
          </SettingItem>

          <SettingItem title="动画效果" description="开启或关闭界面动画">
            <motion.button
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                safeAppSettings.enableAnimations ? 'bg-primary-400' : 'bg-gray-300'
              }`}
              onClick={handleAnimationToggle}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{
                  x: safeAppSettings.enableAnimations ? 24 : 2
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </SettingItem>

          <SettingItem title="声音效果" description="开启或关闭提示音">
            <motion.button
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                safeAppSettings.enableSounds ? 'bg-primary-400' : 'bg-gray-300'
              }`}
              onClick={handleSoundToggle}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{
                  x: safeAppSettings.enableSounds ? 24 : 2
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </SettingItem>
        </motion.div>

        {/* AI 配置部分 */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">AI 配置</h2>
          
          {/* API配置展示卡片 */}
          <APIConfigCard />
        </div>

          {/* AI 对话风格设置部分 */}
          {/* <div className="mt-8">
            <GlobalPromptSettings />
          </div> */}
        </div>
      </div>
    </div>
  );
};

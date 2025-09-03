import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../stores/settingsStore';
import { useAppStore } from '../stores/appStore';
import type { APIConfig } from '../types/index';
import { APIConfigForm } from '../components/settings/APIConfigForm';
import { APIConfigModal } from '../components/settings/APIConfigModal';
import { APIConfigCard } from '../components/settings/APIConfigCard';
import { AIConfigPanel } from '../components/settings/AIConfigPanel';
import { GlobalPromptSettings } from '../components/settings/GlobalPromptSettings';

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

interface APIConfigItemProps {
  config: APIConfig;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTest: () => void;
}

const APIConfigItem: React.FC<APIConfigItemProps> = ({
  config,
  isActive,
  onSelect,
  onEdit,
  onDelete,
  onTest
}) => {
  return (
    <motion.div
      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
        isActive 
          ? 'border-primary-400 bg-primary-50' 
          : 'border-gray-200 bg-white hover:border-primary-200'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <h4 className="font-medium text-text-primary">{config.name}</h4>
          {config.isDefault && (
            <span className="ml-2 px-2 py-1 bg-primary-400 text-white text-xs rounded-full">
              默认
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <motion.button
            className="p-1 text-primary-400 hover:bg-primary-50 rounded"
            onClick={onTest}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </motion.button>
          
          <motion.button
            className="p-1 text-gray-400 hover:bg-gray-50 rounded"
            onClick={onEdit}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2"/>
              <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </motion.button>
          
          <motion.button
            className="p-1 text-red-400 hover:bg-red-50 rounded"
            onClick={onDelete}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </motion.button>
        </div>
      </div>
      
      <p className="text-sm text-text-muted mb-2">{config.model}</p>
      <p className="text-xs text-text-muted">{config.baseURL}</p>
      
      {!isActive && (
        <motion.button
          className="mt-3 w-full py-2 bg-primary-400 text-white rounded-lg text-sm font-medium"
          onClick={onSelect}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          设为默认
        </motion.button>
      )}
    </motion.div>
  );
};

export const SettingsPage: React.FC = () => {
  const {
    apiConfigs,
    currentAPIConfig,
    appSettings,
    loadSettings,
    updateAppSettings,
    setCurrentAPIConfig,
    deleteAPIConfig,
    testAPIConfig
  } = useSettingsStore();

  const { showNotification } = useAppStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<APIConfig | undefined>(undefined);

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

  const handleAPIConfigSelect = (config: APIConfig) => {
    setCurrentAPIConfig(config);
    showNotification(`已切换到 ${config.name}`, 'success');
  };

  const handleAPIConfigEdit = (config: APIConfig) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const handleAPIConfigDelete = async (config: APIConfig) => {
    if (window.confirm(`确定要删除API配置 "${config.name}" 吗？`)) {
      try {
        await deleteAPIConfig(config.id);
        showNotification('API配置删除成功', 'success');
      } catch (error) {
        showNotification('删除失败', 'error');
      }
    }
  };

  const handleAPIConfigTest = async (config: APIConfig) => {
    try {
      const success = await testAPIConfig(config);
      showNotification(
        success ? 'API连接测试成功' : 'API连接测试失败',
        success ? 'success' : 'error'
      );
    } catch (error) {
      showNotification('API连接测试失败', 'error');
    }
  };

  const handleAddAPIConfig = () => {
    setEditingConfig(undefined);
    setIsModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingConfig(undefined);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingConfig(undefined);
  };

  const handleConfigSave = (config: APIConfig) => {
    // 配置保存后的回调，可以在这里做一些额外处理
    loadSettings(); // 重新加载配置列表
  };

  const handleModalSave = () => {
    // 模态框保存后的回调
    loadSettings(); // 重新加载配置列表
  };

  const handleExportData = () => {
    // TODO: 实现数据导出
    showNotification('数据导出功能开发中...', 'info');
  };

  const handleImportData = () => {
    // TODO: 实现数据导入
    showNotification('数据导入功能开发中...', 'info');
  };

  return (
    <div className="flex flex-col h-full bg-warm-50">
      {/* 顶部导航栏 */}
      <div className="navbar">
        <h1 className="text-lg font-semibold text-text-primary">设置</h1>
      </div>

      {/* 设置内容 */}
      <div className="flex-1 overflow-y-auto pt-16 pb-32 px-4">
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

        {/* AI 配置 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">AI 配置</h2>
          
          {/* API配置展示卡片 */}
          <APIConfigCard className="mb-4" />
          
          {/* AI配置面板 */}
          <div className="card">
            <AIConfigPanel />
          </div>
        </motion.div>

        {/* API配置 (旧版本，保留兼容性) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">API配置</h2>
            <motion.button
              className="btn-primary text-sm py-2 px-4"
              onClick={handleAddAPIConfig}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              添加配置
            </motion.button>
          </div>

          {!apiConfigs || apiConfigs.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-text-muted mb-4">还没有API配置</p>
              <motion.button
                className="btn-primary"
                onClick={handleAddAPIConfig}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                添加第一个配置
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3">
              {apiConfigs?.map((config) => (
                <APIConfigItem
                  key={config.id}
                  config={config}
                  isActive={currentAPIConfig?.id === config.id}
                  onSelect={() => handleAPIConfigSelect(config)}
                  onEdit={() => handleAPIConfigEdit(config)}
                  onDelete={() => handleAPIConfigDelete(config)}
                  onTest={() => handleAPIConfigTest(config)}
                />
              )) || []}
            </div>
          )}
        </motion.div>

        {/* 全局提示词设置 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8"
        >
          <GlobalPromptSettings />
        </motion.div>

        {/* 数据管理 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">数据管理</h2>
          
          <SettingItem title="导出数据" description="备份所有角色和对话数据">
            <motion.button
              className="btn-secondary text-sm py-2 px-4"
              onClick={handleExportData}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              导出
            </motion.button>
          </SettingItem>

          <SettingItem title="导入数据" description="从备份文件恢复数据">
            <motion.button
              className="btn-secondary text-sm py-2 px-4"
              onClick={handleImportData}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              导入
            </motion.button>
          </SettingItem>
        </motion.div>

        {/* 关于信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 mb-8"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">关于</h2>
          
          <div className="card text-center">
            <h3 className="font-semibold text-text-primary mb-2">iMessage AI Chat</h3>
            <p className="text-sm text-text-muted mb-2">版本 1.0.0</p>
            <p className="text-xs text-text-muted">
              一个可爱的AI虚拟聊天应用
            </p>
          </div>
        </motion.div>
      </div>

      {/* API配置表单 (保留兼容性) */}
      <APIConfigForm
        config={editingConfig}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleConfigSave}
      />

      {/* 新的API配置模态框 */}
      <APIConfigModal
        config={editingConfig}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </div>
  );
};

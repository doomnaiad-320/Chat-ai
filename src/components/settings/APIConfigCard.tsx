import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import { APIConfigModal } from './APIConfigModal';

interface APIConfigCardProps {
  className?: string;
}

export const APIConfigCard: React.FC<APIConfigCardProps> = ({ className = '' }) => {
  const { currentAPIConfig } = useSettingsStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSave = () => {
    // 模态框会自动重新加载设置
  };

  return (
    <>
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {/* API状态指示器 */}
              <div className={`w-3 h-3 rounded-full ${
                currentAPIConfig ? 'bg-green-500' : 'bg-orange-500'
              }`} />
              
              <div>
                <h3 className="font-semibold text-text-primary">
                  {currentAPIConfig ? 'API已配置' : '未配置API'}
                </h3>
                
                {currentAPIConfig ? (
                  <div className="mt-1">
                    <p className="text-sm text-text-secondary">
                      配置名称: {currentAPIConfig.name}
                    </p>
                    <p className="text-sm text-primary-600 font-medium">
                      当前模型: {currentAPIConfig.model}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {currentAPIConfig.baseURL}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted mt-1">
                    点击编辑按钮配置您的AI API
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 编辑按钮 */}
          <motion.button
            onClick={handleEdit}
            className="p-3 rounded-bubble bg-primary-50 hover:bg-primary-100 text-primary-600 hover:text-primary-700 transition-all duration-200 shadow-bubble hover:shadow-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path 
                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        </div>

        {/* 配置详情 */}
        {currentAPIConfig && (
          <motion.div
            className="mt-4 pt-4 border-t border-warm-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">Temperature:</span>
                <span className="ml-2 text-text-primary font-medium">
                  {currentAPIConfig.temperature}
                </span>
              </div>
              <div>
                <span className="text-text-muted">Max Tokens:</span>
                <span className="ml-2 text-text-primary font-medium">
                  {currentAPIConfig.maxTokens}
                </span>
              </div>
            </div>
            
            {currentAPIConfig.isDefault && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="mr-1">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
                  </svg>
                  默认配置
                </span>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* API配置模态框 */}
      <APIConfigModal
        config={currentAPIConfig || undefined}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </>
  );
};
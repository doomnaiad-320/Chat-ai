
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { APIConfig } from '../../types';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAppStore } from '../../stores/appStore';
import { validateAPIConfig, fetchAvailableModels } from '../../utils/api';

interface APIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: APIConfig;
  onSave?: () => void;
}

interface FormData {
  name: string;
  baseURL: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  isDefault: boolean;
}

const initialFormData: FormData = {
  name: '',
  baseURL: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  isDefault: false,
};

export const APIConfigModal: React.FC<APIConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [step, setStep] = useState<'config' | 'models'>('config');

  const { addAPIConfig, updateAPIConfig, loading } = useSettingsStore();
  const { showNotification } = useAppStore();

  // 初始化表单数据
  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name,
        baseURL: config.baseURL,
        apiKey: config.apiKey,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        isDefault: config.isDefault,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setStep('config');
    setAvailableModels([]);
  }, [config, isOpen]);

  // 验证基础配置
  const validateBasicConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '配置名称不能为空';
    }

    if (!formData.baseURL.trim()) {
      newErrors.baseURL = 'API地址不能为空';
    } else {
      try {
        new URL(formData.baseURL);
      } catch {
        newErrors.baseURL = 'API地址格式不正确';
      }
    }

    if (!formData.apiKey.trim()) {
      newErrors.apiKey = 'API密钥不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 获取模型列表
  const handleFetchModels = async () => {
    if (!validateBasicConfig()) {
      showNotification('请先填写正确的API配置信息', 'error');
      return;
    }

    setIsLoadingModels(true);
    try {
      const models = await fetchAvailableModels({
        baseURL: formData.baseURL.trim(),
        apiKey: formData.apiKey.trim()
      });
      
      setAvailableModels(models);
      setStep('models');
      
      // 如果当前选择的模型不在列表中，选择第一个模型
      if (!models.includes(formData.model)) {
        setFormData(prev => ({ ...prev, model: models[0] || 'gpt-3.5-turbo' }));
      }
      
      showNotification(`成功获取到 ${models.length} 个可用模型`, 'success');
    } catch (error) {
      showNotification('获取模型列表失败，请检查API配置', 'error');
    } finally {
      setIsLoadingModels(false);
    }
  };

  // 保存配置
  const handleSave = async () => {
    if (!validateBasicConfig()) {
      return;
    }

    if (!formData.model) {
      showNotification('请选择一个模型', 'error');
      return;
    }

    try {
      if (config) {
        await updateAPIConfig(config.id, formData);
        showNotification('API配置更新成功', 'success');
      } else {
        await addAPIConfig(formData);
        showNotification('API配置创建成功', 'success');
      }
      onClose();
      onSave?.(); // 调用父组件的保存回调
    } catch (error) {
      showNotification(config ? 'API配置更新失败' : 'API配置创建失败', 'error');
    }
  };

  // 返回上一步
  const handleBack = () => {
    setStep('config');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-card max-w-md w-full max-h-[90vh] overflow-hidden shadow-card border border-gray-200"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* 头部 */}
          <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: 'rgba(255, 245, 235, 0.5)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary">
                {config ? '编辑API配置' : '添加API配置'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-primary-50 rounded-lg transition-colors text-text-muted hover:text-text-primary"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            {/* 步骤指示器 */}
            <div className="flex items-center mt-4 space-x-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                step === 'config' ? 'bg-primary-400 text-white shadow-bubble' : 'bg-primary-100 text-primary-600'
              }`}>
                1
              </div>
              <div className={`h-1 flex-1 rounded transition-all ${
                step === 'models' ? 'bg-primary-400' : 'bg-warm-200'
              }`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                step === 'models' ? 'bg-primary-400 text-white shadow-bubble' : 'bg-warm-200 text-text-muted'
              }`}>
                2
              </div>
            </div>
            
            <div className="flex justify-between mt-2 text-sm">
              <span className={step === 'config' ? 'text-primary-600 font-medium' : 'text-text-muted'}>
                API配置
              </span>
              <span className={step === 'models' ? 'text-primary-600 font-medium' : 'text-text-muted'}>
                选择模型
              </span>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {step === 'config' && (
              <div className="space-y-4">
                {/* 配置名称 */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    配置名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                    placeholder="例如：OpenAI GPT-3.5"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* API地址 */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    API地址 *
                  </label>
                  <input
                    type="url"
                    value={formData.baseURL}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseURL: e.target.value }))}
                    className={`input-field ${errors.baseURL ? 'border-red-400' : ''}`}
                    placeholder="https://api.openai.com/v1"
                  />
                  {errors.baseURL && (
                    <p className="text-red-500 text-xs mt-1">{errors.baseURL}</p>
                  )}
                </div>

                {/* API密钥 */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    API密钥 *
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.apiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                      className={`input-field pr-12 ${errors.apiKey ? 'border-red-400' : ''}`}
                      placeholder="sk-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    >
                      {showApiKey ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.apiKey && (
                    <p className="text-red-500 text-xs mt-1">{errors.apiKey}</p>
                  )}
                </div>

                {/* 高级参数 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Temperature: {formData.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-text-muted mt-1">
                      <span>保守</span>
                      <span>创意</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      最大Token数
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="4096"
                      value={formData.maxTokens}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* 设为默认 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="isDefault" className="text-sm text-text-primary">
                    设为默认配置
                  </label>
                </div>
              </div>
            )}

            {step === 'models' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-text-primary mb-2">选择模型</h3>
                  <p className="text-sm text-text-muted">
                    从 {formData.baseURL} 获取到 {availableModels.length} 个可用模型
                  </p>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableModels.map((model) => (
                    <motion.div
                      key={model}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.model === model
                          ? 'border-primary-400 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, model }))}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-text-primary">{model}</span>
                        {formData.model === model && (
                          <div className="w-5 h-5 bg-primary-400 rounded-full flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="px-6 py-4 border-t border-gray-200">
            {step === 'config' && (
              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-secondary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  取消
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleFetchModels}
                  disabled={isLoadingModels}
                  className="flex-1 btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoadingModels ? '获取中...' : '获取模型'}
                </motion.button>
              </div>
            )}

            {step === 'models' && (
              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  onClick={handleBack}
                  className="btn-secondary px-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  返回
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? '保存中...' : '保存'}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { APIConfig } from '../../types';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAppStore } from '../../stores/appStore';
import { validateAPIConfig, testAPIConnection } from '../../utils/api';

interface APIConfigFormProps {
  config?: APIConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: APIConfig) => void;
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

export const APIConfigForm: React.FC<APIConfigFormProps> = ({
  config,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

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
    setTestResult(null);
  }, [config, isOpen]);

  // 表单验证
  const validateForm = (): boolean => {
    const validation = validateAPIConfig(formData);
    setErrors(validation.errors.reduce((acc, error) => {
      const field = error.toLowerCase().includes('name') ? 'name' :
                   error.toLowerCase().includes('url') ? 'baseURL' :
                   error.toLowerCase().includes('key') ? 'apiKey' :
                   error.toLowerCase().includes('model') ? 'model' :
                   error.toLowerCase().includes('temperature') ? 'temperature' :
                   error.toLowerCase().includes('tokens') ? 'maxTokens' : 'general';
      acc[field] = error;
      return acc;
    }, {} as Record<string, string>));
    
    return validation.valid;
  };

  // 测试API连接
  const handleTestConnection = async () => {
    if (!validateForm()) {
      showNotification('请先修正表单错误', 'error');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testAPIConnection(formData);
      setTestResult({
        success: result.success,
        message: result.success ? 'API连接测试成功！' : result.error || 'API连接测试失败'
      });
      
      showNotification(
        result.success ? 'API连接测试成功' : 'API连接测试失败',
        result.success ? 'success' : 'error'
      );
    } catch (error) {
      const errorMessage = 'API连接测试失败';
      setTestResult({
        success: false,
        message: errorMessage
      });
      showNotification(errorMessage, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (config) {
        // 更新配置
        await updateAPIConfig(config.id, formData);
        showNotification('API配置更新成功', 'success');
      } else {
        // 创建新配置
        await addAPIConfig(formData);
        showNotification('API配置创建成功', 'success');
      }
      
      onClose();
      if (onSave && config) {
        onSave({ ...config, ...formData, updatedAt: new Date() } as APIConfig);
      }
    } catch (error) {
      showNotification(config ? 'API配置更新失败' : 'API配置创建失败', 'error');
    }
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
          className="bg-white rounded-card max-w-md w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              {config ? '编辑API配置' : '添加API配置'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                  className={`input-field ${errors.apiKey ? 'border-red-400' : ''}`}
                  placeholder="sk-..."
                />
                {errors.apiKey && (
                  <p className="text-red-500 text-xs mt-1">{errors.apiKey}</p>
                )}
              </div>

              {/* 模型名称 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  模型名称 *
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  className={`input-field ${errors.model ? 'border-red-400' : ''}`}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                </select>
                {errors.model && (
                  <p className="text-red-500 text-xs mt-1">{errors.model}</p>
                )}
              </div>

              {/* Temperature */}
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
                  <span>保守 (0)</span>
                  <span>创意 (2)</span>
                </div>
                {errors.temperature && (
                  <p className="text-red-500 text-xs mt-1">{errors.temperature}</p>
                )}
              </div>

              {/* Max Tokens */}
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
                  className={`input-field ${errors.maxTokens ? 'border-red-400' : ''}`}
                />
                {errors.maxTokens && (
                  <p className="text-red-500 text-xs mt-1">{errors.maxTokens}</p>
                )}
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

              {/* 测试结果 */}
              <AnimatePresence>
                {testResult && (
                  <motion.div
                    className={`p-3 rounded-lg text-sm ${
                      testResult.success 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {testResult.message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 操作按钮 */}
              <div className="flex space-x-3 pt-4">
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
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="btn-secondary px-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isTesting ? '测试中...' : '测试连接'}
                </motion.button>
                
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? '保存中...' : (config ? '更新' : '创建')}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

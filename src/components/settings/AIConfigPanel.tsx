import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAIStore, DEFAULT_AI_CONFIGS, COMMON_MODELS } from '../../stores/aiStore';
import { useAppStore } from '../../stores/appStore';

export const AIConfigPanel: React.FC = () => {
  const {
    config,
    isConfigured,
    isConnecting,
    connectionError,
    globalPrompt,
    setConfig,
    setGlobalPrompt,
    clearConfig,
  } = useAIStore();
  
  const { showNotification } = useAppStore();

  const [formData, setFormData] = useState({
    apiKey: config?.apiKey || '',
    baseURL: config?.baseURL || DEFAULT_AI_CONFIGS.openai.baseURL,
    model: config?.model || DEFAULT_AI_CONFIGS.openai.model,
    temperature: config?.temperature || DEFAULT_AI_CONFIGS.openai.temperature,
    maxTokens: config?.maxTokens || DEFAULT_AI_CONFIGS.openai.maxTokens,
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [tempGlobalPrompt, setTempGlobalPrompt] = useState(globalPrompt);

  useEffect(() => {
    if (config) {
      setFormData({
        apiKey: config.apiKey,
        baseURL: config.baseURL || DEFAULT_AI_CONFIGS.openai.baseURL,
        model: config.model,
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 2000,
      });
    }
  }, [config]);

  const handleSave = async () => {
    if (!formData.apiKey.trim()) {
      showNotification('请输入 API 密钥', 'warning');
      return;
    }

    const success = await setConfig({
      apiKey: formData.apiKey.trim(),
      baseURL: formData.baseURL.trim() || undefined,
      model: formData.model,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
    });

    if (success) {
      setGlobalPrompt(tempGlobalPrompt);
      showNotification('AI 配置保存成功！', 'success');
    }
  };



  const handleClear = () => {
    if (confirm('确定要清除所有 AI 配置吗？')) {
      clearConfig();
      setFormData({
        apiKey: '',
        baseURL: DEFAULT_AI_CONFIGS.openai.baseURL,
        model: DEFAULT_AI_CONFIGS.openai.model,
        temperature: DEFAULT_AI_CONFIGS.openai.temperature,
        maxTokens: DEFAULT_AI_CONFIGS.openai.maxTokens,
      });
      setTempGlobalPrompt('');
      showNotification('AI 配置已清除', 'success');
    }
  };

  const handlePresetSelect = (preset: keyof typeof DEFAULT_AI_CONFIGS) => {
    const presetConfig = DEFAULT_AI_CONFIGS[preset];
    setFormData(prev => ({
      ...prev,
      baseURL: 'baseURL' in presetConfig ? presetConfig.baseURL : '',
      model: presetConfig.model,
      temperature: presetConfig.temperature,
      maxTokens: presetConfig.maxTokens,
    }));
  };

  return (
    <div className="space-y-6">
      {/* 预设配置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          快速配置
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(DEFAULT_AI_CONFIGS).map(([key, preset]) => (
            <motion.button
              key={key}
              onClick={() => handlePresetSelect(key as keyof typeof DEFAULT_AI_CONFIGS)}
              className="p-3 rounded-xl border border-warm-200 bg-white hover:bg-warm-50 hover:border-primary-300 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm font-medium text-text-primary">
                {preset.name}
              </div>
              <div className="text-xs text-text-muted mt-1">
                {preset.model}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* API 配置 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          API 配置
        </h3>
        <div className="space-y-4">
          {/* API 密钥 */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              API 密钥 *
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="请输入 API 密钥"
                className="input-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              API 端点 (Base URL) *
            </label>
            <input
              type="text"
              value={formData.baseURL}
              onChange={(e) => setFormData(prev => ({ ...prev, baseURL: e.target.value }))}
              placeholder="https://api.openai.com/v1 或 https://your-api.com/v1"
              className="input-field"
            />
            <p className="text-xs text-text-muted mt-1">
              支持 OpenAI 兼容的 API 端点，请求格式: /v1/chat/completions
            </p>
          </div>

          {/* 模型选择 */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              模型
            </label>
            <select
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              className="input-field"
            >
              {COMMON_MODELS.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          {/* 高级参数 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Temperature ({formData.temperature})
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
              <label className="block text-sm font-medium text-text-secondary mb-2">
                最大 Tokens
              </label>
              <input
                type="number"
                min="100"
                max="8000"
                value={formData.maxTokens}
                onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 全局提示词 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          全局提示词
        </h3>
        <textarea
          value={tempGlobalPrompt}
          onChange={(e) => setTempGlobalPrompt(e.target.value)}
          placeholder="输入全局提示词，将应用于所有角色对话..."
          rows={4}
          className="input-field resize-none"
        />
        <p className="text-xs text-text-muted mt-2">
          全局提示词将被添加到每个角色的系统提示中，用于统一控制AI的回复风格
        </p>
      </motion.div>

      {/* 错误信息 */}
      {connectionError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-red-50 border-red-200"
        >
          <p className="text-sm text-red-600">
            {connectionError}
          </p>
        </motion.div>
      )}

      {/* 操作按钮 */}
      <motion.div 
        className="flex space-x-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isConnecting}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? '保存中...' : '保存配置'}
        </motion.button>
        
        {isConfigured && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClear}
            className="btn-secondary"
          >
            清除配置
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

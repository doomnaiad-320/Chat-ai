import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAIStore, DEFAULT_AI_CONFIGS, COMMON_MODELS } from '../../stores/aiStore';

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
      alert('请输入 API 密钥');
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
      alert('配置保存成功！');
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
    <div>

      {/* 预设配置 */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{ color: '#1F2937' }}>
          快速配置
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(DEFAULT_AI_CONFIGS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetSelect(key as keyof typeof DEFAULT_AI_CONFIGS)}
              className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors"
              style={{ backgroundColor: 'white' }}
            >
              <div className="text-sm font-medium" style={{ color: '#1F2937' }}>
                {preset.name}
              </div>
              <div className="text-xs" style={{ color: '#6B7280' }}>
                {preset.model}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API 配置 */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{ color: '#1F2937' }}>
          API 配置
        </h3>
        <div className="space-y-4">
          {/* API 密钥 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              API 密钥 *
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="请输入 API 密钥"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none"
                style={{ backgroundColor: 'white' }}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              API 端点 (Base URL) *
            </label>
            <input
              type="text"
              value={formData.baseURL}
              onChange={(e) => setFormData(prev => ({ ...prev, baseURL: e.target.value }))}
              placeholder="https://api.openai.com/v1 或 https://your-api.com/v1"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none"
              style={{ backgroundColor: 'white' }}
            />
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
              支持 OpenAI 兼容的 API 端点，请求格式: /v1/chat/completions
            </p>
          </div>

          {/* 模型选择 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              模型
            </label>
            <select
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none"
              style={{ backgroundColor: 'white' }}
            >
              {COMMON_MODELS.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          {/* 高级参数 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
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
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                最大 Tokens
              </label>
              <input
                type="number"
                min="100"
                max="8000"
                value={formData.maxTokens}
                onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none"
                style={{ backgroundColor: 'white' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 全局提示词 */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{ color: '#1F2937' }}>
          全局提示词
        </h3>
        <textarea
          value={tempGlobalPrompt}
          onChange={(e) => setTempGlobalPrompt(e.target.value)}
          placeholder="输入全局提示词，将应用于所有角色对话..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none resize-none"
          style={{ backgroundColor: 'white' }}
        />
      </div>

      {/* 错误信息 */}
      {connectionError && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#FEE2E2' }}>
          <p className="text-sm" style={{ color: '#DC2626' }}>
            {connectionError}
          </p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex space-x-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isConnecting}
          className="flex-1 py-3 rounded-xl font-medium"
          style={{ backgroundColor: '#3B82F6', color: 'white' }}
        >
          {isConnecting ? '保存中...' : '保存配置'}
        </motion.button>
        
        {isConfigured && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClear}
            className="px-6 py-3 rounded-xl font-medium border border-gray-300"
            style={{ backgroundColor: 'white', color: '#6B7280' }}
          >
            清除配置
          </motion.button>
        )}
      </div>
    </div>
  );
};

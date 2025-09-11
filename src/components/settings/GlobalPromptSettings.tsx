import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import { getComplianceStats, getViolationReport, complianceMonitor } from '../../utils/aiComplianceMonitor';

export const GlobalPromptSettings: React.FC = () => {
  const {
    globalPrompts,
    aiStyleConfig,
    updateAIStyleConfig,
    toggleGlobalPrompt,
    initializeBuiltinPrompts,
    getActivePrompts,
    loading,
    error
  } = useSettingsStore();

  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [complianceStats, setComplianceStats] = useState(getComplianceStats());
  const [violationReport, setViolationReport] = useState(getViolationReport());

  useEffect(() => {
    // 初始化内置提示词
    initializeBuiltinPrompts();

    // 定期更新合规统计
    const updateStats = () => {
      setComplianceStats(getComplianceStats());
      setViolationReport(getViolationReport());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, [initializeBuiltinPrompts]);

  const activePrompts = getActivePrompts();

  const handleTogglePrompt = async (id: string, isActive: boolean) => {
    await toggleGlobalPrompt(id, isActive);
  };

  const handleStyleConfigChange = (key: keyof typeof aiStyleConfig, value: boolean | number) => {
    updateAIStyleConfig({ [key]: value });
  };

  const getPromptTypeColor = (type: string) => {
    switch (type) {
      case 'system': return '#4A90E2';
      case 'personality': return '#8B5CF6';
      case 'style': return '#10B981';
      case 'custom': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getPromptTypeName = (type: string) => {
    switch (type) {
      case 'system': return '系统';
      case 'personality': return '性格';
      case 'style': return '风格';
      case 'custom': return '自定义';
      default: return '其他';
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">AI对话风格设置</h2>
        <div className="text-sm text-text-muted">
          已激活 {activePrompts.length} 个提示词
        </div>
      </div>

      {/* AI风格配置 */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4">基础风格配置</h3>
        
        <div className="space-y-4">
          {/* 使用表情符号 */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">使用表情符号</label>
              <p className="text-xs text-text-muted">让AI回复更生动有趣</p>
            </div>
            <motion.button
              className={`w-12 h-6 rounded-full transition-colors ${
                aiStyleConfig.useEmoji ? 'bg-primary-400' : 'bg-gray-300'
              }`}
              onClick={() => handleStyleConfigChange('useEmoji', !aiStyleConfig.useEmoji)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: aiStyleConfig.useEmoji ? 24 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          {/* 使用语气词 */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">使用语气词</label>
              <p className="text-xs text-text-muted">添加"呢"、"呀"、"啦"等语气词</p>
            </div>
            <motion.button
              className={`w-12 h-6 rounded-full transition-colors ${
                aiStyleConfig.useToneWords ? 'bg-primary-400' : 'bg-gray-300'
              }`}
              onClick={() => handleStyleConfigChange('useToneWords', !aiStyleConfig.useToneWords)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: aiStyleConfig.useToneWords ? 24 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          {/* 对话式风格 */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">对话式风格</label>
              <p className="text-xs text-text-muted">模仿真人聊天的自然节奏</p>
            </div>
            <motion.button
              className={`w-12 h-6 rounded-full transition-colors ${
                aiStyleConfig.conversationalStyle ? 'bg-primary-400' : 'bg-gray-300'
              }`}
              onClick={() => handleStyleConfigChange('conversationalStyle', !aiStyleConfig.conversationalStyle)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: aiStyleConfig.conversationalStyle ? 24 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          {/* 最大句子数 */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">回复长度</label>
              <p className="text-xs text-text-muted">每次回复的最大句子数</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                className="w-8 h-8 rounded-full bg-warm-100 hover:bg-warm-200 flex items-center justify-center transition-colors"
                onClick={() => handleStyleConfigChange('maxSentences', Math.max(1, aiStyleConfig.maxSentences - 1))}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-text-secondary">-</span>
              </motion.button>
              <span className="w-8 text-center font-medium text-text-primary">{aiStyleConfig.maxSentences}</span>
              <motion.button
                className="w-8 h-8 rounded-full bg-warm-100 hover:bg-warm-200 flex items-center justify-center transition-colors"
                onClick={() => handleStyleConfigChange('maxSentences', Math.min(5, aiStyleConfig.maxSentences + 1))}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-text-secondary">+</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 全局提示词列表 */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-text-primary mb-4">全局提示词</h3>
        
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">加载中...</p>
          </div>
        )}

        {error && (
          <motion.div 
            className="card bg-red-50 border-red-200 mb-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}

        <div className="space-y-3">
          {globalPrompts.map((prompt) => (
            <motion.div
              key={prompt.id}
              className={`border rounded-xl p-4 transition-all ${
                prompt.isActive ? 'border-primary-200 bg-primary-50' : 'border-warm-200 bg-warm-50'
              }`}
              layout
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-text-primary">{prompt.name}</h4>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getPromptTypeColor(prompt.type) }}
                    >
                      {getPromptTypeName(prompt.type)}
                    </span>
                    <span className="text-xs text-text-muted">优先级: {prompt.priority}</span>
                  </div>
                  
                  {showDetails === prompt.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-text-secondary bg-white rounded-lg p-3 mb-3"
                    >
                      {prompt.content}
                    </motion.div>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <motion.button
                      className="text-xs text-primary-600 hover:text-primary-700 transition-colors"
                      onClick={() => setShowDetails(showDetails === prompt.id ? null : prompt.id)}
                      whileTap={{ scale: 0.95 }}
                    >
                      {showDetails === prompt.id ? '收起' : '查看详情'}
                    </motion.button>
                  </div>
                </div>
                
                <motion.button
                  className={`w-12 h-6 rounded-full transition-colors ${
                    prompt.isActive ? 'bg-primary-400' : 'bg-gray-300'
                  }`}
                  onClick={() => handleTogglePrompt(prompt.id, !prompt.isActive)}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                    animate={{ x: prompt.isActive ? 24 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {globalPrompts.length === 0 && !loading && (
          <div className="text-center py-8 text-text-muted">
            <p>暂无全局提示词</p>
            <p className="text-sm mt-1">系统将自动加载内置提示词</p>
          </div>
        )}
      </motion.div>

      {/* 当前激活的提示词预览 */}
      {activePrompts.length > 0 && (
        <motion.div 
          className="card bg-green-50 border-green-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-green-800 mb-3">当前激活的提示词</h3>
          <div className="space-y-2">
            {activePrompts.map((prompt, index) => (
              <div key={prompt.id} className="flex items-center space-x-2">
                <span className="text-sm font-medium text-green-700">
                  {index + 1}. {prompt.name}
                </span>
                <span className="text-xs text-green-600">
                  (优先级: {prompt.priority})
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI合规监控面板 */}
      <motion.div 
        className="card bg-blue-50 border-blue-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-800">AI回复合规监控</h3>
          <motion.button
            className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm hover:bg-primary-200 transition-colors"
            onClick={async () => {
              await complianceMonitor.resetStats();
              setComplianceStats(getComplianceStats());
              setViolationReport(getViolationReport());
            }}
            whileTap={{ scale: 0.95 }}
          >
            重置统计
          </motion.button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{complianceStats.lengthViolations}</div>
            <div className="text-xs text-gray-600">长度违规</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{complianceStats.sentenceViolations}</div>
            <div className="text-xs text-gray-600">句子违规</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{complianceStats.formatViolations}</div>
            <div className="text-xs text-gray-600">格式违规</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{complianceStats.keywordViolations}</div>
            <div className="text-xs text-gray-600">关键词违规</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">提示词强度等级</span>
            <span className="text-sm text-blue-600">{complianceStats.promptStrengthLevel}/5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(complianceStats.promptStrengthLevel / 5) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            强度等级会根据违规情况自动调整
          </div>
        </div>

        {complianceStats.totalViolations > 0 && (
          <div className="mt-4 bg-white rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">违规报告</h4>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
              {violationReport}
            </pre>
          </div>
        )}

        {complianceStats.totalViolations === 0 && (
          <div className="mt-4 text-center py-4">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-sm text-green-600 font-medium">AI回复完全合规</div>
            <div className="text-xs text-text-muted">暂无违规记录</div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

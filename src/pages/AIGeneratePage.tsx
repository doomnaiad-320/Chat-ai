import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacterStore } from '../stores/characterStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAppStore } from '../stores/appStore';
import { generateCharacter, EXAMPLE_INPUTS, type GeneratedCharacterData } from '../services/aiCharacterGenerator';
import { GeneratedCharacterPreview } from '../components/ai/GeneratedCharacterPreview';
import { useNavigate } from 'react-router-dom';

export const AIGeneratePage: React.FC = () => {
  const navigate = useNavigate();
  const { addCharacter } = useCharacterStore();
  const { currentAPIConfig } = useSettingsStore();
  const { showNotification, setCurrentTab } = useAppStore();

  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCharacter, setGeneratedCharacter] = useState<GeneratedCharacterData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  // 处理生成角色
  const handleGenerate = async () => {
    if (!currentAPIConfig) {
      showNotification('请先在设置中配置AI API', 'error');
      return;
    }

    if (!userInput.trim()) {
      showNotification('请输入角色描述', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const character = await generateCharacter(userInput, currentAPIConfig);
      setGeneratedCharacter(character);
      setShowPreview(true);
      showNotification('角色生成成功！', 'success');
    } catch (error) {
      console.error('生成角色失败:', error);
      showNotification(
        error instanceof Error ? error.message : '生成失败，请重试',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // 保存角色
  const handleSaveCharacter = async (character: GeneratedCharacterData) => {
    try {
      await addCharacter(character);
      showNotification(`角色「${character.name}」已添加到通讯录`, 'success');
      
      // 清空状态
      setGeneratedCharacter(null);
      setShowPreview(false);
      setUserInput('');
      setSelectedExample(null);
      
      // 跳转到通讯录页面
      setCurrentTab('contacts');
      navigate('/');
    } catch (error) {
      console.error('保存角色失败:', error);
      showNotification('保存角色失败', 'error');
    }
  };

  // 取消预览
  const handleCancelPreview = () => {
    setShowPreview(false);
    // 保留生成的数据，允许用户重新编辑
  };

  // 选择示例
  const handleSelectExample = (index: number) => {
    setSelectedExample(index);
    setUserInput(EXAMPLE_INPUTS[index]);
  };

  return (
    <div className="h-screen bg-warm-50 overflow-hidden">
      {/* 顶部导航栏 */}
      <div className="navbar">
        <h1 className="text-lg font-semibold text-text-primary">AI 生成角色卡</h1>
      </div>

      {/* 主要内容区域 */}
      <div className="h-full overflow-y-auto">
        <div className="px-4 pt-20 pb-32">
          <AnimatePresence mode="wait">
            {!showPreview ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* 输入区域 */}
                <div className="card mb-4">
                  <h3 className="text-base font-medium text-text-primary mb-3">
                    描述你想要的角色
                  </h3>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="例如：一个喜欢猫的温柔女孩，有点内向但很善良..."
                    className="input-field resize-none"
                    rows={4}
                    disabled={isGenerating}
                  />
                  <p className="text-xs text-text-muted mt-2">
                    描述角色的性格、爱好、背景等信息，AI会为你生成完整的角色卡
                  </p>
                </div>

                {/* 示例选择 */}
                <div className="card mb-4">
                  <h3 className="text-base font-medium text-text-primary mb-3">
                    快速示例
                  </h3>
                  <div className="space-y-2">
                    {EXAMPLE_INPUTS.map((example, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSelectExample(index)}
                        className={`w-full p-3 rounded-xl text-left text-sm transition-all ${
                          selectedExample === index
                            ? 'bg-primary-100 border-primary-300'
                            : 'bg-warm-50 hover:bg-warm-100'
                        } border`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="text-text-primary">{example}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 生成按钮 */}
                <motion.button
                  onClick={handleGenerate}
                  disabled={isGenerating || !userInput.trim()}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  whileTap={{ scale: 0.98 }}
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin mr-2">⚙️</span>
                      生成中...
                    </span>
                  ) : (
                    '生成角色卡'
                  )}
                </motion.button>

                {/* 之前生成的结果 */}
                {generatedCharacter && !showPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <button
                      onClick={() => setShowPreview(true)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      查看上次生成的角色 →
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* 角色预览和编辑 */}
                <GeneratedCharacterPreview
                  character={generatedCharacter}
                  onSave={handleSaveCharacter}
                  onCancel={handleCancelPreview}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIGeneratePage;

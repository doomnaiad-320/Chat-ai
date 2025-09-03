import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character } from '../../types';
import { useCharacterStore } from '../../stores/characterStore';
import { useAppStore } from '../../stores/appStore';
import { ImageStorage } from '../../utils/storage';

interface CharacterFormProps {
  character?: Character;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (character: Character) => void;
}

interface FormData {
  name: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  likes: string;
  dislikes: string;
  background: string;
  voiceStyle: 'cute' | 'serious' | 'humorous' | 'gentle' | 'energetic';
}

const initialFormData: FormData = {
  name: '',
  gender: 'female',
  avatar: undefined,
  likes: '',
  dislikes: '',
  background: '',
  voiceStyle: 'cute',
};

export const CharacterForm: React.FC<CharacterFormProps> = ({
  character,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { addCharacter, updateCharacter, loading } = useCharacterStore();
  const { showNotification } = useAppStore();

  // 初始化表单数据
  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        gender: character.gender,
        avatar: character.avatar,
        likes: character.likes.join(', '),
        dislikes: character.dislikes.join(', '),
        background: character.background,
        voiceStyle: character.voiceStyle,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [character, isOpen]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '角色名称不能为空';
    } else if (formData.name.length > 20) {
      newErrors.name = '角色名称不能超过20个字符';
    }

    if (!formData.background.trim()) {
      newErrors.background = '背景信息不能为空';
    } else if (formData.background.length > 500) {
      newErrors.background = '背景信息不能超过500个字符';
    }

    if (!formData.likes.trim()) {
      newErrors.likes = '喜好不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理头像上传
  const handleAvatarUpload = async () => {
    try {
      setIsUploading(true);
      const avatar = await ImageStorage.selectImage();
      setFormData(prev => ({ ...prev, avatar }));
      showNotification('头像上传成功', 'success');
    } catch (error) {
      showNotification('头像上传失败', 'error');
    } finally {
      setIsUploading(false);
    }
  };



  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // 将字符串转换为数组
      const characterData = {
        ...formData,
        likes: formData.likes.split(',').map(item => item.trim()).filter(item => item),
        dislikes: formData.dislikes.split(',').map(item => item.trim()).filter(item => item),
      };

      let savedCharacter: Character;

      if (character) {
        // 更新角色
        await updateCharacter(character.id, characterData);
        savedCharacter = { ...character, ...characterData, updatedAt: new Date() };
        showNotification('角色更新成功', 'success');
      } else {
        // 创建新角色
        await addCharacter(characterData);
        // 创建一个临时的角色对象用于回调
        savedCharacter = {
          ...characterData,
          id: `temp_${Date.now()}`, // 临时ID，实际ID由store生成
          createdAt: new Date(),
          updatedAt: new Date()
        };
        showNotification('角色创建成功', 'success');
      }

      onClose();
      if (onSave) {
        onSave(savedCharacter);
      }
    } catch (error) {
      showNotification(character ? '角色更新失败' : '角色创建失败', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(209, 231, 254, 0.3)'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-xl font-medium mb-6" style={{ color: '#6B7280' }}>
              {character ? '编辑角色' : '创建角色'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 头像上传 */}
              <div className="flex flex-col items-center mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-medium mb-3"
                  style={{
                    backgroundColor: '#F0F4FF',
                    color: '#6B7280',
                    boxShadow: '0 4px 12px rgba(240, 244, 255, 0.4)'
                  }}
                >
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="头像预览"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>{formData.name.charAt(0) || '?'}</span>
                  )}
                </div>

                <motion.button
                  type="button"
                  className="font-medium py-2 px-4 rounded-xl transition-all duration-300"
                  style={{
                    backgroundColor: '#D1E7FE',
                    color: '#4A90E2',
                    boxShadow: '0 2px 8px rgba(209, 231, 254, 0.3)'
                  }}
                  onClick={handleAvatarUpload}
                  disabled={isUploading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C1D7EE'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D1E7FE'}
                >
                  {isUploading ? '上传中...' : '选择头像'}
                </motion.button>
              </div>

              {/* 基本信息 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                  角色名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: errors.name ? '#EF4444' : '#E8EFFF',
                    color: '#6B7280',
                    focusRingColor: '#D1E7FE'
                  }}
                  placeholder="输入角色名称"
                  maxLength={20}
                />
                {errors.name && (
                  <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.name}</p>
                )}
              </div>

              {/* 性别选择 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                  性别
                </label>
                <div className="flex space-x-3">
                  {[
                    { value: 'female', label: '女', color: '#F3D9FF' },
                    { value: 'male', label: '男', color: '#D1E7FE' },
                    { value: 'other', label: '其他', color: '#BAF1E3' }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center cursor-pointer px-4 py-2 rounded-xl transition-all duration-200"
                      style={{
                        backgroundColor: formData.gender === option.value ? option.color : '#F8FAFF',
                        border: `2px solid ${formData.gender === option.value ? option.color : '#E8EFFF'}`,
                        color: '#6B7280'
                      }}
                    >
                      <input
                        type="radio"
                        value={option.value}
                        checked={formData.gender === option.value}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          gender: e.target.value as any
                        }))}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 语音风格 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                  语音风格
                </label>
                <select
                  value={formData.voiceStyle}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    voiceStyle: e.target.value as any
                  }))}
                  className="w-full px-4 py-3 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: '#E8EFFF',
                    color: '#6B7280'
                  }}
                >
                  <option value="cute">🌸 可爱</option>
                  <option value="serious">🎯 严肃</option>
                  <option value="humorous">😄 幽默</option>
                  <option value="gentle">💕 温柔</option>
                  <option value="energetic">⚡ 活泼</option>
                </select>
              </div>

              {/* 喜好 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                  喜好 *
                </label>
                <input
                  type="text"
                  value={formData.likes}
                  onChange={(e) => setFormData(prev => ({ ...prev, likes: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: '#E8EFFF',
                    color: '#6B7280'
                  }}
                  placeholder="请输入喜好，多个喜好用逗号分隔"
                />
                {errors.likes && (
                  <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{errors.likes}</p>
                )}
              </div>

              {/* 厌恶 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                  厌恶
                </label>
                <input
                  type="text"
                  value={formData.dislikes}
                  onChange={(e) => setFormData(prev => ({ ...prev, dislikes: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: '#E8EFFF',
                    color: '#6B7280'
                  }}
                  placeholder="请输入厌恶的事物，多个用逗号分隔"
                />
              </div>

              {/* 背景信息 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                  背景信息 *
                </label>
                <textarea
                  value={formData.background}
                  onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border min-h-[120px] resize-none transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: errors.background ? '#EF4444' : '#E8EFFF',
                    color: '#6B7280'
                  }}
                  placeholder="描述角色的背景故事、性格特点、说话风格等..."
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  {errors.background && (
                    <p className="text-xs" style={{ color: '#EF4444' }}>{errors.background}</p>
                  )}
                  <p className="text-xs ml-auto" style={{ color: '#9CA3AF' }}>
                    {formData.background.length}/500
                  </p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3 pt-6 pb-20">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-6 rounded-2xl font-medium transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    border: '2px solid #E8EFFF',
                    color: '#6B7280'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFF';
                    e.currentTarget.style.borderColor = '#D1E7FE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.borderColor = '#E8EFFF';
                  }}
                >
                  取消
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-6 rounded-2xl font-medium transition-all duration-300"
                  style={{
                    backgroundColor: loading ? '#E8EFFF' : '#D1E7FE',
                    color: loading ? '#9CA3AF' : '#4A90E2',
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(209, 231, 254, 0.3)',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  whileHover={loading ? {} : { scale: 1.02 }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#C1D7EE';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(209, 231, 254, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#D1E7FE';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(209, 231, 254, 0.3)';
                    }
                  }}
                >
                  {loading ? '保存中...' : (character ? '更新角色' : '创建角色')}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

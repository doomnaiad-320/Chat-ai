import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X } from 'lucide-react';
import { useCharacterStore } from '../../stores/characterStore';
import { useAppStore } from '../../stores/appStore';
import { ImageStorage } from '../../utils/imageStorage';
import type { Character } from '../../types';

interface AvatarEditorProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  showEditButton?: boolean;
  className?: string;
}

export const AvatarEditor: React.FC<AvatarEditorProps> = ({
  character,
  size = 'medium',
  showEditButton = true,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { updateCharacter } = useCharacterStore();
  const { showNotification } = useAppStore();

  // 根据尺寸设置样式
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-base',
    large: 'w-16 h-16 text-lg'
  };



  // 处理头像上传
  const handleAvatarUpload = async () => {
    try {
      setIsUploading(true);
      const avatar = await ImageStorage.selectImage();
      
      await updateCharacter(character.id, { avatar });
      showNotification('头像更新成功！', 'success');
      setIsEditing(false);
    } catch (error) {
      showNotification('头像上传失败，请重试', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // 移除头像
  const handleRemoveAvatar = async () => {
    try {
      await updateCharacter(character.id, { avatar: undefined });
      showNotification('头像已移除', 'success');
      setIsEditing(false);
    } catch (error) {
      showNotification('移除头像失败', 'error');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 头像显示 */}
      <motion.div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium relative overflow-hidden cursor-pointer`}
        style={{
          backgroundColor: character.gender === 'female' ? '#F3D9FF' :
                          character.gender === 'male' ? '#D1E7FE' : '#BAF1E3'
        }}
        whileHover={{ scale: showEditButton ? 1.05 : 1 }}
        whileTap={{ scale: showEditButton ? 0.95 : 1 }}
        onClick={() => showEditButton && setIsEditing(true)}
      >
        {character.avatar ? (
          <img
            src={character.avatar}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span style={{
            color: character.gender === 'female' ? '#8B5CF6' :
                   character.gender === 'male' ? '#4A90E2' : '#10B981'
          }}>
            {character.name.charAt(0)}
          </span>
        )}

        {/* 编辑按钮覆盖层 */}
        {showEditButton && (
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
            whileHover={{ opacity: 1 }}
          >
            <Camera size={size === 'small' ? 12 : size === 'medium' ? 16 : 20} className="text-white" />
          </motion.div>
        )}
      </motion.div>

      {/* 编辑模态框 */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 标题 */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">编辑头像</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* 当前头像预览 */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-medium text-xl"
                  style={{
                    backgroundColor: character.gender === 'female' ? '#F3D9FF' :
                                    character.gender === 'male' ? '#D1E7FE' : '#BAF1E3'
                  }}
                >
                  {character.avatar ? (
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span style={{
                      color: character.gender === 'female' ? '#8B5CF6' :
                             character.gender === 'male' ? '#4A90E2' : '#10B981'
                    }}>
                      {character.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3">
                <motion.button
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
                  onClick={handleAvatarUpload}
                  disabled={isUploading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload size={18} />
                  <span>{isUploading ? '上传中...' : '选择新头像'}</span>
                </motion.button>

                {character.avatar && (
                  <motion.button
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    onClick={handleRemoveAvatar}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X size={18} />
                    <span>移除头像</span>
                  </motion.button>
                )}

                <motion.button
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
                  onClick={() => setIsEditing(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  取消
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character } from '../../types';

interface DeleteConfirmDialogProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (character: Character) => Promise<void>;
  conversationCount?: number;
  messageCount?: number;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  character,
  isOpen,
  onClose,
  onConfirm,
  conversationCount = 0,
  messageCount = 0
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (!character) return null;

  const expectedConfirmText = `删除${character.name}`;
  const isConfirmValid = confirmText === expectedConfirmText;

  const handleConfirm = async () => {
    if (!isConfirmValid || isDeleting) return;

    try {
      setIsDeleting(true);
      await onConfirm(character);
      onClose();
      setConfirmText('');
    } catch (error) {
      console.error('删除角色失败:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    onClose();
    setConfirmText('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            {/* 对话框 */}
            <motion.div
              className="bg-white rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 警告图标 */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-red-500">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* 标题 */}
              <h2 className="text-xl font-bold text-center mb-2 text-gray-800">
                确认删除角色
              </h2>

              {/* 角色信息 */}
              <div className="flex items-center justify-center mb-4 p-3 bg-gray-50 rounded-2xl">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium mr-3"
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
                <div>
                  <h3 className="font-medium text-gray-800">{character.name}</h3>
                  <p className="text-sm text-gray-500">{character.background}</p>
                </div>
              </div>

              {/* 警告信息 */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                <div className="flex items-start">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-500 mt-0.5 mr-3 flex-shrink-0">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-red-800 mb-2">⚠️ 此操作不可撤销！</p>
                    <p className="text-red-700 mb-2">删除角色将会：</p>
                    <ul className="text-red-600 space-y-1 ml-4">
                      <li>• 永久删除角色 <strong>{character.name}</strong></li>
                      <li>• 删除与该角色的 <strong>{conversationCount}</strong> 个对话</li>
                      <li>• 删除 <strong>{messageCount}</strong> 条聊天记录</li>
                      <li>• 清除所有相关数据</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 确认输入 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  请输入 <span className="font-bold text-red-600">"{expectedConfirmText}"</span> 来确认删除：
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={expectedConfirmText}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  disabled={isDeleting}
                />
                {confirmText && !isConfirmValid && (
                  <p className="text-red-500 text-sm mt-1">请输入正确的确认文本</p>
                )}
              </div>

              {/* 按钮组 */}
              <div className="flex space-x-3">
                <motion.button
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium transition-colors"
                  onClick={handleClose}
                  disabled={isDeleting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  取消
                </motion.button>
                
                <motion.button
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    isConfirmValid && !isDeleting
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={handleConfirm}
                  disabled={!isConfirmValid || isDeleting}
                  whileHover={isConfirmValid && !isDeleting ? { scale: 1.02 } : {}}
                  whileTap={isConfirmValid && !isDeleting ? { scale: 0.98 } : {}}
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      删除中...
                    </div>
                  ) : (
                    '确认删除'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../stores/characterStore';
import { useAppStore } from '../stores/appStore';
import type { Character } from '../types';
import { useStaggeredAnimation } from '../hooks/useAnimation';
import { CharacterForm } from '../components/character/CharacterForm';

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (character: Character) => void;
  onChat: (character: Character) => void;
  animationProps: any;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onEdit,
  onDelete,
  onChat,
  animationProps
}) => {
  const [showActions, setShowActions] = useState(false);

  const getVoiceStyleText = (style: string) => {
    const styleMap = {
      cute: '可爱',
      serious: '严肃',
      humorous: '幽默',
      gentle: '温柔',
      energetic: '活泼'
    };
    return styleMap[style as keyof typeof styleMap] || style;
  };

  const getGenderText = (gender: string) => {
    const genderMap = {
      male: '男',
      female: '女',
      other: '其他'
    };
    return genderMap[gender as keyof typeof genderMap] || gender;
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(232, 239, 255, 0.5)',
        boxShadow: '0 4px 12px rgba(209, 231, 254, 0.15)',
        ...animationProps.style
      }}
      whileHover={{
        y: -4,
        scale: 1.02,
        boxShadow: '0 8px 24px rgba(209, 231, 254, 0.25)'
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      {/* 背景渐变 */}
      <div
        className="absolute inset-0 opacity-30 rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, #F0F4FF 0%, #F8F0FF 50%, #F0FDF9 100%)'
        }}
      ></div>

      <div className="relative z-10">
        {/* 头像和基本信息 */}
        <div className="flex items-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium mr-4"
            style={{
              backgroundColor: '#F0F4FF',
              color: '#6B7280',
              boxShadow: '0 4px 12px rgba(240, 244, 255, 0.4)'
            }}
          >
            {character.avatar ? (
              <img
                src={character.avatar}
                alt={character.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>{character.name.charAt(0)}</span>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1" style={{ color: '#6B7280' }}>
              {character.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm" style={{ color: '#9CA3AF' }}>
              <span>{getGenderText(character.gender)}</span>
              <span>•</span>
              <span>{getVoiceStyleText(character.voiceStyle)}</span>
            </div>
          </div>
        </div>

        {/* 背景信息 */}
        {character.background && (
          <p className="text-sm mb-3 line-clamp-2" style={{ color: '#9CA3AF' }}>
            {character.background}
          </p>
        )}

        {/* 喜好标签 */}
        {character.likes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs mb-2 font-medium" style={{ color: '#9CA3AF' }}>💚 喜欢</p>
            <div className="flex flex-wrap gap-1">
              {character.likes.slice(0, 3).map((like, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: '#BAF1E3',
                    color: '#10B981'
                  }}
                >
                  {like}
                </span>
              ))}
              {character.likes.length > 3 && (
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: '#F8FAFF',
                    color: '#9CA3AF'
                  }}
                >
                  +{character.likes.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 厌恶标签 */}
        {character.dislikes.length > 0 && (
          <div className="mb-4">
            <p className="text-xs mb-2 font-medium" style={{ color: '#9CA3AF' }}>💔 讨厌</p>
            <div className="flex flex-wrap gap-1">
              {character.dislikes.slice(0, 3).map((dislike, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: '#FED7D7',
                    color: '#E53E3E'
                  }}
                >
                  {dislike}
                </span>
              ))}
              {character.dislikes.length > 3 && (
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: '#F8FAFF',
                    color: '#9CA3AF'
                  }}
                >
                  +{character.dislikes.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              className="flex space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: '#D1E7FE',
                  color: '#4A90E2',
                  boxShadow: '0 2px 8px rgba(209, 231, 254, 0.3)'
                }}
                onClick={() => onChat(character)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C1D7EE'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D1E7FE'}
              >
                💬 聊天
              </motion.button>
              
              <motion.button
                className="py-2 px-3 rounded-xl text-sm font-medium border-2 transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderColor: '#F3D9FF',
                  color: '#8B5CF6'
                }}
                onClick={() => onEdit(character)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3D9FF';
                  e.currentTarget.style.borderColor = '#E3C9EF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.borderColor = '#F3D9FF';
                }}
              >
                ✏️ 编辑
              </motion.button>

              <motion.button
                className="py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: '#FED7D7',
                  color: '#E53E3E',
                  boxShadow: '0 2px 8px rgba(254, 215, 215, 0.3)'
                }}
                onClick={() => onDelete(character)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEC7C7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FED7D7'}
              >
                🗑️ 删除
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const ContactsPage: React.FC = () => {
  const { characters, loadCharacters, deleteCharacter, setCurrentCharacter } = useCharacterStore();
  const { showNotification } = useAppStore();

  // 确保 characters 是数组
  const safeCharacters = Array.isArray(characters) ? characters : [];
  const { getItemAnimation } = useStaggeredAnimation(safeCharacters, 'scale-in', 100);
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>(undefined);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setIsFormOpen(true);
  };

  const handleDeleteCharacter = async (character: Character) => {
    if (window.confirm(`确定要删除角色 "${character.name}" 吗？`)) {
      try {
        await deleteCharacter(character.id);
        showNotification('角色删除成功', 'success');
      } catch (error) {
        showNotification('删除失败', 'error');
      }
    }
  };

  const handleChatWithCharacter = (character: Character) => {
    setCurrentCharacter(character);
    navigate('/chat');
    showNotification(`开始与 ${character.name} 聊天`, 'success');
  };

  const handleCreateCharacter = () => {
    setEditingCharacter(undefined);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCharacter(undefined);
  };

  const handleCharacterSave = (character: Character) => {
    // 角色保存后的回调，可以在这里做一些额外处理
    loadCharacters(); // 重新加载角色列表
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FAFBFF' }}>
      {/* 顶部导航栏 */}
      <div
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(232, 239, 255, 0.3)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <h1 className="text-xl font-medium" style={{ color: '#6B7280' }}>通讯录</h1>

        <motion.button
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: '#F3D9FF',
            color: '#8B5CF6',
            boxShadow: '0 2px 8px rgba(243, 217, 255, 0.3)'
          }}
          onClick={handleCreateCharacter}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E3C9EF'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3D9FF'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </motion.button>
      </div>

      {/* 角色列表 */}
      <div className="flex-1 overflow-y-auto pt-20 pb-24 px-6">
        {safeCharacters.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="w-32 h-32 rounded-3xl flex items-center justify-center mb-8"
              style={{
                backgroundColor: '#F8F0FF',
                boxShadow: '0 4px 12px rgba(248, 240, 255, 0.4)'
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ color: '#8B5CF6' }}>
                <path 
                  d="M16 4C18.2091 4 20 5.79086 20 8C20 10.2091 18.2091 12 16 12C13.7909 12 12 10.2091 12 8C12 5.79086 13.7909 4 16 4Z" 
                  fill="currentColor"
                />
                <path 
                  d="M12 14C16.4183 14 20 17.5817 20 22H12H4C4 17.5817 7.58172 14 12 14Z" 
                  fill="currentColor"
                />
                <circle cx="8" cy="8" r="4" fill="currentColor"/>
              </svg>
            </div>

            <h3 className="text-2xl font-medium mb-3" style={{ color: '#6B7280' }}>
              还没有角色
            </h3>

            <p className="mb-8 max-w-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
              创建你的第一个AI角色，开始奇妙的虚拟友谊！🤖💕
            </p>

            <div className="space-y-4">
              <motion.button
                className="font-medium py-4 px-8 rounded-2xl transition-all duration-300"
                style={{
                  backgroundColor: '#F3D9FF',
                  color: '#8B5CF6',
                  boxShadow: '0 4px 12px rgba(243, 217, 255, 0.3)'
                }}
                onClick={handleCreateCharacter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E3C9EF';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(243, 217, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3D9FF';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(243, 217, 255, 0.3)';
                }}
              >
                创建角色 ✨
              </motion.button>

              <motion.button
                className="bg-white/60 backdrop-blur-md border-2 font-medium py-3 px-8 rounded-2xl transition-all duration-300"
                style={{
                  borderColor: '#E8EFFF',
                  color: '#6B7280',
                  boxShadow: '0 2px 8px rgba(232, 239, 255, 0.2)'
                }}
                onClick={() => {/* TODO: 导入角色功能 */}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFF';
                  e.currentTarget.style.borderColor = '#D1E7FE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.borderColor = '#E8EFFF';
                }}
              >
                导入角色 📥
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeCharacters.map((character, index) => (
              <CharacterCard
                key={character.id}
                character={character}
                onEdit={handleEditCharacter}
                onDelete={handleDeleteCharacter}
                onChat={handleChatWithCharacter}
                animationProps={getItemAnimation(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 角色创建/编辑表单 */}
      <CharacterForm
        character={editingCharacter}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleCharacterSave}
      />
    </div>
  );
};

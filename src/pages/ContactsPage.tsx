import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '../stores/characterStore';
import { useAppStore } from '../stores/appStore';
import type { Character } from '../types/index';
import { useStaggeredAnimation } from '../hooks/useAnimation';
import { CharacterForm } from '../components/character/CharacterForm';
import { DeleteConfirmDialog } from '../components/character/DeleteConfirmDialog';

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
  // 移动端不需要悬停状态，直接显示操作按钮

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

  const handleCardClick = () => {
    onChat(character);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
    onEdit(character);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发卡片点击
    onDelete(character);
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-4 transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(232, 239, 255, 0.5)',
        boxShadow: '0 2px 8px rgba(232, 239, 255, 0.2)',
        ...animationProps.style
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 4px 12px rgba(232, 239, 255, 0.3)'
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
    >
      <div className="flex items-center">
        {/* 头像 */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium mr-3 flex-shrink-0"
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

        {/* 信息区域 */}
        <div className="flex-1 min-w-0">
          {/* 第一行：昵称 */}
          <h3 className="font-medium truncate mb-1" style={{ color: '#6B7280' }}>
            {character.name}
          </h3>

          {/* 第二行：背景信息 */}
          <p className="text-sm truncate" style={{ color: '#9CA3AF' }}>
            {character.background || `${getGenderText(character.gender)} • ${getVoiceStyleText(character.voiceStyle)}`}
          </p>
        </div>

        {/* 操作按钮组 - 移动端直接显示 */}
        <div className="flex items-center space-x-2 ml-2">
          {/* 编辑按钮 */}
          <motion.button
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: '#D1E7FE',
              color: '#4A90E2'
            }}
            onClick={handleEditClick}
            whileTap={{ scale: 0.9 }}
            title="编辑角色"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>

          {/* 删除按钮 */}
          <motion.button
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: '#FED7D7',
              color: '#E53E3E'
            }}
            onClick={handleDeleteClick}
            whileTap={{ scale: 0.9 }}
            title="删除角色"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>
      </div>

      {/* 注释：喜好和厌恶标签（暂时隐藏，后续功能会用到） */}
      {/*
      {character.likes.length > 0 && (
        <div className="mt-3">
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

      {character.dislikes.length > 0 && (
        <div className="mt-3">
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
      */}
    </motion.div>
  );
};

export const ContactsPage: React.FC = () => {
  const {
    characters,
    loadCharacters,
    deleteCharacterWithData,
    getCharacterStats,
    setCurrentCharacter
  } = useCharacterStore();
  const { showNotification } = useAppStore();

  // 确保 characters 是数组
  const safeCharacters = Array.isArray(characters) ? characters : [];
  const { getItemAnimation } = useStaggeredAnimation(safeCharacters, 'scale-in', 100);
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCharacter, setDeletingCharacter] = useState<Character | null>(null);
  const [characterStats, setCharacterStats] = useState<{ conversationCount: number; messageCount: number }>({
    conversationCount: 0,
    messageCount: 0
  });

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setIsFormOpen(true);
  };

  const handleDeleteCharacter = async (character: Character) => {
    try {
      // 获取角色统计信息
      const stats = await getCharacterStats(character.id);
      setCharacterStats(stats);
      setDeletingCharacter(character);
      setDeleteDialogOpen(true);
    } catch (error) {
      showNotification('获取角色信息失败', 'error');
    }
  };

  const handleConfirmDelete = async (character: Character) => {
    try {
      await deleteCharacterWithData(character.id);
      showNotification(`角色 "${character.name}" 及相关数据已删除`, 'success');
      setDeleteDialogOpen(false);
      setDeletingCharacter(null);
    } catch (error) {
      showNotification('删除失败', 'error');
      throw error;
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeletingCharacter(null);
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

  const handleCharacterSave = async (character: Character) => {
    // 角色保存后的回调，可以在这里做一些额外处理
    await loadCharacters(); // 重新加载角色列表

    // 如果是新创建的角色，自动开始聊天
    if (!editingCharacter) {
      // 这是新创建的角色，等待一下让store更新完成，然后获取真实的角色数据
      setTimeout(async () => {
        await loadCharacters(); // 确保获取最新的角色列表
        // 通过名字找到新创建的角色（因为临时ID可能不准确）
        const newCharacter = characters.find(c => c.name === character.name);

        if (newCharacter) {
          setCurrentCharacter(newCharacter);
          navigate('/chat');
          showNotification(`开始与 ${newCharacter.name} 聊天`, 'success');
        }
      }, 300); // 稍微延迟一下，让store更新完成
    }
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
      <div className="flex-1 overflow-y-auto pt-20 pb-32 px-6">
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
              创建你的第一个AI角色，开始奇妙的虚拟友谊！
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
          <div className="space-y-3">
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

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        character={deletingCharacter}
        isOpen={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        conversationCount={characterStats.conversationCount}
        messageCount={characterStats.messageCount}
      />
    </div>
  );
};

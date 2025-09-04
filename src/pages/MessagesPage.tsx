import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { useCharacterStore } from '../stores/characterStore';
import { useAppStore } from '../stores/appStore';
import { useScrollAnimation } from '../hooks/useAnimation';
import { AvatarEditor } from '../components/character/AvatarEditor';

interface ConversationItemProps {
  conversationId: string;
  characterId: string;
  lastMessage?: string;
  lastMessageTime: Date;
  unreadCount?: number;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  characterId,
  lastMessage = '开始新对话...',
  lastMessageTime,
  unreadCount = 0,
  onClick
}) => {
  const { characters } = useCharacterStore();
  const character = characters.find(c => c.id === characterId);
  const { ref, animationClass } = useScrollAnimation('fade-in');

  if (!character) return null;

  const formatTime = (date: Date | string | number) => {
    // 确保date是一个有效的Date对象
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // 检查日期是否有效
    if (isNaN(dateObj.getTime())) {
      return '未知时间';
    }
    
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return dateObj.toLocaleDateString();
  };

  return (
    <motion.div
      ref={ref as any}
      className={`${animationClass} cursor-pointer`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div
        className="flex items-center p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.02] transform"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderColor: '#E8EFFF',
          boxShadow: '0 2px 8px rgba(232, 239, 255, 0.2)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(232, 239, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(232, 239, 255, 0.2)';
        }}
      >
        {/* 头像 - 可编辑 */}
        <div className="relative">
          <AvatarEditor
            character={character}
            size="medium"
            showEditButton={true}
          />

          {/* 在线状态指示器 */}
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
            style={{ backgroundColor: '#10B981' }}
          ></div>
        </div>

        {/* 对话信息 */}
        <div className="flex-1 ml-4 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium truncate" style={{ color: '#6B7280' }}>
              {character.name}
            </h3>
            <span className="text-xs flex-shrink-0" style={{ color: '#9CA3AF' }}>
              {formatTime(lastMessageTime)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm truncate flex-1" style={{ color: '#9CA3AF' }}>
              {lastMessage}
            </p>

            {unreadCount > 0 && (
              <motion.div
                className="ml-2 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
                style={{ backgroundColor: '#EF4444' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const MessagesPage: React.FC = () => {
  const { conversations, loadConversations, setCurrentConversation } = useChatStore();
  const { characters, loadCharacters, setCurrentCharacter } = useCharacterStore();
  const { setCurrentTab } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
    loadCharacters();
  }, [loadConversations, loadCharacters]);

  const handleConversationClick = async (conversationId: string) => {
    await setCurrentConversation(conversationId);
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      const character = characters.find(c => c.id === conversation.characterId);
      if (character) {
        setCurrentCharacter(character);
        navigate('/chat');
      }
    }
  };

  const handleNewChat = () => {
    // 跳转到通讯录页面选择角色
    setCurrentTab('contacts');
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#FAFBFF' }}>
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b" style={{ borderColor: '#E8EFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-medium" style={{ color: '#6B7280' }}>
            信息
          </h1>

          {/* 新建聊天按钮 - 已注释 */}
          {/*
          <motion.button
            className="w-12 h-12 rounded-2xl transform hover:scale-105 hover:rotate-90 transition-all duration-300 flex items-center justify-center group"
            style={{
              backgroundColor: '#D1E7FE',
              color: '#4A90E2',
              boxShadow: '0 2px 8px rgba(209, 231, 254, 0.3)'
            }}
            onClick={handleNewChat}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C1D7EE'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D1E7FE'}
          >
            <span className="text-xl font-medium group-hover:scale-110 transition-transform duration-200">+</span>
          </motion.button>
          */}
        </div>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto pt-20 pb-32 px-6">
        {conversations.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* 图标容器 */}
            <div className="relative mb-8">
              <div
                className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto transform hover:rotate-3 transition-transform duration-300"
                style={{
                  backgroundColor: '#F0F4FF',
                  boxShadow: '0 4px 12px rgba(240, 244, 255, 0.4)'
                }}
              >
                <span className="text-5xl">💬</span>
              </div>
              {/* 装饰性元素 */}
              <div
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full animate-bounce"
                style={{ backgroundColor: '#D1E7FE' }}
              ></div>
              <div
                className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full animate-bounce delay-150"
                style={{ backgroundColor: '#F3D9FF' }}
              ></div>
              <div
                className="absolute top-1/2 -right-6 w-4 h-4 rounded-full animate-pulse"
                style={{ backgroundColor: '#BAF1E3' }}
              ></div>
            </div>

            <h3 className="text-2xl font-medium mb-3" style={{ color: '#6B7280' }}>还没有对话</h3>
            <p className="mb-8 leading-relaxed" style={{ color: '#9CA3AF' }}>
              选择一个可爱的AI角色，开始你们的温馨对话吧！✨
            </p>

            <motion.button
              className="font-medium py-4 px-8 rounded-2xl transform hover:scale-105 transition-all duration-300"
              style={{
                backgroundColor: '#D1E7FE',
                color: '#4A90E2',
                boxShadow: '0 4px 12px rgba(209, 231, 254, 0.3)'
              }}
              onClick={handleNewChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#C1D7EE';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(209, 231, 254, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#D1E7FE';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(209, 231, 254, 0.3)';
              }}
            >
              开始新对话 🌸
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation, index) => {
              const lastMessage = conversation.messages[conversation.messages.length - 1];
              
              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ConversationItem
                    conversationId={conversation.id}
                    characterId={conversation.characterId}
                    lastMessage={lastMessage?.content}
                    lastMessageTime={conversation.lastMessageAt}
                    onClick={() => handleConversationClick(conversation.id)}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

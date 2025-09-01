import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { useCharacterStore } from '../stores/characterStore';
import { useScrollAnimation } from '../hooks/useAnimation';

interface ConversationItemProps {
  conversationId: string;
  characterId: string;
  lastMessage?: string;
  lastMessageTime: Date;
  unreadCount?: number;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversationId,
  characterId,
  lastMessage = '开始新对话...',
  lastMessageTime,
  unreadCount = 0,
  onClick
}) => {
  const { characters } = useCharacterStore();
  const character = characters.find(c => c.id === characterId);
  const { ref, isVisible, animationClass } = useScrollAnimation('fade-in');

  if (!character) return null;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      ref={ref}
      className={`${animationClass} cursor-pointer`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-card border border-white/30 shadow-card hover:shadow-glow transition-all duration-200">
        {/* 头像 */}
        <div className="relative">
          <div className="avatar">
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
          
          {/* 在线状态指示器 */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        </div>

        {/* 对话信息 */}
        <div className="flex-1 ml-3 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-text-primary truncate">
              {character.name}
            </h3>
            <span className="text-xs text-text-muted flex-shrink-0">
              {formatTime(lastMessageTime)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary truncate flex-1">
              {lastMessage}
            </p>
            
            {unreadCount > 0 && (
              <motion.div
                className="ml-2 bg-danger-400 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
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
    navigate('/chat');
  };

  return (
    <div className="flex flex-col h-full bg-warm-50">
      {/* 顶部导航栏 */}
      <div className="navbar">
        <h1 className="text-lg font-semibold text-text-primary">信息</h1>
        
        <motion.button
          className="p-2 rounded-full bg-primary-400 text-white shadow-bubble"
          onClick={handleNewChat}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </motion.button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto pt-16 pb-20 px-4">
        {conversations.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-primary-400">
                <path 
                  d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" 
                  fill="currentColor"
                />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-text-primary mb-2">
              还没有对话
            </h3>
            
            <p className="text-text-muted mb-6 max-w-xs">
              选择一个角色开始你的第一次AI对话吧！
            </p>
            
            <motion.button
              className="btn-primary"
              onClick={handleNewChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              开始新对话
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

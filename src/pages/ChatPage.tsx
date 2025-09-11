import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AvatarEditor } from '../components/character/AvatarEditor';
import { ChatBubble } from '../components/chat/ChatBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { CharacterActionsMenu } from '../components/character/CharacterActionsMenu';
import { CharacterForm } from '../components/character/CharacterForm';
import { useChat } from '../hooks/useChat';
import { useCharacterStore } from '../stores/characterStore';
import { useAppStore } from '../stores/appStore';
import { useChatStore } from '../stores/chatStore';

export const ChatPage: React.FC = () => {
  const {
    messages,
    currentConversation,
    isSending,
    handleSendMessage,
    cancelSending,
    testVercelAI,
    isDisplayingSequence,
    typingCharacter
  } = useChat();
  
  const { currentCharacter } = useCharacterStore();
  const { setCurrentTab } = useAppStore();
  const { loadConversations, conversations, setCurrentConversation, clearCurrentConversation } = useChatStore();
  const navigate = useNavigate();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 页面加载时初始化数据
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 当角色改变时，处理对话逻辑
  useEffect(() => {
    if (currentCharacter && conversations.length >= 0) {
      // 查找当前角色的最新对话
      const characterConversation = conversations.find(
        conv => conv.characterId === currentCharacter.id
      );

      if (characterConversation) {
        // 如果找到现有对话，切换到该对话
        if (characterConversation.id !== currentConversation?.id) {
          setCurrentConversation(characterConversation.id);
        }
      } else {
        // 如果没有找到对话，清空当前对话状态，等待用户发送第一条消息时创建新对话
        if (currentConversation?.characterId !== currentCharacter.id) {
          // 只有当前对话不属于当前角色时才清空
          clearCurrentConversation();
        }
      }
    }
  }, [currentCharacter, conversations, currentConversation, setCurrentConversation]);

  // 监听滚动，显示/隐藏滚动到底部按钮
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom && messages.length > 0);
  };

  // 返回消息列表
  const handleBack = () => {
    // 使用 navigate(-1) 返回上一页，如果没有历史记录则返回消息页面
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
      setCurrentTab('messages');
    }
  };

  // 处理编辑角色
  const handleEditCharacter = (character: Character) => {
    console.log('📝 处理编辑角色', character.name, '当前状态:', showEditForm);
    setShowEditForm(true);
    console.log('📝 设置后状态:', true);
  };

  // 关闭编辑表单
  const handleCloseEditForm = () => {
    setShowEditForm(false);
  };

  // 如果没有选择角色，显示提示
  if (!currentCharacter) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: '#FAFBFF' }}>
        {/* 导航栏 */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b" style={{ borderColor: '#E8EFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{ backgroundColor: '#F0F4FF', color: '#6B7280' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0E4FF'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F0F4FF'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="text-xl font-medium" style={{ color: '#6B7280' }}>聊天</h1>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 pt-20">
          <motion.div
            className="text-center max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                <span className="text-5xl">AI</span>
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
            </div>

            <h3 className="text-2xl font-medium mb-3" style={{ color: '#6B7280' }}>请先选择一个角色</h3>
            <p className="mb-8 leading-relaxed" style={{ color: '#9CA3AF' }}>
              前往通讯录选择一个可爱的AI角色开始对话吧！
            </p>

            <div className="space-y-4">
              <motion.button
                className="font-medium py-4 px-8 rounded-2xl transform hover:scale-105 transition-all duration-300"
                style={{
                  backgroundColor: '#D1E7FE',
                  color: '#4A90E2',
                  boxShadow: '0 4px 12px rgba(209, 231, 254, 0.3)'
                }}
                onClick={() => setCurrentTab('contacts')}
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
                选择角色 🌸
              </motion.button>

              <motion.button
                className="font-medium py-3 px-6 rounded-2xl transform hover:scale-105 transition-all duration-300"
                style={{
                  backgroundColor: '#F3D9FF',
                  color: '#8B5CF6',
                  boxShadow: '0 4px 12px rgba(243, 217, 255, 0.3)'
                }}
                onClick={() => testVercelAI('Hello, this is a test message')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E3C9FF';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(243, 217, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3D9FF';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(243, 217, 255, 0.3)';
                }}
              >
                🧪 测试 Vercel AI
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#FAFBFF' }}>
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b" style={{ borderColor: '#E8EFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <motion.button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ backgroundColor: '#F0F4FF', color: '#6B7280' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0E4FF'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F0F4FF'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>

          {/* 角色信息 */}
          <div className="flex items-center space-x-3">
            <AvatarEditor
              character={currentCharacter}
              size="small"
              showEditButton={true}
            />

            <div>
              <h2 className="font-medium" style={{ color: '#6B7280' }}>{currentCharacter.name}</h2>
              <p className="text-xs flex items-center" style={{ color: isSending ? '#9CA3AF' : '#10B981' }}>
                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: isSending ? '#9CA3AF' : '#10B981' }}></span>
                {isSending ? (typingCharacter ? `${typingCharacter} 正在输入...` : '正在输入...') : '在线'}
              </p>
            </div>
          </div>

          {/* 更多选项 */}
          <CharacterActionsMenu
            character={currentCharacter}
            onEdit={handleEditCharacter}
            trigger={
              <motion.button
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ backgroundColor: '#F0F4FF', color: '#6B7280' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0E4FF'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F0F4FF'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="1" fill="currentColor"/>
                  <circle cx="19" cy="12" r="1" fill="currentColor"/>
                  <circle cx="5" cy="12" r="1" fill="currentColor"/>
                </svg>
              </motion.button>
            }
          />
        </div>
      </div>

      {/* 消息列表 */}
      <div
        className="flex-1 overflow-y-auto px-6 relative"
        style={{
          paddingTop: '80px', // 为顶部导航栏留空间
          paddingBottom: '120px', // 为底部输入框留空间
          WebkitOverflowScrolling: 'touch', // iOS 平滑滚动
          scrollBehavior: 'smooth'
        }}
        onScroll={handleScroll}
        ref={messagesContainerRef}
      >
        {messages.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">👋</span>
            </div>
            
            <h3 className="text-lg font-medium text-text-primary mb-2">
              开始对话
            </h3>
            
            <p className="text-text-muted max-w-xs">
              向 {currentCharacter.name} 说声你好，开始你们的对话吧！
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2 min-h-full">
            {messages.map((message, index) => {
              // 跳过心声消息，它们会附加到普通消息上
              if (message.messageType === 'inner_voice') {
                return null;
              }

              // 查找下一条心声消息
              let innerVoiceText: string | undefined;
              const nextMessage = messages[index + 1];
              if (nextMessage && nextMessage.messageType === 'inner_voice') {
                innerVoiceText = nextMessage.content;
              }

              return (
                <ChatBubble
                  key={message.id}
                  message={message}
                  delay={0}
                  innerVoiceText={innerVoiceText}
                />
              );
            }).filter(Boolean)}
            
            {/* 正在发送指示器 */}
            <AnimatePresence>
              {(isSending || isDisplayingSequence) && (
                <motion.div
                  className="flex justify-start mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  style={{ marginBottom: '2rem' }} // 确保有足够的底部边距
                >
                  <div className="flex items-end">
                    <div className="avatar mr-2">
                      {currentCharacter.avatar ? (
                        <img
                          src={currentCharacter.avatar}
                          alt={currentCharacter.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span>{currentCharacter.name.charAt(0)}</span>
                      )}
                    </div>
                    
                    <div className="chat-bubble chat-bubble-ai">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-text-muted rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 滚动到底部按钮 */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            className="fixed bottom-32 right-6 w-12 h-12 rounded-full flex items-center justify-center z-40"
            style={{
              backgroundColor: '#4A90E2',
              color: 'white',
              boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
            }}
            onClick={scrollToBottom}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 固定在底部的输入框 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-t" style={{ borderColor: '#E8EFFF', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="p-4">
          <ChatInput
            onSendMessage={(message) => handleSendMessage(message, currentCharacter)}
            onCancelSending={cancelSending}
            disabled={false}
            isSending={isSending}
            placeholder={`向 ${currentCharacter.name} 发送消息...`}
          />
        </div>
      </div>

      {/* 编辑角色表单 */}
      <CharacterForm
        character={currentCharacter}
        isOpen={showEditForm}
        onClose={handleCloseEditForm}
      />
    </div>
  );
};

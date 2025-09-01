import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { ChatBubble } from '../components/chat/ChatBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { useChat } from '../hooks/useChat';
import { useCharacterStore } from '../stores/characterStore';
import { useAppStore } from '../stores/appStore';

export const ChatPage: React.FC = () => {
  const { 
    messages, 
    currentConversation, 
    isSending, 
    handleSendMessage, 
    cancelSending 
  } = useChat();
  
  const { currentCharacter } = useCharacterStore();
  const { setCurrentTab } = useAppStore();
  const [parent] = useAutoAnimate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 监听滚动，显示/隐藏滚动到底部按钮
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom && messages.length > 0);
  };

  // 返回消息列表
  const handleBack = () => {
    setCurrentTab('messages');
  };

  // 如果没有选择角色，显示提示
  if (!currentCharacter) {
    return (
      <div className="flex flex-col h-full bg-warm-50">
        <div className="navbar">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-primary-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-text-primary">聊天</h1>
          <div className="w-8"></div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-primary-400">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              请先选择一个角色
            </h3>
            <p className="text-text-muted mb-6">
              前往通讯录选择一个角色开始对话
            </p>
            <motion.button
              className="btn-primary"
              onClick={() => setCurrentTab('contacts')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              选择角色
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-warm-50">
      {/* 顶部导航栏 */}
      <div className="navbar">
        <motion.button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-primary-50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>

        {/* 角色信息 */}
        <div className="flex items-center flex-1 mx-4">
          <div className="avatar mr-3">
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
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-text-primary truncate">
              {currentCharacter.name}
            </h1>
            <p className="text-sm text-text-muted">
              {isSending ? '正在输入...' : '在线'}
            </p>
          </div>
        </div>

        {/* 更多选项 */}
        <motion.button
          className="p-2 rounded-full hover:bg-primary-50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="19" cy="12" r="1" fill="currentColor"/>
            <circle cx="5" cy="12" r="1" fill="currentColor"/>
          </svg>
        </motion.button>
      </div>

      {/* 消息列表 */}
      <div 
        className="flex-1 overflow-y-auto pt-16 pb-4 px-4 relative"
        onScroll={handleScroll}
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
          <div ref={parent} className="space-y-2">
            {messages.map((message, index) => (
              <ChatBubble
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
                delay={index * 100}
              />
            ))}
            
            {/* 正在发送指示器 */}
            <AnimatePresence>
              {isSending && (
                <motion.div
                  className="flex justify-start mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
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
            className="absolute bottom-24 right-4 w-12 h-12 bg-primary-400 text-white rounded-full shadow-glow flex items-center justify-center z-10"
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

      {/* 输入框 */}
      <div className="p-4 pb-20">
        <ChatInput
          onSendMessage={(message) => handleSendMessage(message, currentCharacter)}
          disabled={isSending}
          placeholder={`向 ${currentCharacter.name} 发送消息...`}
        />
        
        {/* 取消发送按钮 */}
        <AnimatePresence>
          {isSending && (
            <motion.div
              className="flex justify-center mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <motion.button
                onClick={cancelSending}
                className="text-sm text-text-muted hover:text-primary-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                取消发送
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

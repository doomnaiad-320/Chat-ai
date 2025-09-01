import React from 'react';
import { motion } from 'framer-motion';
import type { Message } from '../../types';
import { useBubbleAnimation, useTypewriter } from '../../hooks/useAnimation';

interface ChatBubbleProps {
  message: Message;
  isLatest?: boolean;
  delay?: number;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  isLatest = false, 
  delay = 0 
}) => {
  const { animationClass, isVisible } = useBubbleAnimation(delay);
  const { displayText, isTyping } = useTypewriter(
    message.content, 
    30, // 打字速度
    isLatest && message.sender === 'ai' ? 500 : 0 // 只对最新的AI消息使用打字效果
  );

  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 气泡动画变体
  const bubbleVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20,
      x: isUser ? 20 : -20
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        delay: delay / 1000
      }
    }
  };

  // 摇摆动画（可爱效果）
  const wiggleVariants = {
    wiggle: {
      rotate: [-1, 1, -1, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={bubbleVariants}
    >
      <div className={`flex items-end max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* AI头像 */}
        {isAI && (
          <motion.div 
            className="avatar mr-2 flex-shrink-0"
            whileHover="wiggle"
            variants={wiggleVariants}
          >
            <span>🤖</span>
          </motion.div>
        )}

        {/* 消息气泡 */}
        <motion.div
          className={`relative ${animationClass}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* 气泡主体 */}
          <div
            className={`chat-bubble ${
              isUser ? 'chat-bubble-user' : 'chat-bubble-ai'
            } relative`}
          >
            {/* 气泡尾巴 */}
            <div
              className={`absolute top-4 w-0 h-0 ${
                isUser
                  ? 'right-[-8px] border-l-[8px] border-l-primary-400 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
                  : 'left-[-8px] border-r-[8px] border-r-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
              }`}
            />

            {/* 消息内容 */}
            <div className="relative z-10">
              {isLatest && isAI && isTyping ? (
                <span>{displayText}</span>
              ) : (
                <span>{message.content}</span>
              )}
              
              {/* 打字指示器 */}
              {isLatest && isAI && isTyping && (
                <motion.span
                  className="inline-block w-1 h-4 bg-current ml-1"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>

            {/* 消息状态指示器 */}
            {isUser && (
              <div className="flex items-center justify-end mt-1">
                {message.status === 'sending' && (
                  <motion.div
                    className="flex space-x-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 bg-white/60 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </motion.div>
                )}
                
                {message.status === 'sent' && (
                  <motion.svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-white/60"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
                
                {message.status === 'error' && (
                  <motion.svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-red-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
                  </motion.svg>
                )}
              </div>
            )}
          </div>

          {/* 时间戳 */}
          <motion.div
            className={`text-xs text-text-muted mt-1 ${
              isUser ? 'text-right' : 'text-left'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (delay / 1000) + 0.3 }}
          >
            {formatTime(message.timestamp)}
          </motion.div>
        </motion.div>

        {/* 用户头像 */}
        {isUser && (
          <motion.div 
            className="avatar ml-2 flex-shrink-0"
            whileHover="wiggle"
            variants={wiggleVariants}
          >
            <span>👤</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

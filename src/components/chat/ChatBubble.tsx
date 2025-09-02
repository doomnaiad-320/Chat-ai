import React from 'react';
import { motion } from 'framer-motion';
import type { Message } from '../../types';
import { useBubbleAnimation } from '../../hooks/useAnimation';

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

  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';

  // 格式化时间
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return '无效时间';
    }
    return dateObj.toLocaleTimeString('zh-CN', {
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
        type: "spring" as const,
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
        ease: [0.25, 0.1, 0.25, 1] as const
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
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse items-end' : 'flex-row items-start'}`}>
        {/* AI头像 */}
        {isAI && (
          <motion.div
            className="avatar mr-2 flex-shrink-0 mt-1"
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
            } relative ${isAI ? 'min-h-[5rem] pb-6' : ''}`}
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
              <span>{message.content}</span>
            </div>
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

import React from 'react';
import { motion } from 'framer-motion';
import type { Message } from '../../types';
import { useBubbleAnimation } from '../../hooks/useAnimation';

interface ChatBubbleProps {
  message: Message;
  delay?: number;
  innerVoiceText?: string; // 心声文本，附加在普通消息下方
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  delay = 0,
  innerVoiceText
}) => {
  const { animationClass, isVisible } = useBubbleAnimation(delay);

  const isUser = message.sender === 'user';
  const isInnerVoice = message.messageType === 'inner_voice';

  // 调试信息
  if (message.messageType) {
    console.log('🎨 ChatBubble渲染消息:', {
      messageType: message.messageType,
      isInnerVoice,
      content: message.content.substring(0, 30) + '...',
      hasInnerVoice: !!innerVoiceText
    });
  }

  // 如果是心声消息，不渲染独立气泡
  if (isInnerVoice) {
    return null;
  }

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
      <div className={`flex max-w-[80%] items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* 头像 */}
        <motion.div
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg
            ${isUser
              ? 'ml-2 bg-gradient-to-br from-orange-100 to-orange-200'
              : 'mr-2 bg-gradient-to-br from-blue-100 to-blue-200'
            }
            shadow-sm
          `}
          whileHover="wiggle"
          variants={wiggleVariants}
        >
          <span>{isUser ? 'U' : 'AI'}</span>
        </motion.div>

        {/* 气泡和时间戳容器 */}
        <div className="flex flex-col flex-1">
          {/* 对话气泡 */}
          <motion.div
            className={`
              relative rounded-2xl px-3 py-2
              ${isUser
                ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-800 border border-gray-100 shadow-lg'
              }
              ${animationClass}
            `}
            style={{
              borderRadius: isUser ? '18px 18px 6px 18px' : '18px 18px 18px 6px'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 气泡尾巴 */}
            <div
              className={`
                absolute w-0 h-0 top-3
                ${isUser
                  ? 'right-[-6px] border-l-[12px] border-l-orange-500 border-t-[6px] border-t-transparent'
                  : 'left-[-6px] border-r-[12px] border-r-white border-t-[6px] border-t-transparent'
                }
              `}
            />

            {/* 消息内容 */}
            <div>
              <span className="text-sm leading-snug">
                {message.content}
              </span>
            </div>
          </motion.div>

          {/* 时间戳 */}
          <motion.div
            className={`text-xs text-text-muted mt-1 px-2 ${
              isUser ? 'text-right' : 'text-left'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (delay / 1000) + 0.3 }}
          >
            {formatTime(message.timestamp)}
          </motion.div>

          {/* 心声附加区域 */}
          {innerVoiceText && (
            <motion.div
              className={`mt-2 px-2 ${isUser ? 'text-right' : 'text-left'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (delay / 1000) + 0.5 }}
            >
              <div className="inline-block bg-gray-50 text-gray-500 px-3 py-1 rounded-lg text-xs italic border border-gray-200">
                <span className="font-medium text-gray-400 mr-1">心声:</span>
                {innerVoiceText}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

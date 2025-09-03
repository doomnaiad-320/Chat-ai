import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onCancelSending?: () => void;
  disabled?: boolean;
  isSending?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onCancelSending,
  disabled = false,
  isSending = false,
  placeholder = "输入消息..."
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整文本框高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  // 处理发送消息或取消发送
  const handleSend = () => {
    if (isSending && onCancelSending) {
      // 如果正在发送，则取消发送
      onCancelSending();
    } else {
      // 否则发送消息
      const trimmedMessage = message.trim();
      if (trimmedMessage && !disabled) {
        onSendMessage(trimmedMessage);
        setMessage('');
        
        // 重置文本框高度
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    }
  };

  // 移除键盘事件处理 - 为移动端APP做准备
  // 不再处理Enter发送，只通过按钮发送消息

  // 发送/停止按钮动画变体
  const sendButtonVariants = {
    idle: {
      scale: 1,
      backgroundColor: '#FF9E80',
      transition: { type: "spring" as const, stiffness: 400, damping: 17 }
    },
    hover: {
      scale: 1.1,
      backgroundColor: '#FF8A65',
      transition: { type: "spring" as const, stiffness: 400, damping: 17 }
    },
    tap: {
      scale: 0.9,
      transition: { type: "spring" as const, stiffness: 400, damping: 17 }
    },
    disabled: {
      scale: 1,
      backgroundColor: '#E0E0E0',
      transition: { type: "spring" as const, stiffness: 400, damping: 17 }
    },
    stop: {
      scale: 1,
      backgroundColor: '#FF5722',
      transition: { type: "spring" as const, stiffness: 400, damping: 17 }
    },
    stopHover: {
      scale: 1.1,
      backgroundColor: '#E64A19',
      transition: { type: "spring" as const, stiffness: 400, damping: 17 }
    }
  };

  // 爱心迸发动画
  const heartBurstVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1.2, 1],
      opacity: [0, 1, 0],
      transition: {
        duration: 0.6,
        times: [0, 0.3, 1],
        ease: "easeOut" as const
      }
    }
  };

  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const handleSendWithAnimation = () => {
    handleSend();
    
    // 触发爱心动画
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 600);
  };

  const canSend = message.trim().length > 0 && !disabled;
  const showStopButton = isSending;

  return (
    <div className="relative">
      {/* 爱心迸发动画 */}
      <AnimatePresence>
        {showHeartBurst && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={heartBurstVariants}
                style={{
                  transform: `rotate(${i * 60}deg) translateY(-30px)`,
                }}
              >
                💖
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* 输入框容器 */}
      <motion.div
        className={`glass-effect rounded-bubble p-3 transition-all duration-200 ${
          isFocused ? 'ring-2 ring-primary-400 shadow-glow' : 'shadow-card'
        }`}
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div className="flex items-end space-x-3">
          {/* 文本输入框 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full bg-transparent border-none outline-none resize-none text-text-primary placeholder-text-muted text-base leading-6 max-h-[120px] overflow-y-auto"
              style={{ minHeight: '24px' }}
              rows={1}
            />
            
            {/* 字符计数 */}
            {message.length > 0 && (
              <motion.div
                className="absolute bottom-0 right-0 text-xs text-text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {message.length}/1000
              </motion.div>
            )}
          </div>

          {/* 发送/停止按钮 */}
          <motion.button
            onClick={handleSendWithAnimation}
            disabled={!canSend && !showStopButton}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-bubble"
            variants={sendButtonVariants}
            initial="idle"
            animate={
              showStopButton ? "stop" :
              disabled ? "disabled" :
              canSend ? "idle" : "disabled"
            }
            whileHover={
              showStopButton ? "stopHover" :
              canSend ? "hover" : undefined
            }
            whileTap={canSend || showStopButton ? "tap" : undefined}
          >
            <AnimatePresence mode="wait">
              {showStopButton ? (
                <motion.svg
                  key="stop"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <rect
                    x="6"
                    y="6"
                    width="12"
                    height="12"
                    fill="currentColor"
                    rx="2"
                  />
                </motion.svg>
              ) : disabled ? (
                <motion.div
                  key="loading"
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                />
              ) : (
                <motion.svg
                  key="send"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 45 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <path
                    d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* 输入提示 */}
        <AnimatePresence>
          {isFocused && message.length === 0 && (
            <motion.div
              className="mt-2 text-xs text-text-muted"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              点击发送按钮发送消息
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

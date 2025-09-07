import React from 'react';
import { motion, Variants } from 'framer-motion';

interface DevelopmentPageProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const DevelopmentPage: React.FC<DevelopmentPageProps> = ({
  title = "功能开发中",
  description = "此功能正在紧张开发中，敬请期待！",
  icon
}) => {
  const defaultIcon = (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
      <path 
        d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z" 
        fill="url(#gradient)" 
        stroke="url(#gradient)" 
        strokeWidth="0.5"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#FF8E9B" />
        </linearGradient>
      </defs>
    </svg>
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const floatingVariants: Variants = {
    initial: {
      y: 0
    },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <motion.div
        className="text-center max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 图标区域 */}
        <motion.div
          className="mb-8 flex justify-center"
          variants={floatingVariants}
          animate="animate"
        >
          <div className="relative">
            {icon || defaultIcon}
            
            {/* 装饰性圆圈 */}
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div
              className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </div>
        </motion.div>

        {/* 标题 */}
        <motion.h1
          className="text-3xl font-bold text-gray-800 mb-4"
          variants={itemVariants}
        >
          {title}
        </motion.h1>

        {/* 描述 */}
        <motion.p
          className="text-gray-600 text-lg mb-8 leading-relaxed"
          variants={itemVariants}
        >
          {description}
        </motion.p>

        {/* 进度指示器 */}
        <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center space-x-2 mb-3">
            <span className="text-sm text-gray-500">开发进度</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "65%" }}
              transition={{ duration: 2, delay: 1 }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>已完成</span>
            <span>65%</span>
          </div>
        </motion.div>

        {/* 特性预告 */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          variants={itemVariants}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">即将推出</h3>
          
          <div className="space-y-3">
            {[
              "🎨 全新界面设计",
              "⚡ 更快的响应速度", 
              "🔧 更多实用功能",
              "🎯 个性化体验"
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center text-gray-600 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2 + index * 0.2 }}
              >
                <span className="mr-3">{feature.split(' ')[0]}</span>
                <span>{feature.split(' ').slice(1).join(' ')}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 底部提示 */}
        <motion.div
          className="mt-8 text-center"
          variants={itemVariants}
        >
          <p className="text-sm text-gray-400">
            感谢您的耐心等待 ❤️
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

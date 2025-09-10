import React from 'react';
import { motion } from 'framer-motion';

/**
 * 页面：AIGeneratePage
 *
 * 功能定位：
 * - AI 生成角色卡的入口与占位页面；
 * - 当前阶段仅提供骨架与说明，后续接入实际 AI 生成流程；
 * - 可在此放置表单、提示词、预览等。
 */
export const AIGeneratePage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* 顶部引导 */}
      <div className="p-4">
        <h1 className="text-lg font-medium" style={{ color: '#6B7280' }}>AI 生成角色卡</h1>
        <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
          输入少量设定或关键词，AI 将为你生成完整的角色卡。功能开发中，敬请期待～
        </p>
      </div>

      {/* 简洁占位（不使用骨架） */}
      <div className="px-4 mt-2">
        <div className="rounded-2xl p-4" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            即将上线：输入关键词或设定，AI 将自动生成包含名称、性别、语音风格、喜好、厌恶与背景信息的完整角色卡。
          </p>
        </div>
      </div>

      {/* 底部占位操作区 */}
      <div className="mt-auto p-4">
        <motion.button
          type="button"
          disabled
          className="w-full py-3 rounded-2xl font-medium"
          style={{ backgroundColor: '#E8EFFF', color: '#9CA3AF' }}
          whileTap={{ scale: 0.98 }}
        >
          一键生成（开发中）
        </motion.button>
      </div>
    </div>
  );
};

export default AIGeneratePage;

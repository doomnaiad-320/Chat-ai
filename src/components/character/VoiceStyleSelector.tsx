import React from 'react';

/**
 * 组件：VoiceStyleSelector（语音风格选择器）
 *
 * 用途：
 * - 在“创建/编辑角色”表单中选择角色的说话/语气风格。
 * - 这是一个轻量的占位实现，当前以 <select> 展示；
 *   后续可替换为更丰富的卡片/图标化选择器（保持对外 props 不变）。
 *
 * 设计说明（等后续开发）：
 * - 将支持：
 *   1) 预览文案/示例语气；
 *   2) hover/选中动画；
 *   3) 基于枚举的可扩展项；
 *   4) 无障碍与键盘导航；
 * - 保持无状态、受控组件，便于复用与单测。
 */

export type VoiceStyle = 'cute' | 'serious' | 'humorous' | 'gentle' | 'energetic';

export interface VoiceStyleSelectorProps {
  /** 当前选中的语音风格（受控） */
  value: VoiceStyle;
  /** 变更回调 */
  onChange: (value: VoiceStyle) => void;
  /** 禁用状态（可选） */
  disabled?: boolean;
  /** 错误提示文案（可选） */
  error?: string;
  /** 外层 className（可选） */
  className?: string;
}

export const VoiceStyleSelector: React.FC<VoiceStyleSelectorProps> = ({
  value,
  onChange,
  disabled,
  error,
  className,
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
        语音风格
      </label>

      {/*
        占位实现：原生 select
        - 后续可以替换为卡片网格（5 选 1），维持受控 onChange 签名
       */}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as VoiceStyle)}
        className="w-full px-4 py-3 rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderColor: error ? '#EF4444' : '#E8EFFF',
          color: '#6B7280',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <option value="cute">🌸 可爱</option>
        <option value="serious">🎯 严肃</option>
        <option value="humorous">😄 幽默</option>
        <option value="gentle">💕 温柔</option>
        <option value="energetic">⚡ 活泼</option>
      </select>

      {error && (
        <p className="text-xs mt-2" style={{ color: '#EF4444' }}>{error}</p>
      )}

      {/* TODO(后续)：
        - 支持 tone 词预览（随选项变化展示短句）
        - 支持示例对话、emoji 建议
        - 支持自定义/扩展枚举
      */}
    </div>
  );
};


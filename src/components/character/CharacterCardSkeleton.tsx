import React from 'react';

/**
 * 组件：CharacterCardSkeleton（角色卡骨架）
 *
 * 用途：
 * - 角色列表/卡片加载中的占位骨架，用于预占版式，提升感知速度；
 * - 可在 TabBar 触发的弹层、列表页等场景复用；
 * - 目前仅样式骨架，无交互逻辑。
 */
export const CharacterCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className}>
      <div className="animate-pulse rounded-2xl p-4" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center">
          {/* 头像占位 */}
          <div className="w-12 h-12 rounded-full mr-3" style={{ backgroundColor: '#E8EFFF' }} />

          {/* 标题/副标题占位 */}
          <div className="flex-1">
            <div className="h-3 rounded mb-2" style={{ width: '40%', backgroundColor: '#E8EFFF' }} />
            <div className="h-3 rounded" style={{ width: '60%', backgroundColor: '#F3F4F6' }} />
          </div>
        </div>

        {/* 内容行占位 */}
        <div className="mt-4 space-y-2">
          <div className="h-3 rounded" style={{ width: '90%', backgroundColor: '#F3F4F6' }} />
          <div className="h-3 rounded" style={{ width: '70%', backgroundColor: '#E8EFFF' }} />
          <div className="h-3 rounded" style={{ width: '80%', backgroundColor: '#F3F4F6' }} />
        </div>
      </div>
    </div>
  );
};


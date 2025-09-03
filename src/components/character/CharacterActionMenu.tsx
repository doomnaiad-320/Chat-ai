import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character } from '../../types';

interface CharacterActionMenuProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChat: () => void;
  position: { x: number; y: number };
}

export const CharacterActionMenu: React.FC<CharacterActionMenuProps> = ({
  character,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onChat,
  position
}) => {
  const menuItems = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: '开始聊天',
      action: onChat,
      color: '#4A90E2',
      bgColor: '#D1E7FE'
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: '编辑角色',
      action: onEdit,
      color: '#8B5CF6',
      bgColor: '#F3D9FF'
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: '删除角色',
      action: onDelete,
      color: '#E53E3E',
      bgColor: '#FED7D7'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* 菜单 */}
          <motion.div
            className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            style={{
              left: Math.min(position.x, window.innerWidth - 200),
              top: Math.min(position.y, window.innerHeight - 200),
              minWidth: '180px'
            }}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* 角色信息头部 */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium mr-2 text-sm"
                  style={{
                    backgroundColor: character.gender === 'female' ? '#F3D9FF' :
                                    character.gender === 'male' ? '#D1E7FE' : '#BAF1E3'
                  }}
                >
                  {character.avatar ? (
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span style={{
                      color: character.gender === 'female' ? '#8B5CF6' :
                             character.gender === 'male' ? '#4A90E2' : '#10B981'
                    }}>
                      {character.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 text-sm">{character.name}</h4>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">
                    {character.background || '暂无背景'}
                  </p>
                </div>
              </div>
            </div>

            {/* 菜单项 */}
            <div className="py-2">
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  className="w-full px-4 py-3 flex items-center text-left hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                    style={{
                      backgroundColor: item.bgColor,
                      color: item.color
                    }}
                  >
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

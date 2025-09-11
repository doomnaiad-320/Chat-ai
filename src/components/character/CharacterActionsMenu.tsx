import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character } from '../../types';

interface CharacterActionsMenuProps {
  character: Character;
  trigger: React.ReactNode;
  onEdit: (character: Character) => void;
}

export const CharacterActionsMenu: React.FC<CharacterActionsMenuProps> = ({
  character,
  trigger,
  onEdit
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = () => {
    console.log('🔄 点击编辑按钮', character.name);
    setIsOpen(false);
    onEdit(character);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 触发按钮 */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-48"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
            }}
          >
            {/* 编辑角色 */}
            <motion.button
              onClick={handleEdit}
              className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-gray-50 transition-colors flex items-center space-x-3"
              whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.8)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary-500">
                <path 
                  d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span>编辑角色信息</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

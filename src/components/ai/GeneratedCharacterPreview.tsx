import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { GeneratedCharacterData } from '../../services/aiCharacterGenerator';

interface GeneratedCharacterPreviewProps {
  character: GeneratedCharacterData | null;
  onSave: (character: GeneratedCharacterData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const GeneratedCharacterPreview: React.FC<GeneratedCharacterPreviewProps> = ({
  character,
  onSave,
  onCancel,
  loading = false
}) => {
  const [editedCharacter, setEditedCharacter] = useState<GeneratedCharacterData | null>(character);
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    setEditedCharacter(character);
    setIsEditing(false);
  }, [character]);

  if (!character || !editedCharacter) {
    return null;
  }

  const handleFieldChange = (field: keyof GeneratedCharacterData, value: string) => {
    setEditedCharacter({
      ...editedCharacter,
      [field]: value
    });
  };

  const handleSave = () => {
    if (editedCharacter) {
      onSave(editedCharacter);
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return '男性';
      case 'female': return '女性';
      case 'other': return '其他';
      default: return gender;
    }
  };

  const getVoiceStyleLabel = (style: string) => {
    switch (style) {
      case 'cute': return '可爱';
      case 'serious': return '严肃';
      case 'humorous': return '幽默';
      case 'gentle': return '温柔';
      case 'energetic': return '活泼';
      default: return style;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">生成的角色卡</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          {isEditing ? '预览' : '编辑'}
        </button>
      </div>

      <div className="space-y-4">
        {/* 角色名称 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            角色名称
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedCharacter.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="input-field"
              maxLength={20}
            />
          ) : (
            <p className="text-text-primary">{editedCharacter.name}</p>
          )}
        </div>

        {/* 性别 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            性别
          </label>
          {isEditing ? (
            <select
              value={editedCharacter.gender}
              onChange={(e) => handleFieldChange('gender', e.target.value)}
              className="input-field"
            >
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">其他</option>
            </select>
          ) : (
            <p className="text-text-primary">{getGenderLabel(editedCharacter.gender)}</p>
          )}
        </div>

        {/* 语音风格 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            语音风格
          </label>
          {isEditing ? (
            <select
              value={editedCharacter.voiceStyle}
              onChange={(e) => handleFieldChange('voiceStyle', e.target.value)}
              className="input-field"
            >
              <option value="cute">可爱</option>
              <option value="serious">严肃</option>
              <option value="humorous">幽默</option>
              <option value="gentle">温柔</option>
              <option value="energetic">活泼</option>
            </select>
          ) : (
            <p className="text-text-primary">{getVoiceStyleLabel(editedCharacter.voiceStyle)}</p>
          )}
        </div>

        {/* 喜欢 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            喜欢
          </label>
          {isEditing ? (
            <textarea
              value={editedCharacter.likes}
              onChange={(e) => handleFieldChange('likes', e.target.value)}
              className="input-field resize-none"
              rows={2}
              maxLength={100}
            />
          ) : (
            <p className="text-text-primary">{editedCharacter.likes}</p>
          )}
        </div>

        {/* 讨厌 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            讨厌
          </label>
          {isEditing ? (
            <textarea
              value={editedCharacter.dislikes}
              onChange={(e) => handleFieldChange('dislikes', e.target.value)}
              className="input-field resize-none"
              rows={2}
              maxLength={100}
            />
          ) : (
            <p className="text-text-primary">{editedCharacter.dislikes}</p>
          )}
        </div>

        {/* 背景故事 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            背景故事
          </label>
          {isEditing ? (
            <textarea
              value={editedCharacter.background}
              onChange={(e) => handleFieldChange('background', e.target.value)}
              className="input-field resize-none"
              rows={4}
              maxLength={500}
            />
          ) : (
            <p className="text-text-primary text-sm leading-relaxed">
              {editedCharacter.background}
            </p>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 mt-6">
        <motion.button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary flex-1"
          whileTap={{ scale: 0.98 }}
        >
          {loading ? '保存中...' : '保存角色'}
        </motion.button>
        <motion.button
          onClick={onCancel}
          className="btn-secondary flex-1"
          whileTap={{ scale: 0.98 }}
        >
          取消
        </motion.button>
      </div>
    </motion.div>
  );
};

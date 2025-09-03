// 测试角色操作功能的工具函数

import type { Character } from '../types';

// 创建测试角色数据
export const createTestCharacter = (): Omit<Character, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '测试角色',
  gender: 'female',
  avatar: '',
  likes: '聊天、音乐、电影。喜欢和朋友们一起度过愉快的时光。',
  dislikes: '噪音、争吵。不喜欢吵闹的环境。',
  background: '这是一个用于测试删除功能的角色',
  voiceStyle: 'cute'
});

// 创建测试对话数据
export const createTestConversations = (characterId: string, count: number = 3) => {
  const conversations = [];
  
  for (let i = 0; i < count; i++) {
    conversations.push({
      id: `test_conv_${i}_${Date.now()}`,
      characterId: characterId,
      messages: [
        {
          id: `test_msg_${i}_1_${Date.now()}`,
          content: `测试消息 ${i * 2 + 1}`,
          sender: 'user' as const,
          characterId: characterId,
          timestamp: new Date(Date.now() - (count - i) * 60000),
          status: 'sent' as const
        },
        {
          id: `test_msg_${i}_2_${Date.now()}`,
          content: `测试回复 ${i * 2 + 2}`,
          sender: 'ai' as const,
          characterId: characterId,
          timestamp: new Date(Date.now() - (count - i) * 60000 + 30000),
          status: 'sent' as const
        }
      ],
      lastMessageAt: new Date(Date.now() - (count - i) * 60000 + 30000),
      title: `测试对话 ${i + 1}`
    });
  }
  
  return conversations;
};

// 测试删除功能的说明
export const DELETE_FEATURE_GUIDE = {
  title: '角色删除功能测试指南',
  steps: [
    '1. 创建一个测试角色',
    '2. 与该角色进行几轮对话',
    '3. 返回通讯录页面',
    '4. 悬停在角色卡片上，点击删除按钮',
    '5. 查看删除确认对话框中的统计信息',
    '6. 输入确认文本来完成删除',
    '7. 验证角色和相关聊天记录都被删除'
  ],
  features: [
    '✅ 悬停显示编辑和删除按钮',
    '✅ 删除前显示详细的确认对话框',
    '✅ 显示将被删除的对话数量和消息数量',
    '✅ 需要输入确认文本才能删除',
    '✅ 删除角色的同时清理所有相关聊天记录',
    '✅ 删除过程中显示加载状态',
    '✅ 删除完成后显示成功提示'
  ],
  warnings: [
    '⚠️ 删除操作不可撤销',
    '⚠️ 会同时删除所有相关的聊天记录',
    '⚠️ 需要准确输入确认文本',
    '⚠️ 删除过程中不能取消'
  ]
};

// 在开发环境中输出测试指南
if (process.env.NODE_ENV === 'development') {
  console.log('=== 角色删除功能测试指南 ===');
  console.log(DELETE_FEATURE_GUIDE.title);
  console.log('\n测试步骤:');
  DELETE_FEATURE_GUIDE.steps.forEach(step => console.log(step));
  console.log('\n功能特性:');
  DELETE_FEATURE_GUIDE.features.forEach(feature => console.log(feature));
  console.log('\n注意事项:');
  DELETE_FEATURE_GUIDE.warnings.forEach(warning => console.log(warning));
}

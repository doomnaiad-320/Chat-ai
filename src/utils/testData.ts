import type { Character, APIConfig } from '../types';

// 测试角色数据
export const testCharacters: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '小萌',
    gender: 'female',
    likes: ['甜食', '动漫', '音乐', '小动物'],
    dislikes: ['辣食', '恐怖片', '吵闹'],
    background: '一个可爱的二次元少女，喜欢甜甜的东西和萌萌的小动物。性格温柔善良，总是用最温暖的话语和你聊天。',
    voiceStyle: 'cute',
  },
  {
    name: '智慧博士',
    gender: 'male',
    likes: ['科学', '读书', '思考', '解决问题'],
    dislikes: ['无知', '偏见', '浪费时间'],
    background: '一位博学的学者，对各种知识都有深入的了解。喜欢用理性和逻辑来分析问题，总能给出深刻的见解。',
    voiceStyle: 'serious',
  },
  {
    name: '开心果',
    gender: 'other',
    likes: ['笑话', '游戏', '聚会', '搞笑视频'],
    dislikes: ['沉闷', '严肃', '压抑的氛围'],
    background: '一个天生的幽默大师，总能在任何场合带来欢声笑语。擅长讲笑话和制造轻松愉快的氛围。',
    voiceStyle: 'humorous',
  }
];

// 测试API配置
export const testAPIConfigs: Omit<APIConfig, 'id' | 'createdAt'>[] = [
  {
    name: 'OpenAI GPT-3.5',
    baseURL: 'https://api.openai.com/v1',
    apiKey: 'sk-your-openai-api-key-here',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    isDefault: true,
  },
  {
    name: 'OpenAI GPT-4',
    baseURL: 'https://api.openai.com/v1',
    apiKey: 'sk-your-openai-api-key-here',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    isDefault: false,
  }
];

// 初始化测试数据的函数
export const initializeTestData = async () => {
  // 这个函数可以用来在开发环境中初始化一些测试数据
  console.log('测试数据已准备就绪');
  console.log('角色数量:', testCharacters.length);
  console.log('API配置数量:', testAPIConfigs.length);
};

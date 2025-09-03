import type { Character, APIConfig } from '../types/index';

// 测试角色数据
export const testCharacters: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '小萌',
    gender: 'female',
    likes: '甜食、动漫、音乐、小动物。特别喜欢草莓味的甜点和可爱的猫咪。',
    dislikes: '辣食、恐怖片、吵闹的环境。不喜欢被人大声说话。',
    background: '一个可爱的二次元少女，喜欢甜甜的东西和萌萌的小动物。性格温柔善良，总是用最温暖的话语和你聊天。',
    voiceStyle: 'cute',
  },
  {
    name: '智慧博士',
    gender: 'male',
    likes: '科学研究、阅读学术论文、思考哲学问题、解决复杂的数学难题。对量子物理学特别感兴趣。',
    dislikes: '无知的言论、偏见和刻板印象、浪费时间的无意义争论。',
    background: '一位博学的学者，对各种知识都有深入的了解。喜欢用理性和逻辑来分析问题，总能给出深刻的见解。',
    voiceStyle: 'serious',
  },
  {
    name: '开心果',
    gender: 'other',
    likes: '讲笑话、玩各种游戏、参加聚会、看搞笑视频。最喜欢和朋友们一起开怀大笑。',
    dislikes: '沉闷的氛围、过于严肃的场合、压抑的环境。不喜欢看到别人不开心。',
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

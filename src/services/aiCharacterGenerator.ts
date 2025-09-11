import type { Character, APIConfig } from '../types';

// 生成的角色数据（不包含id和时间戳）
export interface GeneratedCharacterData {
  name: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  likes: string;
  dislikes: string;
  background: string;
  voiceStyle: 'cute' | 'serious' | 'humorous' | 'gentle' | 'energetic';
}

// AI生成角色的系统提示词（精简版，专门匹配应用格式）
const SYSTEM_PROMPT = `你是一个专业的角色卡生成器。你的任务是根据用户提供的关键词或描述，生成一个完整的角色设定。

【重要】你必须严格按照以下JSON格式输出，不要输出任何其他内容：
{
  "name": "角色名字（2-8个字）",
  "gender": "性别（只能是 male/female/other 之一）",
  "likes": "喜欢的事物（20-60字，用逗号分隔多个项目）",
  "dislikes": "讨厌的事物（20-60字，用逗号分隔多个项目）",
  "background": "背景故事（100-300字的完整描述）",
  "voiceStyle": "说话风格（只能是 cute/serious/humorous/gentle/energetic 之一）"
}

生成规则：
1. name: 根据角色特征起一个合适的中文名或昵称
2. gender: 根据描述推断，不确定时选择 other
3. likes: 3-5个喜好，符合角色性格
4. dislikes: 3-5个厌恶，与喜好形成对比
5. background: 详细的背景故事，包含身份、经历、性格特点等
6. voiceStyle: 
   - cute: 可爱活泼型
   - serious: 严肃认真型
   - humorous: 幽默风趣型
   - gentle: 温柔体贴型
   - energetic: 活力充沛型

确保生成的内容逻辑自洽，符合角色设定。`;

// 用户提示词模板
const getUserPrompt = (input: string): string => {
  return `请根据以下描述生成一个角色：

${input}

记住：必须严格按照JSON格式输出，包含所有必需字段。`;
};

// 解析AI响应，提取JSON
const parseAIResponse = (response: string): GeneratedCharacterData | null => {
  try {
    // 尝试直接解析
    const data = JSON.parse(response);
    return validateCharacterData(data);
  } catch (error) {
    // 如果直接解析失败，尝试提取JSON部分
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        return validateCharacterData(data);
      } catch (e) {
        console.error('解析JSON失败:', e);
      }
    }
  }
  return null;
};

// 验证生成的数据
const validateCharacterData = (data: any): GeneratedCharacterData | null => {
  // 验证必需字段
  if (!data.name || typeof data.name !== 'string') return null;
  if (!data.gender || !['male', 'female', 'other'].includes(data.gender)) return null;
  if (!data.likes || typeof data.likes !== 'string') return null;
  if (!data.dislikes || typeof data.dislikes !== 'string') return null;
  if (!data.background || typeof data.background !== 'string') return null;
  if (!data.voiceStyle || !['cute', 'serious', 'humorous', 'gentle', 'energetic'].includes(data.voiceStyle)) return null;

  // 验证长度限制
  if (data.name.length < 1 || data.name.length > 20) return null;
  if (data.likes.length < 10 || data.likes.length > 100) return null;
  if (data.dislikes.length < 10 || data.dislikes.length > 100) return null;
  if (data.background.length < 50 || data.background.length > 500) return null;

  return {
    name: data.name,
    gender: data.gender,
    likes: data.likes,
    dislikes: data.dislikes,
    background: data.background,
    voiceStyle: data.voiceStyle
  };
};

// 生成角色的主函数
export const generateCharacter = async (
  userInput: string,
  apiConfig: APIConfig
): Promise<GeneratedCharacterData> => {
  if (!userInput.trim()) {
    throw new Error('请输入角色描述');
  }

  if (!apiConfig) {
    throw new Error('请先配置API');
  }

  try {
    // 动态导入OpenAI
    const { default: OpenAI } = await import('openai');
    
    const client = new OpenAI({
      apiKey: apiConfig.apiKey,
      baseURL: apiConfig.baseURL,
      dangerouslyAllowBrowser: true
    });

    const response = await client.chat.completions.create({
      model: apiConfig.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: getUserPrompt(userInput) }
      ],
      temperature: 0.8, // 稍高的温度以增加创造性
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI未返回有效响应');
    }

    console.log('AI原始响应:', content);

    const characterData = parseAIResponse(content);
    if (!characterData) {
      throw new Error('无法解析AI生成的角色数据，请重试');
    }

    return characterData;
  } catch (error) {
    console.error('生成角色失败:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('生成角色失败，请重试');
  }
};

// 示例输入模板
export const EXAMPLE_INPUTS = [
  '一个喜欢猫的温柔女孩，有点内向但很善良',
  '搞笑的程序员，总是说冷笑话，喜欢熬夜写代码',
  '神秘的魔法师，来自异世界，说话充满智慧',
  '活泼的运动少年，充满正能量，喜欢各种运动',
  '优雅的贵族小姐，有点傲娇但内心善良'
];

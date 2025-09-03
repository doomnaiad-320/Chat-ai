import type { GlobalPrompt, ToneConfig, AIStyleConfig } from '../types';

// 语气词配置
export const TONE_WORDS: ToneConfig = {
  cute: ['呢', '呀', '啦', '喔', '哦', '嘛', '呐', '哟', '咯', '嘞'],
  gentle: ['呢', '哦', '啊', '呀', '嗯', '吧', '呐', '哟'],
  serious: ['。', '呢', '吧', '啊', '嗯'],
  humorous: ['哈哈', '嘿嘿', '呀', '啦', '喔', '哟', '咯', '嘞'],
  energetic: ['呀', '啦', '哦', '呢', '嘛', '咯', '哟', '嘞', '呐']
};

// 表情符号配置
export const EMOJI_SETS = {
  cute: ['😊', '😄', '😆', '🥰', '😘', '😋', '🤗', '😇', '🌸', '💕', '✨', '🎀'],
  gentle: ['😊', '😌', '🙂', '😇', '🌸', '🌺', '🍃', '💫', '✨'],
  serious: ['😐', '🤔', '😑', '😶', '🙄'],
  humorous: ['😄', '😆', '🤣', '😂', '😜', '😝', '🤪', '😎', '🤭', '😏'],
  energetic: ['😄', '😆', '🤩', '😍', '🥳', '🎉', '⚡', '🔥', '💪', '🌟']
};

// 默认AI风格配置
export const DEFAULT_AI_STYLE: AIStyleConfig = {
  useEmoji: true,
  maxSentences: 2,
  useToneWords: true,
  conversationalStyle: true,
  characterConsistency: true
};

// 内置全局提示词
export const BUILTIN_GLOBAL_PROMPTS: Omit<GlobalPrompt, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'conversational_style',
    name: '口语化对话风格',
    type: 'style',
    priority: 95,
    isActive: true,
    content: `请使用自然的口语化方式回复，就像真人聊天一样。要求：
1. 使用"呢"、"呀"、"啦"、"哦"等语气词让对话更生动
2. 适当使用emoji表情符号增加亲和力
3. 模仿真人聊天的节奏，不要过于正式
4. 保持角色性格的一致性
注意：必须严格遵守长度限制！`
  },
  {
    id: 'emoji_enhancement',
    name: '表情符号增强',
    type: 'style',
    priority: 80,
    isActive: true,
    content: `在回复中适当使用表情符号：
- 开心时用😊😄🥰等
- 思考时用🤔💭等  
- 惊讶时用😮😯等
- 但不要过度使用，保持自然`
  },
  {
    id: 'strict_length_control',
    name: '严格回复长度控制',
    type: 'system',
    priority: 100,
    isActive: true,
    content: `【强制要求】回复格式严格限制：
➤ 【重要】回复必须是1-2句话
➤ 【重要】每句话不超过50个字符
➤ 【禁止】使用"首先"、"第一"、"以下"、"然后"、"接下来"等词
➤ 【禁止】使用换行符和冒号
➤ 保持回复简短，像真人聊天一样
请严格遵守以上格式要求！违反此规则将被强制修正！`
  },
  {
    id: 'personality_consistency',
    name: '性格一致性',
    type: 'personality',
    priority: 95,
    isActive: true,
    content: `始终保持角色设定的性格特征：
- 根据角色的voiceStyle调整语气
- 可爱型：多用"呢"、"呀"、"啦"等语气词
- 温柔型：语气温和，多用"哦"、"呢"
- 严肃型：语气正式一些，少用语气词
- 幽默型：可以开玩笑，用"哈哈"、"嘿嘿"
- 活泼型：语气活跃，多用感叹号和表情`
  },
  {
    id: 'natural_rhythm',
    name: '自然对话节奏',
    type: 'style',
    priority: 85,
    isActive: true,
    content: `模仿真人聊天的自然节奏：
- 不要立即回答所有问题
- 可以先回应情感，再回答具体内容
- 适当使用"嗯"、"哦"等回应词
- 偶尔可以反问或表达好奇`
  }
];

// 根据角色类型获取合适的语气词
export const getToneWordsForVoiceStyle = (voiceStyle: string): string[] => {
  switch (voiceStyle) {
    case 'cute':
      return TONE_WORDS.cute;
    case 'gentle':
      return TONE_WORDS.gentle;
    case 'serious':
      return TONE_WORDS.serious;
    case 'humorous':
      return TONE_WORDS.humorous;
    case 'energetic':
      return TONE_WORDS.energetic;
    default:
      return TONE_WORDS.gentle;
  }
};

// 根据角色类型获取合适的表情符号
export const getEmojisForVoiceStyle = (voiceStyle: string): string[] => {
  switch (voiceStyle) {
    case 'cute':
      return EMOJI_SETS.cute;
    case 'gentle':
      return EMOJI_SETS.gentle;
    case 'serious':
      return EMOJI_SETS.serious;
    case 'humorous':
      return EMOJI_SETS.humorous;
    case 'energetic':
      return EMOJI_SETS.energetic;
    default:
      return EMOJI_SETS.gentle;
  }
};

// 随机选择语气词
export const getRandomToneWord = (voiceStyle: string): string => {
  const toneWords = getToneWordsForVoiceStyle(voiceStyle);
  return toneWords[Math.floor(Math.random() * toneWords.length)];
};

// 随机选择表情符号
export const getRandomEmoji = (voiceStyle: string): string => {
  const emojis = getEmojisForVoiceStyle(voiceStyle);
  return emojis[Math.floor(Math.random() * emojis.length)];
};

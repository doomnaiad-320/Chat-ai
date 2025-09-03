import type { Character, AIStyleConfig } from '../types';
import {
  getToneWordsForVoiceStyle,
  getEmojisForVoiceStyle,
  getRandomToneWord,
  getRandomEmoji
} from '../config/globalPrompts';
import { recordAIViolation, type ViolationType } from './aiComplianceMonitor';

// 回复长度控制配置
interface LengthControlConfig {
  maxCharacters: number;      // 最大字符数
  maxSentences: number;       // 最大句子数
  maxCharactersPerSentence: number; // 每句最大字符数
  enableStrictMode: boolean;  // 是否启用严格模式
}

// 违规统计
interface ViolationStats {
  lengthViolations: number;
  sentenceViolations: number;
  totalViolations: number;
}

export class AIResponseProcessor {
  private styleConfig: AIStyleConfig;
  private lengthConfig: LengthControlConfig;
  private violationStats: ViolationStats;

  constructor(styleConfig: AIStyleConfig) {
    this.styleConfig = styleConfig;
    this.lengthConfig = {
      maxCharacters: 50,
      maxSentences: 2,
      maxCharactersPerSentence: 50,
      enableStrictMode: true
    };
    this.violationStats = {
      lengthViolations: 0,
      sentenceViolations: 0,
      totalViolations: 0
    };
  }

  // 处理AI回复，严格控制长度并添加口语化元素
  processResponse(response: string, character: Character): string {
    const originalResponse = response.trim();
    let processedResponse = originalResponse;

    // 1. 【核心】严格的长度和句子数量控制
    processedResponse = this.enforceLengthLimit(processedResponse);

    // 2. 验证是否为普通回复
    if (!this.isNormalResponse(processedResponse)) {
      processedResponse = this.forceNormalResponse(processedResponse);
    }

    // 3. 添加语气词（在长度限制内）
    if (this.styleConfig.useToneWords) {
      processedResponse = this.addToneWords(processedResponse, character.voiceStyle);
    }

    // 4. 添加表情符号（在长度限制内）
    if (this.styleConfig.useEmoji) {
      processedResponse = this.addEmojis(processedResponse, character.voiceStyle);
    }

    // 5. 最终长度校验
    processedResponse = this.finalLengthCheck(processedResponse);

    // 6. 记录违规情况
    if (processedResponse !== originalResponse) {
      // 异步记录违规，不阻塞回复处理
      this.recordViolation(originalResponse, processedResponse).catch(error => {
        console.error('记录AI违规失败:', error);
      });
    }

    return processedResponse;
  }

  // 【核心方法】判定是否为普通回复
  private isNormalResponse(response: string): boolean {
    const sentences = this.getSentences(response);
    const totalLength = response.length;

    return (
      totalLength <= this.lengthConfig.maxCharacters &&           // 字符数≤50
      sentences.length <= this.lengthConfig.maxSentences &&      // 句子数≤2
      !response.includes('\n') &&                                // 不能有换行
      !response.includes('：') &&                                // 不能有冒号（避免列表）
      !response.includes('以下') &&                              // 不能有"以下"等长篇标志词
      !response.includes('首先') &&                              // 不能有"首先"
      !response.includes('第一') &&                              // 不能有"第一"
      !response.includes('然后') &&                              // 不能有"然后"
      !response.includes('接下来')                               // 不能有"接下来"
    );
  }

  // 【核心方法】强制修正过长回复
  private enforceLengthLimit(response: string): string {
    if (response.length <= this.lengthConfig.maxCharacters) {
      return response;
    }

    // 优先按标点拆分
    const sentences = response.split(/(?<=[.!?。！？])/g).filter(s => s.trim().length > 0);
    let shortened = '';
    let charCount = 0;
    let sentenceCount = 0;

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (charCount + trimmedSentence.length <= this.lengthConfig.maxCharacters &&
          sentenceCount < this.lengthConfig.maxSentences) {
        shortened += trimmedSentence;
        charCount += trimmedSentence.length;
        if (/[.!?。！？]/.test(trimmedSentence)) {
          sentenceCount++;
        }
      } else {
        break;
      }
    }

    // 如果还是太长，强制截断
    if (shortened.length > this.lengthConfig.maxCharacters) {
      shortened = shortened.substring(0, this.lengthConfig.maxCharacters - 3) + '...';
    }

    return shortened || response.substring(0, this.lengthConfig.maxCharacters - 3) + '...';
  }

  // 【核心方法】强制转换为普通回复
  private forceNormalResponse(response: string): string {
    let processed = response;

    // 移除长篇标志词
    const longFormIndicators = ['首先', '第一', '以下', '然后', '接下来', '另外', '此外'];
    longFormIndicators.forEach(indicator => {
      processed = processed.replace(new RegExp(indicator + '[，,]?', 'g'), '');
    });

    // 移除换行和冒号
    processed = processed.replace(/\n/g, ' ').replace(/：/g, '，');

    // 确保长度限制
    processed = this.enforceLengthLimit(processed);

    return processed;
  }

  // 获取句子数组
  private getSentences(text: string): string[] {
    return text.split(/[.!?。！？]/).filter(s => s.trim().length > 0);
  }

  // 最终长度校验
  private finalLengthCheck(response: string): string {
    if (response.length > this.lengthConfig.maxCharacters) {
      return response.substring(0, this.lengthConfig.maxCharacters - 3) + '...';
    }
    return response;
  }

  // 记录违规情况并上报到合规监控器
  private async recordViolation(original: string, processed: string): Promise<void> {
    const violations: ViolationType[] = [];

    // 检查长度违规
    if (original.length > this.lengthConfig.maxCharacters) {
      this.violationStats.lengthViolations++;
      violations.push('length_violation');
    }

    // 检查句子数量违规
    const originalSentences = this.getSentences(original);
    if (originalSentences.length > this.lengthConfig.maxSentences) {
      this.violationStats.sentenceViolations++;
      violations.push('sentence_violation');
    }

    // 检查格式违规
    if (original.includes('\n') || original.includes('：')) {
      violations.push('format_violation');
    }

    // 检查关键词违规
    const forbiddenKeywords = ['首先', '第一', '以下', '然后', '接下来', '另外', '此外'];
    if (forbiddenKeywords.some(keyword => original.includes(keyword))) {
      violations.push('keyword_violation');
    }

    this.violationStats.totalViolations++;

    // 上报到合规监控器
    for (const violationType of violations) {
      await recordAIViolation(violationType, original, processed);
    }
  }

  // 添加语气词（在长度限制内）
  private addToneWords(text: string, voiceStyle: string): string {
    // 检查是否会超出长度限制
    const toneWord = getRandomToneWord(voiceStyle);
    const potentialLength = text.length + toneWord.length;

    if (potentialLength > this.lengthConfig.maxCharacters) {
      return text; // 不添加，避免超长
    }

    // 如果文本已经有语气词，就不添加了
    const existingToneWords = ['呢', '呀', '啦', '哦', '嘛', '呐', '哟', '咯', '嘞', '吧', '啊', '嗯'];
    const hasExistingTone = existingToneWords.some(word => text.includes(word));

    if (hasExistingTone) {
      return text;
    }

    // 随机决定是否添加语气词（70%概率）
    if (Math.random() > 0.7) {
      return text;
    }

    // 在句子末尾添加语气词
    if (text.endsWith('。') || text.endsWith('！') || text.endsWith('？')) {
      const result = text.slice(0, -1) + toneWord + text.slice(-1);
      return this.finalLengthCheck(result);
    } else {
      const result = text + toneWord;
      return this.finalLengthCheck(result);
    }
  }

  // 添加表情符号（在长度限制内）
  private addEmojis(text: string, voiceStyle: string): string {
    // 检查是否会超出长度限制
    const emoji = getRandomEmoji(voiceStyle);
    const potentialLength = text.length + emoji.length + 1; // +1 for space

    if (potentialLength > this.lengthConfig.maxCharacters) {
      return text; // 不添加，避免超长
    }

    // 如果文本已经有表情符号，就不添加了
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(text)) {
      return text;
    }

    // 随机决定是否添加表情符号（60%概率）
    if (Math.random() > 0.6) {
      return text;
    }

    // 在文本末尾添加表情符号
    const result = text + ' ' + emoji;
    return this.finalLengthCheck(result);
  }

  // 获取违规统计
  getViolationStats(): ViolationStats {
    return { ...this.violationStats };
  }

  // 重置违规统计
  resetViolationStats(): void {
    this.violationStats = {
      lengthViolations: 0,
      sentenceViolations: 0,
      totalViolations: 0
    };
  }

  // 更新长度控制配置
  updateLengthConfig(newConfig: Partial<LengthControlConfig>): void {
    this.lengthConfig = { ...this.lengthConfig, ...newConfig };
  }

  // 更新样式配置
  updateStyleConfig(newConfig: Partial<AIStyleConfig>): void {
    this.styleConfig = { ...this.styleConfig, ...newConfig };
  }

  // 获取当前配置
  getCurrentConfig(): { lengthConfig: LengthControlConfig; styleConfig: AIStyleConfig } {
    return {
      lengthConfig: { ...this.lengthConfig },
      styleConfig: { ...this.styleConfig }
    };
  }
}

// 创建默认的响应处理器实例
export const createResponseProcessor = (styleConfig: AIStyleConfig) => {
  return new AIResponseProcessor(styleConfig);
};

// 快速处理函数
export const processAIResponse = (
  response: string, 
  character: Character, 
  styleConfig: AIStyleConfig
): string => {
  const processor = new AIResponseProcessor(styleConfig);
  return processor.processResponse(response, character);
};

// 长度控制测试用例
export const LENGTH_CONTROL_TESTS = {
  // 正常长度回复
  normal: {
    input: "你好，我很高兴认识你！",
    expected: "≤50字符，1-2句话",
    shouldPass: true
  },
  // 过长回复
  tooLong: {
    input: "你好，我很高兴认识你。今天天气真的很好，我们可以一起出去走走，看看外面的风景，呼吸新鲜空气。",
    expected: "自动截断到50字符内",
    shouldPass: false
  },
  // 句子过多
  tooManySentences: {
    input: "你好！我很高兴认识你！今天天气很好！我们出去玩吧！",
    expected: "保留前2句",
    shouldPass: false
  },
  // 包含长篇标志词
  longFormIndicators: {
    input: "首先，我要说你好。然后，我们可以聊聊天气。",
    expected: "移除长篇标志词",
    shouldPass: false
  }
};

// 在开发环境中输出测试结果
if (process.env.NODE_ENV === 'development') {
  console.log('=== 严格长度控制测试 ===');
  console.log('测试用例:');
  Object.entries(LENGTH_CONTROL_TESTS).forEach(([testName, testCase]) => {
    console.log(`${testName}:`, {
      input: testCase.input,
      inputLength: testCase.input.length,
      expected: testCase.expected,
      shouldPass: testCase.shouldPass
    });
  });

  console.log('\n长度控制标准:');
  console.log('- 最大字符数: 50');
  console.log('- 最大句子数: 2');
  console.log('- 禁止词汇: 首先、第一、以下、然后、接下来');
  console.log('- 禁止格式: 换行、冒号');
}

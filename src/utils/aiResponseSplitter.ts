import type { Message } from '../types';

// 消息格式配置
export const MESSAGE_FORMATS = {
  TEXT: /\[([^|]+)\|([^\]]+)\]/g,           // [角色名|消息内容]
  EMOJI: /<([^|]+)\|([^>]+)>/g,            // <角色名|表情ID>
  VOICE: /\[([^|]+)\|语音\|([^|]+)\|([^\]]+)\]/g, // [角色名|语音|时长|内容]
  RETRACT: /\{([^|]+)\|([^}]+)\}/g,        // {角色名|要撤回的内容}
  QUOTE: /\[([^|]+)\|引用\|([^|]+)\|([^|]+)\|([^\]]+)\]/g, // [角色名|引用|被引用人|被引用内容|新内容]
  INNER_VOICE: /【心声\|([^|]+)\|([^】]+)】/g,  // 【心声|角色名|内心想法】
  ESSAY: /「随笔\|([^|]+)\|([^」]+)」/g,        // 「随笔|角色名|随笔内容」
  SYSTEM: /<系统>([^<]+)<\/系统>/g,         // <系统>系统消息</系统>
  NARRATOR: /<旁白>([^<]+)<\/旁白>/g        // <旁白>旁白内容</旁白>
};

export interface SplitterOptions {
  baseDelay: number;           // 基础延迟(ms)
  randomDelay: number;         // 随机延迟范围(ms)
  retractDelay: number;        // 撤回延迟基础时间(ms)
  retractRandomDelay: number;  // 撤回随机延迟(ms)
  typingDuration: number;      // typing指示器显示时间(ms)
}

export class AIResponseSplitter {
  private options: SplitterOptions;

  constructor(options: Partial<SplitterOptions> = {}) {
    this.options = {
      baseDelay: 200,
      randomDelay: 400,
      retractDelay: 1000,
      retractRandomDelay: 1000,
      typingDuration: 800,
      ...options
    };
  }

  // 解析AI回复文本
  parseAIResponse(responseText: string, characterId: string): Message[] {
    const messages: Message[] = [];
    let messageIndex = 0;
    
    // 按顺序匹配所有格式
    const allMatches: Array<{
      type: string;
      match: RegExpMatchArray;
      index: number;
      content: string;
    }> = [];
    
    // 收集所有匹配项及其位置
    Object.entries(MESSAGE_FORMATS).forEach(([type, regex]) => {
      let match;
      const tempRegex = new RegExp(regex.source, 'g');
      while ((match = tempRegex.exec(responseText)) !== null) {
        allMatches.push({
          type: type.toLowerCase(),
          match: match,
          index: match.index,
          content: match[0]
        });
      }
    });
    
    // 按位置排序
    allMatches.sort((a, b) => a.index - b.index);
    
    // 解析每个匹配项
    allMatches.forEach((item, index) => {
      const messageData = this.parseMessageByType(item, characterId, index);
      if (messageData) {
        messages.push(messageData);
      }
    });
    
    return messages;
  }

  // 根据类型解析消息
  private parseMessageByType(
    item: { type: string; match: RegExpMatchArray },
    characterId: string,
    index: number
  ): Message | null {
    const baseTimestamp = new Date(Date.now() + (index * 100));
    const { type, match } = item;
    
    switch (type) {
      case 'text':
        return this.createMessage('text', match[1], match[2], characterId, baseTimestamp);
      
      case 'emoji':
        return this.createMessage('emoji', match[1], `[表情:${match[2]}]`, characterId, baseTimestamp);
      
      case 'voice':
        return this.createMessage('voice', match[1], `[语音 ${match[2]}] ${match[3]}`, characterId, baseTimestamp);
      
      case 'retract':
        return this.createMessage('text', match[1], match[2], characterId, baseTimestamp, {
          shouldRetract: true
        });
      
      case 'quote':
        return this.createMessage('quote', match[1], 
          `引用 @${match[2]}: ${match[3]}\n${match[4]}`, 
          characterId, baseTimestamp);
      
      case 'inner_voice':
        return this.createMessage('inner_voice', match[1], `💭 ${match[2]}`, characterId, baseTimestamp);
      
      case 'essay':
        return this.createMessage('essay', match[1], `📝 ${match[2]}`, characterId, baseTimestamp);
      
      case 'system':
        return this.createMessage('system', 'System', `[系统] ${match[1]}`, characterId, baseTimestamp);
      
      case 'narrator':
        return this.createMessage('narrator', 'Narrator', `[旁白] ${match[1]}`, characterId, baseTimestamp);
      
      default:
        return null;
    }
  }

  // 创建消息对象
  private createMessage(
    messageType: Message['messageType'],
    senderName: string,
    content: string,
    characterId: string,
    timestamp: Date,
    options: Partial<Message> = {}
  ): Message {
    return {
      id: this.generateMessageId(),
      content: content,
      sender: 'ai',
      characterId: characterId,
      timestamp: timestamp,
      status: 'sent',
      messageType: messageType,
      originalSender: senderName,
      shouldRetract: options.shouldRetract || false,
      retractDelay: options.shouldRetract ? 
        this.options.retractDelay + Math.random() * this.options.retractRandomDelay : 
        undefined,
      displayDelay: this.calculateDelay(),
      ...options
    };
  }

  // 计算随机延迟
  private calculateDelay(): number {
    return this.options.baseDelay + Math.random() * this.options.randomDelay;
  }

  // 生成消息ID
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 检查文本是否包含可拆分的格式
  static hasStructuredFormat(text: string): boolean {
    return Object.values(MESSAGE_FORMATS).some(regex => regex.test(text));
  }
}

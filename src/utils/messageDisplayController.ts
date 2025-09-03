import type { Message } from '../types';

export interface DisplayControllerOptions {
  onMessageAdd: (message: Message) => Promise<void>;
  onMessageRetract: (messageId: string) => Promise<void>;
  onTypingStart: (characterName: string) => void;
  onTypingEnd: () => void;
  typingDuration: number;
}

export class MessageDisplayController {
  private options: DisplayControllerOptions;
  private isDisplaying = false;
  private retractTimers = new Map<string, NodeJS.Timeout>();

  constructor(options: DisplayControllerOptions) {
    this.options = options;
  }

  // 显示消息序列
  async displayMessages(messages: Message[]): Promise<void> {
    if (this.isDisplaying || messages.length === 0) return;
    
    this.isDisplaying = true;

    try {
      // 显示typing指示器
      const firstMessage = messages[0];
      const characterName = firstMessage.originalSender || '角色';
      
      this.options.onTypingStart(characterName);
      await this.sleep(this.options.typingDuration);
      this.options.onTypingEnd();

      // 逐个显示消息
      for (const message of messages) {
        await this.displaySingleMessage(message);
      }
    } finally {
      this.isDisplaying = false;
    }
  }

  // 显示单个消息
  private async displaySingleMessage(message: Message): Promise<void> {
    // 等待延迟
    if (message.displayDelay) {
      await this.sleep(message.displayDelay);
    }

    // 添加消息到UI
    await this.options.onMessageAdd(message);

    // 如果需要撤回
    if (message.shouldRetract && message.retractDelay) {
      const timer = setTimeout(async () => {
        await this.options.onMessageRetract(message.id);
        this.retractTimers.delete(message.id);
      }, message.retractDelay);
      
      this.retractTimers.set(message.id, timer);
    }
  }

  // 工具方法：延迟
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 清理资源
  destroy(): void {
    // 清理所有撤回定时器
    this.retractTimers.forEach(timer => clearTimeout(timer));
    this.retractTimers.clear();
    this.isDisplaying = false;
  }

  // 取消所有待处理的操作
  cancel(): void {
    this.destroy();
  }
}

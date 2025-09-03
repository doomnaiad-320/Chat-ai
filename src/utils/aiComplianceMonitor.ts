import { get as idbGet, set as idbSet } from 'idb-keyval';
import type { GlobalPrompt } from '../types';

// 违规类型
export type ViolationType = 'length_violation' | 'sentence_violation' | 'format_violation' | 'keyword_violation';

// 违规统计数据
export interface ComplianceStats {
  lengthViolations: number;
  sentenceViolations: number;
  formatViolations: number;
  keywordViolations: number;
  totalViolations: number;
  lastViolationTime: Date;
  promptStrengthLevel: number; // 1-5，数字越大提示词越严格
}

// AI合规监控器
export class AIComplianceMonitor {
  private static instance: AIComplianceMonitor;
  private stats: ComplianceStats;
  private readonly VIOLATION_THRESHOLD = 5; // 违规阈值
  private readonly MAX_STRENGTH_LEVEL = 5;

  private constructor() {
    this.stats = {
      lengthViolations: 0,
      sentenceViolations: 0,
      formatViolations: 0,
      keywordViolations: 0,
      totalViolations: 0,
      lastViolationTime: new Date(),
      promptStrengthLevel: 1
    };
    this.loadStats();
  }

  public static getInstance(): AIComplianceMonitor {
    if (!AIComplianceMonitor.instance) {
      AIComplianceMonitor.instance = new AIComplianceMonitor();
    }
    return AIComplianceMonitor.instance;
  }

  // 记录违规
  async recordViolation(violationType: ViolationType, originalResponse: string, correctedResponse: string): Promise<void> {
    this.stats[violationType]++;
    this.stats.totalViolations++;
    this.stats.lastViolationTime = new Date();

    // 保存统计数据
    await this.saveStats();

    // 检查是否需要强化提示词
    if (this.shouldStrengthenPrompt(violationType)) {
      await this.strengthenPrompt(violationType);
    }

    // 在开发环境中输出违规信息
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🚨 AI违规检测: ${violationType}`, {
        original: originalResponse,
        corrected: correctedResponse,
        violationCount: this.stats[violationType],
        totalViolations: this.stats.totalViolations
      });
    }
  }

  // 判断是否需要强化提示词
  private shouldStrengthenPrompt(violationType: ViolationType): boolean {
    const violationCount = this.stats[violationType];
    return violationCount > 0 && violationCount % this.VIOLATION_THRESHOLD === 0;
  }

  // 强化提示词
  private async strengthenPrompt(violationType: ViolationType): Promise<void> {
    if (this.stats.promptStrengthLevel >= this.MAX_STRENGTH_LEVEL) {
      console.warn('提示词强度已达最大值，无法继续强化');
      return;
    }

    try {
      // 获取当前的全局提示词
      const globalPrompts: GlobalPrompt[] = await idbGet('globalPrompts') || [];
      const lengthControlPrompt = globalPrompts.find(p => p.id === 'strict_length_control');

      if (lengthControlPrompt) {
        // 根据违规类型强化提示词
        const strengthenedContent = this.getStrengthenedPromptContent(violationType, this.stats.promptStrengthLevel + 1);
        
        lengthControlPrompt.content = strengthenedContent;
        lengthControlPrompt.updatedAt = new Date();
        
        // 保存更新后的提示词
        await idbSet('globalPrompts', globalPrompts);
        
        // 更新强度等级
        this.stats.promptStrengthLevel++;
        await this.saveStats();

        console.log(`📈 提示词强化: ${violationType} -> 强度等级 ${this.stats.promptStrengthLevel}`);
      }
    } catch (error) {
      console.error('强化提示词失败:', error);
    }
  }

  // 获取强化后的提示词内容
  private getStrengthenedPromptContent(violationType: ViolationType, strengthLevel: number): string {
    const baseContent = `【强制要求】回复格式严格限制：
➤ 【重要】回复必须是1-2句话
➤ 【重要】每句话不超过50个字符
➤ 【禁止】使用"首先"、"第一"、"以下"、"然后"、"接下来"等词
➤ 【禁止】使用换行符和冒号
➤ 保持回复简短，像真人聊天一样`;

    const strengthenedSuffixes = [
      '', // 强度1：基础版本
      '\n⚠️ 违反格式要求将被强制修正！',
      '\n⚠️ 已检测到多次违规，请严格遵守格式！',
      '\n🚨 警告：继续违规将影响对话质量！',
      '\n🚨 最终警告：必须严格按照格式回复！',
      '\n💀 强制模式：任何违规都将被立即截断！'
    ];

    const suffix = strengthenedSuffixes[Math.min(strengthLevel, strengthenedSuffixes.length - 1)];
    
    // 根据违规类型添加特定警告
    let specificWarning = '';
    switch (violationType) {
      case 'length_violation':
        specificWarning = '\n📏 特别注意：严格控制字符数量！';
        break;
      case 'sentence_violation':
        specificWarning = '\n📝 特别注意：严格控制句子数量！';
        break;
      case 'format_violation':
        specificWarning = '\n📋 特别注意：禁止使用换行和冒号！';
        break;
      case 'keyword_violation':
        specificWarning = '\n🚫 特别注意：禁止使用长篇标志词！';
        break;
    }

    return baseContent + suffix + specificWarning;
  }

  // 获取统计数据
  getStats(): ComplianceStats {
    return { ...this.stats };
  }

  // 重置统计数据
  async resetStats(): Promise<void> {
    this.stats = {
      lengthViolations: 0,
      sentenceViolations: 0,
      formatViolations: 0,
      keywordViolations: 0,
      totalViolations: 0,
      lastViolationTime: new Date(),
      promptStrengthLevel: 1
    };
    await this.saveStats();
  }

  // 加载统计数据
  private async loadStats(): Promise<void> {
    try {
      const savedStats = await idbGet('aiComplianceStats');
      if (savedStats) {
        this.stats = {
          ...savedStats,
          lastViolationTime: new Date(savedStats.lastViolationTime)
        };
      }
    } catch (error) {
      console.error('加载合规统计数据失败:', error);
    }
  }

  // 保存统计数据
  private async saveStats(): Promise<void> {
    try {
      await idbSet('aiComplianceStats', this.stats);
    } catch (error) {
      console.error('保存合规统计数据失败:', error);
    }
  }

  // 获取违规报告
  getViolationReport(): string {
    const { totalViolations, lengthViolations, sentenceViolations, formatViolations, keywordViolations, promptStrengthLevel } = this.stats;
    
    if (totalViolations === 0) {
      return '✅ AI回复完全合规，无违规记录';
    }

    return `📊 AI合规报告:
总违规次数: ${totalViolations}
- 长度违规: ${lengthViolations}
- 句子数违规: ${sentenceViolations}  
- 格式违规: ${formatViolations}
- 关键词违规: ${keywordViolations}
当前提示词强度: ${promptStrengthLevel}/${this.MAX_STRENGTH_LEVEL}
最后违规时间: ${this.stats.lastViolationTime.toLocaleString()}`;
  }
}

// 导出单例实例
export const complianceMonitor = AIComplianceMonitor.getInstance();

// 便捷函数
export const recordAIViolation = (
  violationType: ViolationType, 
  originalResponse: string, 
  correctedResponse: string
) => {
  return complianceMonitor.recordViolation(violationType, originalResponse, correctedResponse);
};

export const getComplianceStats = () => {
  return complianceMonitor.getStats();
};

export const getViolationReport = () => {
  return complianceMonitor.getViolationReport();
};

// 在开发环境中输出初始化信息
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 AI合规监控器已初始化');
  console.log('违规阈值:', AIComplianceMonitor.prototype['VIOLATION_THRESHOLD']);
  console.log('最大强度等级:', AIComplianceMonitor.prototype['MAX_STRENGTH_LEVEL']);
}

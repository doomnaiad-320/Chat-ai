/**
 * AI回复自动改写系统
 * 用于在检测到重复时自动替换词汇和句式，保持回复的多样性
 */

export interface RewriteRule {
  pattern: string | RegExp;
  replacements: string[];
  weight?: number; // 权重，用于优先级排序
}

export interface RewriteConfig {
  enableEmojis: boolean; // 是否启用表情符号变化
  enableToneWords: boolean; // 是否启用语气词变化
  enableStructure: boolean; // 是否启用句式结构变化
  randomness: number; // 随机性程度 (0-1)
}

export const DEFAULT_REWRITE_CONFIG: RewriteConfig = {
  enableEmojis: true,
  enableToneWords: true,
  enableStructure: true,
  randomness: 0.8,
};

/**
 * 预定义的改写规则
 */
export const REWRITE_RULES: Record<string, RewriteRule[]> = {
  // 问候语改写规则
  greetings: [
    {
      pattern: /你好啊?[！!]*[😊😄😃🙂]*$/,
      replacements: [
        "嗨~",
        "哈喽！",
        "嘿嘿，你好呀！",
        "你来啦~",
        "见到你真开心！",
        "嗨嗨！",
        "hello~"
      ],
      weight: 10
    },
    {
      pattern: /很高兴认识你[呢啊哦]*[！!]*[😊😄😃🙂🥰]*/,
      replacements: [
        "认识你真好呢！",
        "幸会幸会！",
        "开心认识你~",
        "见到你真棒！",
        "认识你很开心呢！",
        "能认识你真不错！",
        "很开心遇见你！"
      ],
      weight: 10
    }
  ],

  // 确认语改写规则
  confirmations: [
    {
      pattern: /好的[！!]*[😊😄😃🙂]*$/,
      replacements: [
        "没问题！",
        "可以呀~",
        "行哦！",
        "OK的！",
        "当然可以！",
        "好呀！",
        "嗯嗯！"
      ],
      weight: 8
    },
    {
      pattern: /知道了[！!]*[😊😄😃🙂]*$/,
      replacements: [
        "明白啦！",
        "了解了！",
        "收到~",
        "懂了懂了！",
        "我知道啦！",
        "明白呢！",
        "get到了！"
      ],
      weight: 8
    }
  ],

  // 感谢语改写规则
  thanks: [
    {
      pattern: /谢谢[你呀啊]*[！!]*[😊😄😃🙂🥰]*/,
      replacements: [
        "感谢你呢！",
        "太感谢了！",
        "谢谢啦~",
        "多谢多谢！",
        "感激不尽！",
        "谢谢你哦！",
        "非常感谢！"
      ],
      weight: 7
    }
  ],

  // 语气词改写规则
  toneWords: [
    {
      pattern: /呢[！!]*$/,
      replacements: ["呀！", "哦！", "啊！", "~", "！", "呢~"],
      weight: 3
    },
    {
      pattern: /啊[！!]*$/,
      replacements: ["呢！", "呀！", "哦！", "~", "！", "啊~"],
      weight: 3
    },
    {
      pattern: /哦[！!]*$/,
      replacements: ["呢！", "呀！", "啊！", "~", "！", "哦~"],
      weight: 3
    }
  ],

  // 表情符号改写规则
  emojis: [
    {
      pattern: /😊/g,
      replacements: ["😄", "😃", "🙂", "🥰", "😌", "✨"],
      weight: 2
    },
    {
      pattern: /😄/g,
      replacements: ["😊", "😃", "🙂", "🥰", "😆", "🌟"],
      weight: 2
    },
    {
      pattern: /🙂/g,
      replacements: ["😊", "😄", "😃", "🥰", "😌", "💫"],
      weight: 2
    }
  ]
};

/**
 * 句式结构变化模板
 */
export const STRUCTURE_TEMPLATES = [
  {
    pattern: /^(.+)呢[！!]*$/,
    templates: [
      "$1哦！",
      "$1呀~",
      "$1啊！",
      "嗯嗯，$1！",
      "是的，$1！"
    ]
  },
  {
    pattern: /^(.+)[！!]+$/,
    templates: [
      "$1呢~",
      "$1哦！",
      "$1呀！",
      "嗯，$1！",
      "对呀，$1！"
    ]
  }
];

/**
 * 随机选择替换词
 */
function getRandomReplacement(replacements: string[], randomness: number): string {
  if (randomness >= Math.random()) {
    // 完全随机选择
    return replacements[Math.floor(Math.random() * replacements.length)];
  } else {
    // 倾向于选择前面的选项（更常用的）
    const index = Math.floor(Math.random() * Math.min(3, replacements.length));
    return replacements[index];
  }
}

/**
 * 应用改写规则
 */
function applyRewriteRules(
  text: string, 
  rules: RewriteRule[], 
  config: RewriteConfig
): string {
  let rewrittenText = text;

  // 按权重排序规则
  const sortedRules = rules.sort((a, b) => (b.weight || 0) - (a.weight || 0));

  for (const rule of sortedRules) {
    if (rewrittenText.match(rule.pattern)) {
      const replacement = getRandomReplacement(rule.replacements, config.randomness);
      rewrittenText = rewrittenText.replace(rule.pattern, replacement);
      break; // 只应用第一个匹配的规则
    }
  }

  return rewrittenText;
}

/**
 * 应用句式结构变化
 */
function applyStructureChanges(text: string, config: RewriteConfig): string {
  if (!config.enableStructure) {
    return text;
  }

  for (const template of STRUCTURE_TEMPLATES) {
    const match = text.match(template.pattern);
    if (match) {
      const selectedTemplate = getRandomReplacement(template.templates, config.randomness);
      return selectedTemplate.replace('$1', match[1]);
    }
  }

  return text;
}

/**
 * 主要的改写函数
 */
export function rewriteResponse(
  originalText: string,
  config: RewriteConfig = DEFAULT_REWRITE_CONFIG
): string {
  let rewrittenText = originalText;

  // 1. 应用问候语改写
  rewrittenText = applyRewriteRules(rewrittenText, REWRITE_RULES.greetings, config);

  // 2. 应用确认语改写
  rewrittenText = applyRewriteRules(rewrittenText, REWRITE_RULES.confirmations, config);

  // 3. 应用感谢语改写
  rewrittenText = applyRewriteRules(rewrittenText, REWRITE_RULES.thanks, config);

  // 4. 应用语气词改写（如果启用）
  if (config.enableToneWords) {
    rewrittenText = applyRewriteRules(rewrittenText, REWRITE_RULES.toneWords, config);
  }

  // 5. 应用表情符号改写（如果启用）
  if (config.enableEmojis) {
    rewrittenText = applyRewriteRules(rewrittenText, REWRITE_RULES.emojis, config);
  }

  // 6. 应用句式结构变化
  rewrittenText = applyStructureChanges(rewrittenText, config);

  return rewrittenText;
}

/**
 * 批量改写多个回复
 */
export function batchRewriteResponses(
  responses: string[],
  config: RewriteConfig = DEFAULT_REWRITE_CONFIG
): string[] {
  return responses.map(response => rewriteResponse(response, config));
}

/**
 * 智能改写：根据历史回复调整改写策略
 */
export function intelligentRewrite(
  originalText: string,
  recentResponses: string[],
  config: RewriteConfig = DEFAULT_REWRITE_CONFIG
): string {
  // 分析最近回复中使用的词汇和模式
  const usedPatterns = new Set<string>();
  
  for (const response of recentResponses) {
    // 检查使用过的问候语
    if (response.includes('你好') || response.includes('嗨') || response.includes('哈喽')) {
      usedPatterns.add('greeting');
    }
    
    // 检查使用过的确认语
    if (response.includes('好的') || response.includes('没问题') || response.includes('可以')) {
      usedPatterns.add('confirmation');
    }
    
    // 检查使用过的语气词
    if (response.includes('呢') || response.includes('啊') || response.includes('哦')) {
      usedPatterns.add('toneWord');
    }
  }

  // 根据使用历史调整改写策略
  const adjustedConfig = { ...config };
  
  // 如果最近使用了太多语气词，降低语气词改写的概率
  if (usedPatterns.has('toneWord')) {
    adjustedConfig.randomness *= 0.7;
  }

  return rewriteResponse(originalText, adjustedConfig);
}

/**
 * 获取改写统计信息
 */
export function getRewriteStats(original: string, rewritten: string): {
  isRewritten: boolean;
  changedWords: number;
  similarity: number;
} {
  const isRewritten = original !== rewritten;
  
  if (!isRewritten) {
    return {
      isRewritten: false,
      changedWords: 0,
      similarity: 1.0
    };
  }

  // 简单的词汇变化统计
  const originalWords = original.split(/\s+/);
  const rewrittenWords = rewritten.split(/\s+/);
  
  let changedWords = 0;
  const maxLength = Math.max(originalWords.length, rewrittenWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (originalWords[i] !== rewrittenWords[i]) {
      changedWords++;
    }
  }

  const similarity = 1 - (changedWords / maxLength);

  return {
    isRewritten: true,
    changedWords,
    similarity: Math.round(similarity * 1000) / 1000
  };
}

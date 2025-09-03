/**
 * AI回复相似度检测工具
 * 用于检测和防止AI回复重复
 */

export interface SimilarityResult {
  similarity: number;
  isRepetitive: boolean;
  matchedText?: string;
}

export interface SimilarityConfig {
  threshold: number; // 相似度阈值，默认0.7 (70%)
  lookbackCount: number; // 检查最近几条消息，默认5
  minLength: number; // 最小检测长度，默认10个字符
}

/**
 * 默认配置
 */
export const DEFAULT_SIMILARITY_CONFIG: SimilarityConfig = {
  threshold: 0.7,
  lookbackCount: 5,
  minLength: 10,
};

/**
 * 文本预处理：移除标点符号、表情符号、多余空格
 */
export function preprocessText(text: string): string {
  return text
    // 移除表情符号 (Unicode范围)
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    // 移除常见标点符号
    .replace(/[，。！？、；：""''（）【】《》〈〉「」『』〔〕〖〗〘〙〚〛,.!?;:"'()\[\]{}<>]/g, '')
    // 移除多余空格
    .replace(/\s+/g, ' ')
    // 转换为小写
    .toLowerCase()
    // 去除首尾空格
    .trim();
}

/**
 * 计算两个文本的相似度 (基于字符匹配)
 * 使用改进的Jaccard相似度算法
 */
export function calculateSimilarity(text1: string, text2: string): number {
  // 预处理文本
  const processed1 = preprocessText(text1);
  const processed2 = preprocessText(text2);

  // 如果任一文本为空，返回0
  if (!processed1 || !processed2) {
    return 0;
  }

  // 如果文本完全相同，返回1
  if (processed1 === processed2) {
    return 1;
  }

  // 将文本分割为字符数组
  const chars1 = Array.from(processed1);
  const chars2 = Array.from(processed2);

  // 计算字符集合的交集和并集
  const set1 = new Set(chars1);
  const set2 = new Set(chars2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  // Jaccard相似度 = 交集大小 / 并集大小
  const jaccardSimilarity = intersection.size / union.size;

  // 考虑文本长度的相似度 (防止短文本误判)
  const lengthSimilarity = Math.min(chars1.length, chars2.length) / Math.max(chars1.length, chars2.length);

  // 综合相似度 (Jaccard相似度权重70%，长度相似度权重30%)
  const combinedSimilarity = jaccardSimilarity * 0.7 + lengthSimilarity * 0.3;

  return Math.round(combinedSimilarity * 1000) / 1000; // 保留3位小数
}

/**
 * 计算更精确的相似度 (基于n-gram)
 */
export function calculateNGramSimilarity(text1: string, text2: string, n: number = 2): number {
  const processed1 = preprocessText(text1);
  const processed2 = preprocessText(text2);

  if (!processed1 || !processed2) {
    return 0;
  }

  if (processed1 === processed2) {
    return 1;
  }

  // 生成n-gram
  const generateNGrams = (text: string, n: number): Set<string> => {
    const ngrams = new Set<string>();
    for (let i = 0; i <= text.length - n; i++) {
      ngrams.add(text.substring(i, i + n));
    }
    return ngrams;
  };

  const ngrams1 = generateNGrams(processed1, n);
  const ngrams2 = generateNGrams(processed2, n);

  const intersection = new Set([...ngrams1].filter(x => ngrams2.has(x)));
  const union = new Set([...ngrams1, ...ngrams2]);

  return intersection.size / union.size;
}

/**
 * 检测文本是否与历史消息重复
 */
export function detectRepetition(
  newText: string,
  recentTexts: string[],
  config: SimilarityConfig = DEFAULT_SIMILARITY_CONFIG
): SimilarityResult {
  // 如果新文本太短，不进行检测
  if (newText.length < config.minLength) {
    return {
      similarity: 0,
      isRepetitive: false,
    };
  }

  let maxSimilarity = 0;
  let matchedText: string | undefined;

  // 检查最近的消息
  const textsToCheck = recentTexts.slice(-config.lookbackCount);

  for (const recentText of textsToCheck) {
    if (recentText.length < config.minLength) {
      continue;
    }

    // 计算基础相似度
    const basicSimilarity = calculateSimilarity(newText, recentText);
    
    // 计算n-gram相似度 (更精确)
    const ngramSimilarity = calculateNGramSimilarity(newText, recentText, 2);
    
    // 综合相似度 (基础相似度权重60%，n-gram相似度权重40%)
    const combinedSimilarity = basicSimilarity * 0.6 + ngramSimilarity * 0.4;

    if (combinedSimilarity > maxSimilarity) {
      maxSimilarity = combinedSimilarity;
      matchedText = recentText;
    }
  }

  return {
    similarity: Math.round(maxSimilarity * 1000) / 1000,
    isRepetitive: maxSimilarity >= config.threshold,
    matchedText: maxSimilarity >= config.threshold ? matchedText : undefined,
  };
}

/**
 * 批量检测多个文本的重复情况
 */
export function batchDetectRepetition(
  texts: string[],
  config: SimilarityConfig = DEFAULT_SIMILARITY_CONFIG
): SimilarityResult[] {
  const results: SimilarityResult[] = [];

  for (let i = 0; i < texts.length; i++) {
    const currentText = texts[i];
    const previousTexts = texts.slice(0, i);
    
    const result = detectRepetition(currentText, previousTexts, config);
    results.push(result);
  }

  return results;
}

/**
 * 获取重复统计信息
 */
export function getRepetitionStats(results: SimilarityResult[]): {
  totalCount: number;
  repetitiveCount: number;
  repetitionRate: number;
  averageSimilarity: number;
  maxSimilarity: number;
} {
  const totalCount = results.length;
  const repetitiveCount = results.filter(r => r.isRepetitive).length;
  const similarities = results.map(r => r.similarity);
  
  return {
    totalCount,
    repetitiveCount,
    repetitionRate: totalCount > 0 ? repetitiveCount / totalCount : 0,
    averageSimilarity: similarities.length > 0 ? similarities.reduce((a, b) => a + b, 0) / similarities.length : 0,
    maxSimilarity: similarities.length > 0 ? Math.max(...similarities) : 0,
  };
}

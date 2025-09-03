/**
 * 相似度检测算法测试工具
 * 用于验证和调试相似度检测功能
 */

import {
  calculateSimilarity,
  calculateNGramSimilarity,
  detectRepetition,
  batchDetectRepetition,
  getRepetitionStats,
  preprocessText,
  DEFAULT_SIMILARITY_CONFIG
} from './similarityDetector';

/**
 * 测试用例
 */
export const TEST_CASES = {
  // 完全相同的文本
  identical: [
    "你好啊，很高兴认识你！",
    "你好啊，很高兴认识你！"
  ],
  
  // 高度相似的文本 (应该被检测为重复)
  highlySimilar: [
    "你好啊，很高兴认识你！😊",
    "你好呀，很高兴认识你呢！😄",
    "你好，很高兴认识你哦！🌸"
  ],
  
  // 中等相似的文本
  moderatelySimilar: [
    "今天天气真不错呢！",
    "今天的天气很好啊！",
    "天气很棒呢，今天！"
  ],
  
  // 低相似度文本 (不应该被检测为重复)
  lowSimilarity: [
    "你好，很高兴认识你！",
    "今天天气真不错呢！",
    "我喜欢听音乐和看电影。",
    "你有什么兴趣爱好吗？"
  ],
  
  // 包含表情符号和标点的文本
  withEmojisAndPunctuation: [
    "哈哈哈😂😂😂，太有趣了！！！",
    "哈哈哈🤣🤣🤣，真的很有趣呢！",
    "哈哈，好有趣啊😄"
  ]
};

/**
 * 运行基础相似度测试
 */
export function runBasicSimilarityTests(): void {
  console.log('🧪 开始基础相似度测试...\n');

  // 测试完全相同的文本
  console.log('1. 完全相同文本测试:');
  const identicalSimilarity = calculateSimilarity(
    TEST_CASES.identical[0],
    TEST_CASES.identical[1]
  );
  console.log(`   相似度: ${identicalSimilarity} (期望: 1.0)`);
  console.log(`   ✅ ${identicalSimilarity === 1.0 ? '通过' : '失败'}\n`);

  // 测试高度相似的文本
  console.log('2. 高度相似文本测试:');
  for (let i = 1; i < TEST_CASES.highlySimilar.length; i++) {
    const similarity = calculateSimilarity(
      TEST_CASES.highlySimilar[0],
      TEST_CASES.highlySimilar[i]
    );
    console.log(`   "${TEST_CASES.highlySimilar[0]}" vs "${TEST_CASES.highlySimilar[i]}"`);
    console.log(`   相似度: ${similarity} (期望: > 0.7)`);
    console.log(`   ✅ ${similarity > 0.7 ? '通过' : '失败'}`);
  }
  console.log();

  // 测试低相似度文本
  console.log('3. 低相似度文本测试:');
  for (let i = 1; i < TEST_CASES.lowSimilarity.length; i++) {
    const similarity = calculateSimilarity(
      TEST_CASES.lowSimilarity[0],
      TEST_CASES.lowSimilarity[i]
    );
    console.log(`   "${TEST_CASES.lowSimilarity[0]}" vs "${TEST_CASES.lowSimilarity[i]}"`);
    console.log(`   相似度: ${similarity} (期望: < 0.7)`);
    console.log(`   ✅ ${similarity < 0.7 ? '通过' : '失败'}`);
  }
  console.log();
}

/**
 * 运行重复检测测试
 */
export function runRepetitionDetectionTests(): void {
  console.log('🔍 开始重复检测测试...\n');

  // 测试高度相似文本的重复检测
  console.log('1. 高度相似文本重复检测:');
  const newText = "你好呀，很高兴认识你呢！😄";
  const recentTexts = ["你好啊，很高兴认识你！😊"];
  
  const result = detectRepetition(newText, recentTexts);
  console.log(`   新文本: "${newText}"`);
  console.log(`   历史文本: ["${recentTexts.join('", "')}"]`);
  console.log(`   相似度: ${result.similarity}`);
  console.log(`   是否重复: ${result.isRepetitive}`);
  console.log(`   匹配文本: ${result.matchedText || '无'}`);
  console.log(`   ✅ ${result.isRepetitive ? '通过' : '失败'}\n`);

  // 测试低相似度文本的重复检测
  console.log('2. 低相似度文本重复检测:');
  const newText2 = "今天天气真不错呢！";
  const recentTexts2 = ["你好啊，很高兴认识你！😊"];
  
  const result2 = detectRepetition(newText2, recentTexts2);
  console.log(`   新文本: "${newText2}"`);
  console.log(`   历史文本: ["${recentTexts2.join('", "')}"]`);
  console.log(`   相似度: ${result2.similarity}`);
  console.log(`   是否重复: ${result2.isRepetitive}`);
  console.log(`   ✅ ${!result2.isRepetitive ? '通过' : '失败'}\n`);
}

/**
 * 运行批量检测测试
 */
export function runBatchDetectionTests(): void {
  console.log('📊 开始批量检测测试...\n');

  const testTexts = [
    "你好，很高兴认识你！",
    "你好呀，很高兴认识你呢！", // 应该被检测为重复
    "今天天气真不错！",
    "今天的天气很好啊！", // 应该被检测为重复
    "我喜欢听音乐。",
    "你有什么兴趣爱好吗？"
  ];

  const results = batchDetectRepetition(testTexts);
  const stats = getRepetitionStats(results);

  console.log('批量检测结果:');
  results.forEach((result, index) => {
    console.log(`   ${index + 1}. "${testTexts[index]}"`);
    console.log(`      相似度: ${result.similarity}, 重复: ${result.isRepetitive ? '是' : '否'}`);
    if (result.matchedText) {
      console.log(`      匹配: "${result.matchedText}"`);
    }
  });

  console.log('\n统计信息:');
  console.log(`   总数: ${stats.totalCount}`);
  console.log(`   重复数: ${stats.repetitiveCount}`);
  console.log(`   重复率: ${(stats.repetitionRate * 100).toFixed(1)}%`);
  console.log(`   平均相似度: ${stats.averageSimilarity.toFixed(3)}`);
  console.log(`   最高相似度: ${stats.maxSimilarity.toFixed(3)}`);
}

/**
 * 运行文本预处理测试
 */
export function runPreprocessingTests(): void {
  console.log('🔧 开始文本预处理测试...\n');

  const testCases = [
    {
      input: "你好啊！！！😊😊😊很高兴认识你呢~~~",
      expected: "你好啊 很高兴认识你呢"
    },
    {
      input: "今天天气真不错呢，，，🌞🌞🌞！！！",
      expected: "今天天气真不错呢"
    },
    {
      input: "哈哈哈😂😂😂（笑死我了）",
      expected: "哈哈哈 笑死我了"
    }
  ];

  testCases.forEach((testCase, index) => {
    const result = preprocessText(testCase.input);
    console.log(`${index + 1}. 预处理测试:`);
    console.log(`   输入: "${testCase.input}"`);
    console.log(`   输出: "${result}"`);
    console.log(`   期望: "${testCase.expected}"`);
    console.log(`   ✅ ${result.includes(testCase.expected.replace(/\s+/g, '')) ? '通过' : '失败'}\n`);
  });
}

/**
 * 运行所有测试
 */
export function runAllTests(): void {
  console.log('🚀 开始运行相似度检测算法测试套件...\n');
  console.log('='.repeat(50));
  
  runPreprocessingTests();
  console.log('='.repeat(50));
  
  runBasicSimilarityTests();
  console.log('='.repeat(50));
  
  runRepetitionDetectionTests();
  console.log('='.repeat(50));
  
  runBatchDetectionTests();
  console.log('='.repeat(50));
  
  console.log('✅ 所有测试完成！');
}

/**
 * 测试改写系统
 */
export function testRewriteSystem(): void {
  console.log('🔄 开始测试改写系统...\n');

  // 动态导入改写模块
  import('./responseRewriter').then(({ rewriteResponse, getRewriteStats, DEFAULT_REWRITE_CONFIG }) => {
    const testCases = [
      "你好啊！😊",
      "很高兴认识你！😄",
      "好的！😊",
      "知道了！😃",
      "谢谢你！🥰",
      "今天天气真不错呢！"
    ];

    console.log('改写测试结果:');
    testCases.forEach((original, index) => {
      const rewritten = rewriteResponse(original, DEFAULT_REWRITE_CONFIG);
      const stats = getRewriteStats(original, rewritten);

      console.log(`${index + 1}. 原文: "${original}"`);
      console.log(`   改写: "${rewritten}"`);
      console.log(`   统计: 是否改写=${stats.isRewritten}, 变化词数=${stats.changedWords}, 相似度=${stats.similarity}`);
      console.log();
    });
  }).catch(error => {
    console.error('改写系统测试失败:', error);
  });
}

/**
 * 测试AI回复拆分系统
 */
export function testAIResponseSplitter(): void {
  console.log('📱 开始测试AI回复拆分系统...\n');

  // 动态导入拆分模块
  import('./aiResponseSplitter').then(({ AIResponseSplitter }) => {
    const splitter = new AIResponseSplitter({
      baseDelay: 300,
      randomDelay: 500,
      typingDuration: 1000
    });

    const testCases = [
      {
        name: '愤怒反应',
        response: `[小助手|什么？]
[小助手|你说什么？]
[小助手|你怎么可以这样说我？]
{小助手|我真的很生气！}
<小助手|😤>`
      },
      {
        name: '开心回复',
        response: `[小助手|哇！]
[小助手|太好了！]
[小助手|我好开心呀！]
<小助手|😊>`
      },
      {
        name: '困惑表达',
        response: `[小助手|嗯？]
[小助手|什么意思？]
[小助手|我有点不明白...]
<小助手|🤔>`
      },
      {
        name: '带心声的回复',
        response: `[小助手|没关系啦，我不介意的]
【心声|小助手|其实还是有点难过的...】`
      },
      {
        name: '带心声和随笔的回复',
        response: `[小助手|今天天气真不错呢！]
【心声|小助手|希望心情也能像天气一样好】
「随笔|小助手|下雨天总是让我想起小时候，那时候最喜欢趴在窗台上看雨滴顺着玻璃滑下来，一滴一滴的，就像眼泪一样。妈妈总是说雨天不要出门，但我偏偏喜欢雨天的味道，那种清新又带着一点忧郁的感觉。」`
      },
      {
        name: '普通回复',
        response: '这是一条普通的回复，没有特殊格式。'
      }
    ];

    testCases.forEach((testCase, index) => {
      console.log(`${index + 1}. 测试场景: ${testCase.name}`);
      console.log(`   原始回复: "${testCase.response}"`);

      const hasFormat = AIResponseSplitter.hasStructuredFormat(testCase.response);
      console.log(`   包含格式: ${hasFormat ? '是' : '否'}`);

      if (hasFormat) {
        const messages = splitter.parseAIResponse(testCase.response, '小助手');
        console.log(`   拆分结果: ${messages.length} 条消息`);

        messages.forEach((msg, msgIndex) => {
          console.log(`     ${msgIndex + 1}. [${msg.messageType}] "${msg.content}" (延迟: ${msg.displayDelay}ms)`);
          if (msg.shouldRetract) {
            console.log(`        -> 将在 ${msg.retractDelay}ms 后撤回`);
          }
        });
      }
      console.log();
    });
  }).catch(error => {
    console.error('AI回复拆分测试失败:', error);
  });
}

/**
 * 测试拆分格式处理
 */
export function testSplitFormatProcessing(): void {
  console.log('🔧 开始测试拆分格式处理...\n');

  // 动态导入AI回复处理器
  import('./aiResponseProcessor').then(({ AIResponseProcessor }) => {
    const processor = new AIResponseProcessor({
      useToneWords: false,
      useEmoji: false
    });

    const testCases = [
      {
        name: '完整拆分格式回复',
        response: `[光头强|发财？唉，哪有那么容易呀！💸]
[光头强|俺的钱都花在修机器上了，都是那些臭狗熊害的！]
【心声|光头强|哼，俺早晚要发大财，让李老板和臭狗熊都瞧瞧！】`
      },
      {
        name: '带撤回的拆分回复',
        response: `[小雨|什么？]
[小雨|你说什么？]
{小雨|我真的很生气！}
<小雨|😤>`
      },
      {
        name: '普通长回复（应该被截断）',
        response: '这是一条非常长的普通回复，没有使用拆分格式，所以应该会被长度控制器截断处理，确保不会超过设定的字符限制。'
      }
    ];

    testCases.forEach((testCase, index) => {
      console.log(`${index + 1}. 测试场景: ${testCase.name}`);
      console.log(`   原始回复: "${testCase.response}"`);

      const processed = processor.processResponse(testCase.response, {
        id: 'test-character',
        name: '测试角色',
        voiceStyle: 'friendly'
      } as any);

      console.log(`   处理结果: "${processed}"`);
      console.log(`   长度变化: ${testCase.response.length} -> ${processed.length}`);
      console.log(`   是否保持完整: ${processed === testCase.response || processed.includes('[') ? '✅' : '❌'}`);
      console.log();
    });
  }).catch(error => {
    console.error('拆分格式处理测试失败:', error);
  });
}

/**
 * 测试真人化提示词系统
 */
export function testHumanizationPrompts(): void {
  console.log('🤖➡️👤 开始测试真人化提示词系统...\n');

  // 动态导入全局提示词
  import('../config/globalPrompts').then(({ BUILTIN_GLOBAL_PROMPTS }) => {
    console.log('📋 当前激活的真人化提示词:');

    const humanizationPrompts = BUILTIN_GLOBAL_PROMPTS.filter(prompt =>
      prompt.isActive && (
        prompt.id === 'inner_voice_system' ||
        prompt.id === 'anti_robot_constraints' ||
        prompt.id === 'random_thoughts_system' ||
        prompt.id === 'multi_message_format'
      )
    ).sort((a, b) => b.priority - a.priority);

    humanizationPrompts.forEach((prompt, index) => {
      console.log(`${index + 1}. ${prompt.name} (优先级: ${prompt.priority})`);
      console.log(`   类型: ${prompt.type}`);
      console.log(`   状态: ${prompt.isActive ? '✅ 激活' : '❌ 未激活'}`);
      console.log(`   内容预览: ${prompt.content.substring(0, 100)}...`);
      console.log();
    });

    console.log('🎯 真人化机制说明:');
    console.log('1. 心声系统 (优先级99) - 强制要求每次回复后添加【心声|角色名|内心想法】');
    console.log('2. 防重复回复 (优先级98) - 避免重复内容，保持回复多样性');
    console.log('3. 多条消息格式 (优先级97) - 支持拆分回复，模拟真人连续发消息');
    console.log('4. 反机器人约束 (优先级96) - 禁止机器人式表达和描述性语言');
    console.log('5. 随笔系统 (优先级80) - 30%概率触发深层思考和回忆');
    console.log();

    console.log('💡 使用建议:');
    console.log('- 心声系统是核心，让AI表达内心真实想法');
    console.log('- 配合拆分回复，可以创造非常自然的对话体验');
    console.log('- 随笔系统增加角色深度，但不要过度使用');
    console.log('- 反机器人约束确保AI不会说出机械化的话语');

  }).catch(error => {
    console.error('真人化提示词测试失败:', error);
  });
}

// 将测试函数暴露到全局，方便在浏览器控制台中调用
if (typeof window !== 'undefined') {
  (window as any).runSimilarityTests = runAllTests;
  (window as any).testSimilarity = {
    runBasicTests: runBasicSimilarityTests,
    runRepetitionTests: runRepetitionDetectionTests,
    runBatchTests: runBatchDetectionTests,
    runPreprocessingTests: runPreprocessingTests,
    runAllTests: runAllTests,
    testRewrite: testRewriteSystem,
    testSplitter: testAIResponseSplitter,
    testHumanization: testHumanizationPrompts,
    testSplitProcessing: testSplitFormatProcessing
  };
}

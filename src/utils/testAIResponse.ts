// 测试AI回复拆分功能的示例数据

export const TEST_AI_RESPONSES = {
  // 基础多消息测试
  basic: `
[小助手|你好！我是你的AI助手]
[小助手|很高兴为你服务！]
[小助手|有什么可以帮助你的吗？]
  `,

  // 包含表情的测试
  withEmoji: `
[小助手|你好呀！]
<小助手|smile>
[小助手|今天心情怎么样？]
<小助手|heart>
  `,

  // 包含语音消息的测试
  withVoice: `
[小助手|你好！]
[小助手|语音|3s|这是一条语音消息哦]
[小助手|语音消息更有温度呢]
  `,

  // 包含撤回消息的测试
  withRetract: `
[小助手|你好！]
{小助手|其实我有点紧张...}
[小助手|很高兴认识你！]
  `,

  // 包含心声的测试
  withInnerVoice: `
[小助手|你好！我是小助手]
【心声|小助手|希望能帮到用户】
[小助手|有什么可以帮你的吗？]
  `,

  // 包含随笔的测试
  withEssay: `
[小助手|今天天气真不错呢]
「随笔|小助手|阳光透过窗户洒进来，让人心情愉悦」
[小助手|你那边天气怎么样？]
  `,

  // 包含引用的测试
  withQuote: `
[小助手|我看到你刚才说的话了]
[小助手|引用|用户|你好|是的，你好！很高兴见到你]
[小助手|我们继续聊天吧]
  `,

  // 复杂混合测试
  complex: `
[小助手|你好！我是你的AI助手]
<小助手|wave>
[小助手|语音|2s|很高兴为你服务]
{小助手|刚才说错了什么}
【心声|小助手|希望给用户留下好印象】
[小助手|有什么可以帮助你的吗？]
「随笔|小助手|每次与新用户对话都让我很兴奋」
<小助手|smile>
  `,

  // 多角色对话测试
  multiCharacter: `
[小助手|大家好！]
[小猫咪|喵～你好呀]
[小助手|今天我们一起聊天吧]
[小猫咪|好的呢～]
{小猫咪|其实我有点害羞}
[小猫咪|我很开心能认识大家]
  `,

  // 系统消息测试
  withSystem: `
[小助手|你好！]
<系统>用户已加入聊天</系统>
[小助手|欢迎新朋友！]
<旁白>气氛变得热烈起来</旁白>
[小助手|让我们开始愉快的对话吧]
  `
};

// 测试函数
export const testAIResponseSplitter = () => {
  console.log('=== AI回复拆分测试 ===');
  
  Object.entries(TEST_AI_RESPONSES).forEach(([name, response]) => {
    console.log(`\n--- 测试: ${name} ---`);
    console.log('原始回复:', response.trim());
    
    // 这里可以调用你的拆分器进行测试
    // const splitter = new AIResponseSplitter();
    // const messages = splitter.parseAIResponse(response.trim(), 'test-character');
    // console.log('拆分结果:', messages);
  });
};

// 在开发环境中可以调用这个函数进行测试
if (process.env.NODE_ENV === 'development') {
  // testAIResponseSplitter();
}

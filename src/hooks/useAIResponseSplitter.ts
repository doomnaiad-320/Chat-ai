import { useCallback, useRef, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAppStore } from '../stores/appStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useCharacterStore } from '../stores/characterStore';
import { AIResponseSplitter } from '../utils/aiResponseSplitter';
import { MessageDisplayController } from '../utils/messageDisplayController';
import { processAIResponse } from '../utils/aiResponseProcessor';
import type { Message } from '../types';

export const useAIResponseSplitter = () => {
  const [isDisplayingSequence, setIsDisplayingSequence] = useState(false);
  const [typingCharacter, setTypingCharacter] = useState<string | null>(null);
  
  const splitterRef = useRef(new AIResponseSplitter({
    baseDelay: 300,
    randomDelay: 500,
    typingDuration: 1000
  }));

  const controllerRef = useRef<MessageDisplayController | null>(null);
  const retractedMessagesRef = useRef(new Set<string>());

  const { addAIMessage, updateMessageStatus, currentConversation } = useChatStore();
  const { showNotification } = useAppStore();
  const { aiStyleConfig } = useSettingsStore();
  const { characters } = useCharacterStore();

  // 初始化显示控制器
  const initController = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.destroy();
    }

    controllerRef.current = new MessageDisplayController({
      onMessageAdd: async (message: Message) => {
        // 添加消息到store
        console.log('🎬 MessageDisplayController 添加消息:', {
          type: message.messageType,
          content: message.content.substring(0, 50) + '...',
          sender: message.originalSender
        });
        addAIMessage(message.content, message.characterId!);

        // 返回添加的消息（用于后续撤回）
        return Promise.resolve();
      },
      
      onMessageRetract: async (messageId: string) => {
        // 标记消息为已撤回
        retractedMessagesRef.current.add(messageId);
        
        // 更新消息状态或内容来显示撤回效果
        // 这里我们通过修改消息内容来实现撤回效果
        const conversation = currentConversation;
        if (conversation) {
          const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId);
          if (messageIndex !== -1) {
            // 创建一个新的撤回消息
            const retractMessage: Message = {
              ...conversation.messages[messageIndex],
              content: '对方撤回了一条消息',
              messageType: 'system'
            };
            
            // 这里需要你实现一个更新特定消息的方法
            // 或者通过其他方式来显示撤回效果
            console.log('消息已撤回:', messageId);
          }
        }
        
        return Promise.resolve();
      },
      
      onTypingStart: (characterName: string) => {
        setTypingCharacter(characterName);
      },
      
      onTypingEnd: () => {
        setTypingCharacter(null);
      },
      
      typingDuration: 1000
    });
  }, [addAIMessage, currentConversation]);

  // 处理AI回复（支持拆分）
  const handleAIResponse = useCallback(async (
    aiResponseText: string,
    characterId: string
  ): Promise<void> => {
    try {
      console.log('🎯 开始处理AI回复:', aiResponseText.substring(0, 100) + '...');

      // 获取角色信息用于后处理
      const character = characters.find(c => c.id === characterId);

      // 先检查原始回复是否包含结构化格式
      const hasStructuredFormat = AIResponseSplitter.hasStructuredFormat(aiResponseText);
      console.log('🔍 原始回复是否包含结构化格式:', hasStructuredFormat);

      if (!hasStructuredFormat) {
        console.log('📝 没有结构化格式，进行常规处理');
        // 如果没有特殊格式，进行常规处理并添加普通消息
        let processedResponse = aiResponseText;
        if (character && (aiStyleConfig.useEmoji || aiStyleConfig.useToneWords || aiStyleConfig.conversationalStyle)) {
          processedResponse = processAIResponse(aiResponseText, character, aiStyleConfig);
        }
        console.log('➕ 添加普通消息:', processedResponse.substring(0, 50) + '...');
        addAIMessage(processedResponse, characterId);
        return;
      }

      console.log('🔄 检测到拆分格式回复，开始处理...');

      // 对于拆分格式回复，进行处理但不添加为普通消息
      let processedResponse = aiResponseText;
      if (character && (aiStyleConfig.useEmoji || aiStyleConfig.useToneWords || aiStyleConfig.conversationalStyle)) {
        console.log('🎨 应用AI风格配置...');
        processedResponse = processAIResponse(aiResponseText, character, aiStyleConfig);
        console.log('🎨 风格配置后的回复:', processedResponse.substring(0, 100) + '...');
      }

      console.log('🔄 开始解析拆分格式...');

      // 解析AI回复
      const messages = splitterRef.current.parseAIResponse(processedResponse, characterId);

      if (messages.length === 0) {
        console.warn('⚠️ 拆分格式解析失败，回退到普通消息');
        console.log('➕ 添加回退消息:', processedResponse.substring(0, 50) + '...');
        // 如果解析失败，添加处理后的消息
        addAIMessage(processedResponse, characterId);
        return;
      }

      console.log(`✅ 成功解析为 ${messages.length} 条消息，不添加原始消息`);
      console.log('📋 解析的消息列表:', messages.map(m => ({ type: m.messageType, content: m.content.substring(0, 30) + '...' })));

      // 初始化控制器
      initController();

      // 设置显示状态
      setIsDisplayingSequence(true);

      // 显示消息序列（不添加原始消息）
      if (controllerRef.current) {
        console.log('🎬 开始显示消息序列...');
        await controllerRef.current.displayMessages(messages);
        console.log('🎬 消息序列显示完成');
      }

    } catch (error) {
      console.error('处理AI回复时出错:', error);
      showNotification('处理AI回复时出错', 'error');

      // 出错时显示处理后的消息
      const character = characters.find(c => c.id === characterId);
      const fallbackResponse = character && (aiStyleConfig.useEmoji || aiStyleConfig.useToneWords || aiStyleConfig.conversationalStyle)
        ? processAIResponse(aiResponseText, character, aiStyleConfig)
        : aiResponseText;
      addAIMessage(fallbackResponse, characterId);
    } finally {
      setIsDisplayingSequence(false);
      setTypingCharacter(null);
    }
  }, [addAIMessage, showNotification, initController, characters, aiStyleConfig]);

  // 取消当前的消息序列显示
  const cancelSequence = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.cancel();
    }
    setIsDisplayingSequence(false);
    setTypingCharacter(null);
  }, []);

  // 检查消息是否已被撤回
  const isMessageRetracted = useCallback((messageId: string): boolean => {
    return retractedMessagesRef.current.has(messageId);
  }, []);

  // 清理资源
  const cleanup = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.destroy();
      controllerRef.current = null;
    }
    retractedMessagesRef.current.clear();
    setIsDisplayingSequence(false);
    setTypingCharacter(null);
  }, []);

  return {
    handleAIResponse,
    cancelSequence,
    cleanup,
    isDisplayingSequence,
    typingCharacter,
    isMessageRetracted
  };
};

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
      // 获取角色信息用于后处理
      const character = characters.find(c => c.id === characterId);

      // 如果启用了AI风格配置，先处理回复文本
      let processedResponse = aiResponseText;
      if (character && (aiStyleConfig.useEmoji || aiStyleConfig.useToneWords || aiStyleConfig.conversationalStyle)) {
        processedResponse = processAIResponse(aiResponseText, character, aiStyleConfig);
      }

      // 检查是否包含结构化格式
      if (!AIResponseSplitter.hasStructuredFormat(processedResponse)) {
        // 如果没有特殊格式，直接添加普通消息
        addAIMessage(processedResponse, characterId);
        return;
      }

      // 解析AI回复
      const messages = splitterRef.current.parseAIResponse(processedResponse, characterId);
      
      if (messages.length === 0) {
        // 如果解析失败，添加原始消息
        addAIMessage(aiResponseText, characterId);
        return;
      }

      console.log('解析到的消息序列:', messages);

      // 初始化控制器
      initController();

      // 设置显示状态
      setIsDisplayingSequence(true);

      // 显示消息序列
      if (controllerRef.current) {
        await controllerRef.current.displayMessages(messages);
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

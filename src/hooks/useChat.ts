import { useState, useCallback, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useCharacterStore } from '../stores/characterStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAppStore } from '../stores/appStore';
import { sendChatRequest, buildSystemPrompt, formatErrorMessage } from '../utils/api';
import { sendChatRequestCompatible } from '../utils/vercelApi';
import { useAIResponseSplitter } from './useAIResponseSplitter';
import type { Character, Message, Conversation } from '../types/index';
import { StorageManager } from '../utils/storage';

// 生成消息ID的工具函数
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useChat = () => {
  const [isSending, setIsSending] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    addAIMessage,
    updateMessageStatus,
    currentConversation,
    messages,
    createConversation,
    setCurrentConversation,
    conversations
  } = useChatStore();

  const { currentCharacter } = useCharacterStore();
  const { currentAPIConfig, getActivePrompts } = useSettingsStore();
  const { showNotification } = useAppStore();

  // 集成AI回复拆分功能
  const {
    handleAIResponse,
    isDisplayingSequence,
    typingCharacter,
    cancelSequence
  } = useAIResponseSplitter();

  // 手动添加用户消息（避免chatStore.sendMessage自动添加AI回复）
  const addUserMessage = useCallback(async (content: string, characterId: string) => {
    console.log('➕ 手动添加用户消息:', content);

    const messageId = generateId();
    const userMessage: Message = {
      id: messageId,
      content,
      sender: 'user',
      characterId,
      timestamp: new Date(),
      status: 'sent'
    };

    let targetConversation = currentConversation;

    // 如果没有当前对话或角色不匹配，创建新对话
    if (!targetConversation || targetConversation.characterId !== characterId) {
      const conversationId = await createConversation(characterId);
      await setCurrentConversation(conversationId);
      targetConversation = currentConversation; // 重新获取
    }

    if (!targetConversation) {
      throw new Error('无法创建对话');
    }

    // 添加用户消息到对话
    const updatedMessages = [...targetConversation.messages, userMessage];
    const updatedConversation: Conversation = {
      ...targetConversation,
      messages: updatedMessages,
      lastMessageAt: new Date()
    };

    // 更新对话列表
    const updatedConversations = conversations.map(conv =>
      conv.id === targetConversation!.id ? updatedConversation : conv
    );

    // 保存到存储
    await StorageManager.save('conversations', updatedConversations);

    // 更新store状态
    useChatStore.setState({
      conversations: updatedConversations,
      currentConversation: updatedConversation,
      messages: updatedMessages
    });

    console.log('✅ 用户消息添加完成');
  }, [currentConversation, createConversation, setCurrentConversation, conversations]);

  // 发送消息
  const handleSendMessage = useCallback(async (content: string, character?: Character) => {
    const targetCharacter = character || currentCharacter;
    
    if (!targetCharacter) {
      showNotification('请先选择一个角色', 'error');
      return;
    }

    if (!currentAPIConfig) {
      showNotification('请先配置API', 'error');
      return;
    }

    if (!content.trim()) {
      showNotification('消息内容不能为空', 'error');
      return;
    }

    try {
      setIsSending(true);

      // 手动添加用户消息（不使用chatStore.sendMessage避免自动添加AI回复）
      await addUserMessage(content.trim(), targetCharacter.id);

      // 准备AI请求
      const activePrompts = getActivePrompts();
      const systemPrompt = buildSystemPrompt(targetCharacter, activePrompts);
      const conversationMessages = currentConversation?.messages || [];

      // 构建消息历史（最近10条消息）
      const recentMessages = conversationMessages
        .slice(-10)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

      // 添加系统提示词和当前用户消息
      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...recentMessages,
        { role: 'user' as const, content: content.trim() }
      ];

      // 创建取消控制器
      abortControllerRef.current = new AbortController();

      // 发送API请求
      const aiResponse = await sendChatRequest(
        apiMessages,
        currentAPIConfig,
        abortControllerRef.current.signal
      );

      console.log('🎯 收到AI原始回复:', aiResponse.substring(0, 100) + '...');

      // 使用拆分器处理AI回复
      await handleAIResponse(aiResponse, targetCharacter.id);
      
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      showNotification(errorMessage, 'error');
      console.error('发送消息失败:', error);
    } finally {
      setIsSending(false);
      abortControllerRef.current = null;
    }
  }, [
    currentCharacter,
    currentAPIConfig,
    getActivePrompts,
    currentConversation,
    addUserMessage,
    handleAIResponse,
    showNotification
  ]);

  // 取消发送
  const cancelSending = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsSending(false);
      showNotification('已取消发送', 'info');
    }

    // 同时取消消息序列显示
    cancelSequence();
  }, [showNotification, cancelSequence]);

  // 重新发送消息
  const resendMessage = useCallback(async (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message || message.sender !== 'user') {
      return;
    }

    await handleSendMessage(message.content);
  }, [messages, handleSendMessage]);

  // 测试Vercel AI SDK
  const testVercelAI = useCallback(async (message: string) => {
    if (!currentAPIConfig) {
      showNotification('请先配置API', 'error');
      return;
    }

    try {
      console.log('🧪 测试Vercel AI SDK...');
      const testMessages = [
        { role: 'user' as const, content: message }
      ];

      const response = await sendChatRequestCompatible(
        testMessages,
        currentAPIConfig
      );

      console.log('✅ Vercel AI SDK测试成功:', response);
      showNotification('Vercel AI SDK测试成功!', 'success');
      return response;
    } catch (error) {
      console.error('❌ Vercel AI SDK测试失败:', error);
      showNotification(`Vercel AI SDK测试失败: ${formatErrorMessage(error)}`, 'error');
      throw error;
    }
  }, [currentAPIConfig, showNotification]);

  return {
    isSending: isSending || isDisplayingSequence,
    messages,
    currentConversation,
    handleSendMessage,
    cancelSending,
    resendMessage,
    testVercelAI, // 新增测试方法
    // 新增的拆分相关状态
    isDisplayingSequence,
    typingCharacter,
  };
};

import { useState, useCallback, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useCharacterStore } from '../stores/characterStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAppStore } from '../stores/appStore';
import { sendChatRequest, buildSystemPrompt, formatErrorMessage } from '../utils/api';
import { useAIResponseSplitter } from './useAIResponseSplitter';
import type { Character } from '../types/index';

export const useChat = () => {
  const [isSending, setIsSending] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    sendMessage,
    addAIMessage,
    updateMessageStatus,
    currentConversation,
    messages
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
      
      // 发送用户消息
      await sendMessage(content.trim(), targetCharacter.id);
      
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
    sendMessage,
    addAIMessage,
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

  return {
    isSending: isSending || isDisplayingSequence,
    messages,
    currentConversation,
    handleSendMessage,
    cancelSending,
    resendMessage,
    // 新增的拆分相关状态
    isDisplayingSequence,
    typingCharacter,
  };
};

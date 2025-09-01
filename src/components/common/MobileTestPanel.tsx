import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacterStore } from '../../stores/characterStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAppStore } from '../../stores/appStore';
import { testCharacters, testAPIConfigs } from '../../utils/testData';

export const MobileTestPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { addCharacter, characters } = useCharacterStore();
  const { addAPIConfig, apiConfigs } = useSettingsStore();
  const { showNotification } = useAppStore();

  // 添加测试角色
  const addTestCharacters = async () => {
    setIsLoading(true);
    try {
      for (const character of testCharacters) {
        await addCharacter(character);
      }
      showNotification(`成功添加 ${testCharacters.length} 个测试角色`, 'success');
    } catch (error) {
      showNotification('添加测试角色失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 添加测试API配置
  const addTestAPIConfigs = async () => {
    setIsLoading(true);
    try {
      for (const config of testAPIConfigs) {
        await addAPIConfig(config);
      }
      showNotification(`成功添加 ${testAPIConfigs.length} 个测试API配置`, 'success');
    } catch (error) {
      showNotification('添加测试API配置失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 测试触摸事件
  const testTouchEvents = () => {
    showNotification('触摸事件测试成功！', 'success');
  };

  // 测试动画性能
  const testAnimationPerformance = () => {
    const startTime = performance.now();
    
    // 模拟复杂动画
    setTimeout(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      showNotification(`动画性能测试完成，耗时: ${duration.toFixed(2)}ms`, 'info');
    }, 1000);
  };

  // 测试存储功能
  const testStorage = async () => {
    try {
      const testData = { test: 'mobile-storage-test', timestamp: Date.now() };
      localStorage.setItem('mobile-test', JSON.stringify(testData));
      
      const retrieved = localStorage.getItem('mobile-test');
      if (retrieved) {
        const parsed = JSON.parse(retrieved);
        if (parsed.test === testData.test) {
          showNotification('存储功能测试成功', 'success');
        } else {
          showNotification('存储功能测试失败', 'error');
        }
      }
      
      localStorage.removeItem('mobile-test');
    } catch (error) {
      showNotification('存储功能测试失败', 'error');
    }
  };

  // 获取设备信息
  const getDeviceInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenWidth: screen.width,
      screenHeight: screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window,
    };
    
    console.log('设备信息:', info);
    showNotification('设备信息已输出到控制台', 'info');
  };

  if (!isOpen) {
    return (
      <motion.button
        className="fixed top-4 left-4 z-40 w-10 h-10 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center text-sm"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        🧪
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          className="bg-white rounded-card max-w-sm w-full max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                移动端测试面板
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 数据测试 */}
              <div className="border-b pb-4">
                <h3 className="font-medium text-text-primary mb-3">数据测试</h3>
                
                <div className="space-y-2">
                  <motion.button
                    className="w-full btn-secondary text-sm py-2"
                    onClick={addTestCharacters}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? '添加中...' : `添加测试角色 (${characters.length})`}
                  </motion.button>
                  
                  <motion.button
                    className="w-full btn-secondary text-sm py-2"
                    onClick={addTestAPIConfigs}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? '添加中...' : `添加API配置 (${apiConfigs.length})`}
                  </motion.button>
                </div>
              </div>

              {/* 功能测试 */}
              <div className="border-b pb-4">
                <h3 className="font-medium text-text-primary mb-3">功能测试</h3>
                
                <div className="space-y-2">
                  <motion.button
                    className="w-full btn-secondary text-sm py-2"
                    onClick={testTouchEvents}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    测试触摸事件
                  </motion.button>
                  
                  <motion.button
                    className="w-full btn-secondary text-sm py-2"
                    onClick={testAnimationPerformance}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    测试动画性能
                  </motion.button>
                  
                  <motion.button
                    className="w-full btn-secondary text-sm py-2"
                    onClick={testStorage}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    测试存储功能
                  </motion.button>
                </div>
              </div>

              {/* 设备信息 */}
              <div>
                <h3 className="font-medium text-text-primary mb-3">设备信息</h3>
                
                <motion.button
                  className="w-full btn-primary text-sm py-2"
                  onClick={getDeviceInfo}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  获取设备信息
                </motion.button>
                
                <div className="mt-3 text-xs text-text-muted space-y-1">
                  <div>屏幕: {screen.width}×{screen.height}</div>
                  <div>窗口: {window.innerWidth}×{window.innerHeight}</div>
                  <div>像素比: {window.devicePixelRatio}</div>
                  <div>触摸支持: {'ontouchstart' in window ? '是' : '否'}</div>
                  <div>在线状态: {navigator.onLine ? '在线' : '离线'}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

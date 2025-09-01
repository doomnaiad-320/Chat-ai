import { get, set, del, clear } from 'idb-keyval';

// 存储键名常量
export const STORAGE_KEYS = {
  CHARACTERS: 'characters',
  CONVERSATIONS: 'conversations',
  API_CONFIGS: 'apiConfigs',
  APP_SETTINGS: 'appSettings',
  GLOBAL_PROMPTS: 'globalPrompts',
} as const;

// 通用存储操作
export class StorageManager {
  // 保存数据
  static async save<T>(key: string, data: T): Promise<void> {
    try {
      await set(key, data);
    } catch (error) {
      console.error(`保存数据失败 [${key}]:`, error);
      throw new Error(`保存数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 读取数据
  static async load<T>(key: string, defaultValue?: T): Promise<T | undefined> {
    try {
      const data = await get(key);
      return data !== undefined ? data : defaultValue;
    } catch (error) {
      console.error(`读取数据失败 [${key}]:`, error);
      return defaultValue;
    }
  }

  // 删除数据
  static async remove(key: string): Promise<void> {
    try {
      await del(key);
    } catch (error) {
      console.error(`删除数据失败 [${key}]:`, error);
      throw new Error(`删除数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 清空所有数据
  static async clearAll(): Promise<void> {
    try {
      await clear();
    } catch (error) {
      console.error('清空所有数据失败:', error);
      throw new Error(`清空数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 检查存储空间使用情况
  static async getStorageInfo(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
        };
      } catch (error) {
        console.warn('获取存储信息失败:', error);
      }
    }
    return { used: 0, quota: 0 };
  }

  // 导出所有数据
  static async exportData(): Promise<Record<string, any>> {
    try {
      const data: Record<string, any> = {};
      
      for (const key of Object.values(STORAGE_KEYS)) {
        data[key] = await get(key);
      }
      
      return data;
    } catch (error) {
      console.error('导出数据失败:', error);
      throw new Error(`导出数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 导入数据
  static async importData(data: Record<string, any>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(data)) {
        if (Object.values(STORAGE_KEYS).includes(key as any)) {
          await set(key, value);
        }
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      throw new Error(`导入数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}

// 图片存储相关
export class ImageStorage {
  private static readonly MAX_SIZE = 1024 * 1024; // 1MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  // 压缩图片
  static async compressImage(file: File, maxSize: number = this.MAX_SIZE): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        reject(new Error('不支持的图片格式'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 计算压缩后的尺寸（保持1:1比例）
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        // 绘制图片（居中裁剪）
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        
        if (ctx) {
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
          
          // 转换为base64
          let quality = 0.9;
          let dataURL = canvas.toDataURL('image/jpeg', quality);
          
          // 如果文件太大，降低质量
          while (dataURL.length > maxSize && quality > 0.1) {
            quality -= 0.1;
            dataURL = canvas.toDataURL('image/jpeg', quality);
          }
          
          resolve(dataURL);
        } else {
          reject(new Error('无法创建canvas上下文'));
        }
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // 从相机或相册选择图片
  static async selectImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // 优先使用后置摄像头

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const compressedImage = await this.compressImage(file);
            resolve(compressedImage);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('未选择图片'));
        }
      };

      input.click();
    });
  }

  // 验证base64图片
  static isValidImageBase64(base64: string): boolean {
    const regex = /^data:image\/(jpeg|jpg|png|webp);base64,/;
    return regex.test(base64);
  }

  // 获取图片尺寸
  static getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error('无法加载图片'));
      };
      img.src = base64;
    });
  }
}

// 数据验证工具
export class DataValidator {
  // 验证字符串长度
  static validateStringLength(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  }

  // 验证数组长度
  static validateArrayLength<T>(array: T[], min: number, max: number): boolean {
    return array.length >= min && array.length <= max;
  }

  // 验证邮箱格式
  static validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // 验证URL格式
  static validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // 清理HTML标签
  static sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // 验证JSON格式
  static isValidJSON(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}

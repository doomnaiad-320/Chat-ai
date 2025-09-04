/**
 * 图片存储工具类
 * 处理图片选择、压缩和存储
 */

export class ImageStorage {
  /**
   * 选择图片文件
   * @returns Promise<string> 返回图片的base64数据URL
   */
  static async selectImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      // 创建文件输入元素
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';

      // 处理文件选择
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('未选择文件'));
          return;
        }

        try {
          // 验证文件类型
          if (!file.type.startsWith('image/')) {
            reject(new Error('请选择图片文件'));
            return;
          }

          // 验证文件大小 (限制为5MB)
          const maxSize = 5 * 1024 * 1024;
          if (file.size > maxSize) {
            reject(new Error('图片文件不能超过5MB'));
            return;
          }

          // 压缩并转换为base64
          const compressedImage = await this.compressImage(file);
          resolve(compressedImage);
        } catch (error) {
          reject(error);
        } finally {
          // 清理DOM元素
          document.body.removeChild(input);
        }
      };

      // 处理取消选择
      input.oncancel = () => {
        document.body.removeChild(input);
        reject(new Error('用户取消选择'));
      };

      // 添加到DOM并触发点击
      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * 压缩图片
   * @param file 原始图片文件
   * @param maxWidth 最大宽度，默认400px
   * @param maxHeight 最大高度，默认400px
   * @param quality 压缩质量，默认0.8
   * @returns Promise<string> 压缩后的base64数据URL
   */
  static async compressImage(
    file: File,
    maxWidth: number = 400,
    maxHeight: number = 400,
    quality: number = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('无法创建canvas上下文'));
        return;
      }

      img.onload = () => {
        // 计算压缩后的尺寸
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // 设置canvas尺寸
        canvas.width = width;
        canvas.height = height;

        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为base64
        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(new Error('图片压缩失败'));
        }
      };

      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };

      // 创建图片URL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * 验证图片URL是否有效
   * @param url 图片URL
   * @returns Promise<boolean>
   */
  static async validateImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  /**
   * 从base64数据URL获取文件大小（字节）
   * @param dataUrl base64数据URL
   * @returns number 文件大小（字节）
   */
  static getDataUrlSize(dataUrl: string): number {
    const base64 = dataUrl.split(',')[1];
    if (!base64) return 0;
    
    // base64编码后的大小约为原始大小的4/3
    return Math.round((base64.length * 3) / 4);
  }

  /**
   * 格式化文件大小显示
   * @param bytes 字节数
   * @returns string 格式化后的大小字符串
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 创建图片预览元素
   * @param dataUrl 图片数据URL
   * @param className CSS类名
   * @returns HTMLImageElement
   */
  static createPreviewElement(dataUrl: string, className?: string): HTMLImageElement {
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    if (className) {
      img.className = className;
    }
    return img;
  }
}

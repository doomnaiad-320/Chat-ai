import { useEffect, useRef, useState } from 'react';
import type { AnimationType } from '../types';

// 动画配置
const ANIMATION_CONFIGS = {
  'bounce-gentle': {
    duration: 0.6,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  'float': {
    duration: 3,
    easing: 'ease-in-out',
  },
  'pulse-soft': {
    duration: 2,
    easing: 'ease-in-out',
  },
  'wiggle': {
    duration: 0.5,
    easing: 'ease-in-out',
  },
  'heart-beat': {
    duration: 1,
    easing: 'ease-in-out',
  },
  'slide-up': {
    duration: 0.3,
    easing: 'ease-out',
  },
  'slide-down': {
    duration: 0.3,
    easing: 'ease-out',
  },
  'fade-in': {
    duration: 0.3,
    easing: 'ease-out',
  },
  'scale-in': {
    duration: 0.2,
    easing: 'ease-out',
  },
};

// 使用CSS动画的hook
export const useAnimation = (
  animationType: AnimationType,
  trigger: boolean = true,
  delay: number = 0
) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const timeoutId = setTimeout(() => {
      setShouldAnimate(true);
      setIsAnimating(true);

      const config = ANIMATION_CONFIGS[animationType];
      const animationDuration = config.duration * 1000;

      // 动画结束后重置状态
      const endTimeoutId = setTimeout(() => {
        setIsAnimating(false);
      }, animationDuration);

      return () => clearTimeout(endTimeoutId);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [trigger, animationType, delay]);

  const animationClass = shouldAnimate ? `animate-${animationType}` : '';

  return {
    ref: elementRef,
    isAnimating,
    animationClass,
    style: {
      animationDelay: `${delay}ms`,
    },
  };
};

// 交错动画hook（用于列表项）
export const useStaggeredAnimation = (
  items: any[],
  animationType: AnimationType = 'fade-in',
  staggerDelay: number = 100
) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    // 重置可见项
    setVisibleItems(new Set());

    // 设置延迟显示
    const timeouts: NodeJS.Timeout[] = [];
    items.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, index * staggerDelay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      setVisibleItems(new Set());
    };
  }, [items.length, staggerDelay]); // 只依赖数组长度，而不是整个数组

  const getItemAnimation = (index: number) => {
    const isVisible = visibleItems.has(index);
    return {
      animationClass: isVisible ? `animate-${animationType}` : 'opacity-0',
      style: {
        animationDelay: `${index * staggerDelay}ms`,
      },
    };
  };

  return { getItemAnimation };
};

// 滚动触发动画hook
export const useScrollAnimation = (
  animationType: AnimationType = 'fade-in',
  threshold: number = 0.1
) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // 动画触发后停止观察
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return {
    ref: elementRef,
    isVisible,
    animationClass: isVisible ? `animate-${animationType}` : 'opacity-0',
  };
};

// 悬停动画hook
export const useHoverAnimation = (
  hoverAnimation: AnimationType = 'scale-in',
  clickAnimation?: AnimationType
) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  const handleMouseDown = () => {
    if (clickAnimation) {
      setIsClicked(true);
    }
  };
  
  const handleMouseUp = () => {
    if (clickAnimation) {
      setTimeout(() => setIsClicked(false), 150);
    }
  };

  const getAnimationClass = () => {
    if (isClicked && clickAnimation) {
      return `animate-${clickAnimation}`;
    }
    if (isHovered) {
      return `animate-${hoverAnimation}`;
    }
    return '';
  };

  return {
    isHovered,
    isClicked,
    animationClass: getAnimationClass(),
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
    },
  };
};

// 气泡动画hook（专门用于聊天气泡）
export const useBubbleAnimation = (delay: number = 0) => {
  const [phase, setPhase] = useState<'hidden' | 'entering' | 'visible'>('hidden');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPhase('entering');
      
      // 动画完成后设置为visible
      setTimeout(() => {
        setPhase('visible');
      }, 300);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [delay]);

  const getAnimationClass = () => {
    switch (phase) {
      case 'hidden':
        return 'opacity-0 scale-75 translate-y-4';
      case 'entering':
        return 'animate-scale-in';
      case 'visible':
        return 'opacity-100 scale-100 translate-y-0';
      default:
        return '';
    }
  };

  return {
    phase,
    animationClass: getAnimationClass(),
    isVisible: phase !== 'hidden',
  };
};

// 打字机效果hook
export const useTypewriter = (
  text: string,
  speed: number = 50,
  startDelay: number = 0
) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsTyping(false);
    setIsComplete(false);

    const startTimeout = setTimeout(() => {
      setIsTyping(true);
      let index = 0;

      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          setIsComplete(true);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, startDelay]);

  return {
    displayText,
    isTyping,
    isComplete,
  };
};

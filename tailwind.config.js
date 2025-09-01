/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 暖色调可爱风配色方案
        primary: {
          50: '#FFF5EB',   // 浅米白背景色
          100: '#FFE4CC',
          200: '#FFCC99',
          300: '#FFB366',
          400: '#FF9E80',  // 主色调：珊瑚橘
          500: '#FF8A65',
          600: '#FF7043',
          700: '#FF5722',
          800: '#E64A19',
          900: '#BF360C',
        },
        secondary: {
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#FFE082',
          300: '#FFD54F',
          400: '#FFD6A5',  // 奶黄
          500: '#FFCC02',
          600: '#FFB300',
          700: '#FF8F00',
          800: '#FF6F00',
          900: '#E65100',
        },
        accent: {
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#A5D8FF',  // 天蓝
          500: '#2196F3',
          600: '#1E88E5',
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
        },
        danger: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          200: '#EF9A9A',
          300: '#E57373',
          400: '#FF6B6B',  // 珊瑚红强调色
          500: '#F44336',
          600: '#E53935',
          700: '#D32F2F',
          800: '#C62828',
          900: '#B71C1C',
        },
        warm: {
          50: '#FFF5EB',   // 浅米白
          100: '#FFECD1',
          200: '#FFE2B7',
          300: '#FFD89D',
          400: '#FFCE83',
          500: '#FFC469',
          600: '#FFBA4F',
          700: '#FFB035',
          800: '#FFA61B',
          900: '#FF9C01',
        },
        text: {
          primary: '#5A4B41',    // 暖棕文字色
          secondary: '#8B7355',
          muted: '#A69080',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        cute: ['Comic Sans MS', 'cursive'],
      },
      borderRadius: {
        'bubble': '18px',
        'card': '16px',
      },
      boxShadow: {
        'bubble': '0 2px 8px rgba(255, 158, 128, 0.15)',
        'card': '0 4px 16px rgba(255, 158, 128, 0.1)',
        'glow': '0 0 20px rgba(255, 158, 128, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      animation: {
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'heart-beat': 'heart-beat 1s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        'heart-beat': {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './styles/**/*.{css}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'Pretendard', 'sans-serif']
      },
      colors: {
        ink: '#000000',
        porcelain: '#ffffff',
        haze: '#999999'
      },
      letterSpacing: {
        ultra: '0.3em',
        wide: '0.2em'
      },
      boxShadow: {
        'soft-glow': '0 25px 60px rgba(0, 0, 0, 0.2)'
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards'
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};

export default config;


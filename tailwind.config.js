import { fontSize, borderRadius, zIndex, maxWidth, boxShadow } from './src/design-system/tokens.js';

/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  darkMode: 'selector',
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Token Colors — <alpha-value> ile opacity modifier uyumlu */
        'surface-deep':      'hsl(var(--surface-deep) / <alpha-value>)',
        'surface-darker':    'hsl(var(--surface-darker) / <alpha-value>)',
        'surface-darkest':   'hsl(var(--surface-darkest) / <alpha-value>)',
        'surface-midnight':  'hsl(var(--surface-midnight) / <alpha-value>)',
        'surface-navy':      'hsl(var(--surface-navy) / <alpha-value>)',
        'surface-navy-mid':  'hsl(var(--surface-navy-mid) / <alpha-value>)',
        'brand-cyan':        'hsl(var(--brand-cyan) / <alpha-value>)',
        'vortice-green':     'hsl(var(--vortice-green) / <alpha-value>)',
        'italian-red':       'hsl(var(--italian-red) / <alpha-value>)',
        'primary-navy':      'hsl(var(--primary-navy) / <alpha-value>)',
        'secondary-blue':    'hsl(var(--secondary-blue) / <alpha-value>)',
        'industrial-gray':   'hsl(var(--industrial-gray) / <alpha-value>)',
        'steel-gray':        'hsl(var(--steel-gray) / <alpha-value>)',
        'light-gray':        'hsl(var(--light-gray) / <alpha-value>)',
        'clean-white':       'hsl(var(--clean-white) / <alpha-value>)',
        'air-blue':          'hsl(var(--air-blue) / <alpha-value>)',

        /* Korunan renkler (tema bağımsız, sabit HEX) */
        'success-green': '#10B981',
        'warning-orange': '#F59E0B',
        'gold-accent': '#D97706',
        'silver-accent': '#9CA3AF',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize,
      borderRadius,
      zIndex,
      maxWidth,
      boxShadow,
      backdropBlur: {
        'xs': '2px',
      },
      /* Mevcut animation/keyframes/backgroundImage KORUNACAK */
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
        'scaleOut': 'scaleOut 0.2s ease-out',
        'fadeIn': 'fadeIn 0.2s ease-out',
        'fadeOut': 'fadeOut 0.2s ease-out',
        'enterFromLeft': 'enterFromLeft 0.25s ease',
        'enterFromRight': 'enterFromRight 0.25s ease',
        'exitToLeft': 'exitToLeft 0.25s ease',
        'exitToRight': 'exitToRight 0.25s ease',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        bounceIn: { '0%': { transform: 'scale(0.3)', opacity: '0' }, '50%': { transform: 'scale(1.05)' }, '70%': { transform: 'scale(0.9)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        scaleIn: { '0%': { opacity: '0', transform: 'rotateX(-10deg) scale(0.9)' }, '100%': { opacity: '1', transform: 'rotateX(0deg) scale(1)' } },
        scaleOut: { '0%': { opacity: '1', transform: 'rotateX(0deg) scale(1)' }, '100%': { opacity: '0', transform: 'rotateX(-10deg) scale(0.95)' } },
        enterFromRight: { '0%': { opacity: '0', transform: 'translateX(200px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        enterFromLeft: { '0%': { opacity: '0', transform: 'translateX(-200px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        exitToRight: { '0%': { opacity: '1', transform: 'translateX(0)' }, '100%': { opacity: '0', transform: 'translateX(200px)' } },
        exitToLeft: { '0%': { opacity: '1', transform: 'translateX(0)' }, '100%': { opacity: '0', transform: 'translateX(-200px)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;

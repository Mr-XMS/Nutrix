import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0F1419',
          50: '#F7F8F8',
          100: '#EEEFF1',
          200: '#D8DBDF',
          300: '#A8AEB7',
          400: '#717885',
          500: '#4A5260',
          600: '#2E3540',
          700: '#1C222B',
          800: '#141921',
          900: '#0F1419',
        },
        accent: {
          50: '#EFF7F6',
          100: '#D6EBE8',
          200: '#A8D5CF',
          300: '#74B9B0',
          400: '#479A8F',
          500: '#2E7E73',
          600: '#22655C',
          700: '#1C5048',
          800: '#163C36',
          900: '#0F2925',
        },
        success: '#2E7E73',
        warn: '#B47713',
        danger: '#A23B2A',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(15, 20, 25, 0.04), 0 0 0 0.5px rgba(15, 20, 25, 0.06)',
        card: '0 0 0 0.5px rgba(15, 20, 25, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;

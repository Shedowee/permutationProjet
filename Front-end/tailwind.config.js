/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Open Sans', 'sans-serif'],
      },
      colors: {
        jb: {
          bg: {
            main: '#FFFFFF',
            section: '#F9FAFB',
            card: '#FFFFFF',
            elevated: '#F3F4F6',
          },
          border: '#E5E7EB',
          text: {
            primary: '#000000',
            secondary: '#374151',
            muted: '#6B7280',
          },
          magenta: '#009245',
          red: '#EF4444',
          orange: '#F59E0B',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          green: '#10B981',
          yellow: '#FACC15',
          'orange-soft': '#F97316',
          cyan: '#06B6D4',
        },
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#009245', // OFPPT Green
          600: '#007b3a',
          700: '#00622f',
          800: '#004f27',
          900: '#004121',
          950: '#052e16',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0072BC', // OFPPT Blue
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      boxShadow: {
        'soft': '0 10px 28px -20px rgba(15, 31, 24, 0.22)',
        'medium': '0 18px 40px -26px rgba(15, 31, 24, 0.28)',
        'hard': '0 30px 62px -34px rgba(15, 31, 24, 0.34)',
        'primary': '0 18px 34px -18px rgba(0, 146, 69, 0.48)',
        'secondary': '0 18px 34px -18px rgba(47, 123, 229, 0.40)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'slideUp': 'slideUp 0.5s ease-out forwards',
        'scaleIn': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

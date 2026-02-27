/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Open Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#dcf1e6',
          200: '#bce2cd',
          300: '#8fcca8',
          400: '#5caf7d',
          500: '#009245', // OFPPT Green
          600: '#007b3a', // Hover Green
          700: '#00622f',
          800: '#004f27',
          900: '#004121',
          950: '#002513',
        },
        secondary: {
          50: '#f0f7fb',
          100: '#e0eff7',
          200: '#b9deee',
          300: '#7bc3e1',
          400: '#34a3d1',
          500: '#0072BC', // OFPPT Blue
          600: '#005b96', // Hover Blue
          700: '#004978',
          800: '#003e65',
          900: '#003353',
          950: '#002237',
        },
        neutral: {
          50: '#f9f9f9',
          100: '#f2f2f2',
          200: '#e5e5e5',
          300: '#d1d1d1',
          400: '#b3b3b3',
          500: '#004978', // Changed from grey to deep blue for secondary text
          600: '#5a5b5e',
          700: '#48494b',
          800: '#353638',
          900: '#232325',
          950: '#111112',
        },
        surface: {
          50: '#F4F6F8', // Light background
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#005b96', // Changed to professional blue for secondary visibility
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#020617', // Primary text: Very dark navy/black
          900: '#111827',
          950: '#030712',
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'slideUp': 'slideUp 0.5s ease-out forwards',
        'scaleIn': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
      },
    },
  },
  plugins: [],
};

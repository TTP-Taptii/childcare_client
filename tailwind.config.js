/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C2430',
        muted: '#64708A',
        surface: '#FFFFFF',
        canvas: '#F5F6FA',
        harbor: {
          DEFAULT: '#1F3A5F',
          dark: '#142744',
        },
        amber: {
          DEFAULT: '#E8873A',
          light: '#F2A65A',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

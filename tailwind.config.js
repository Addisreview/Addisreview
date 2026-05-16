/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        green: {
          DEFAULT: '#1a5c3a',
          light: '#2d8657',
          pale: '#e8f5ee',
        },
        yellow: {
          DEFAULT: '#f5c518',
          dark: '#d4a800',
        },
        cream: '#fdf6ec',
        'warm-white': '#fffaf4',
        charcoal: '#1c1c1c',
        muted: '#6b6b6b',
        border: '#e8ddd0',
      },
    },
  },
  plugins: [],
};

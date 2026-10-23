/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Auth-kit colors (values come from CSS variables set from auth.config.js -> theme)
      colors: {
        ak: {
          bg: 'rgb(var(--ak-bg) / <alpha-value>)',
          card: 'rgb(var(--ak-card) / <alpha-value>)',
          field: 'rgb(var(--ak-field) / <alpha-value>)',
          accent: 'rgb(var(--ak-accent) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};

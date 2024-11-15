import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'custom': {
          'bg': {
            'light': '#f0f0f8',
            'dark': '#111111'
          },
          'text': {
            'light': '#1d2c1a',
            'dark': '#e2f8e8'
          }
        },
        'accent': {
          'light': '#495f4f',
          'dark': '#3d4f42',
          'DEFAULT': '#495f4f'
        }
      },
      animation: {
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'subtle-pulse': 'subtle-pulse 2s infinite'
      },
      keyframes: {
        glow: {
          'from': {
            boxShadow: '0 0 5px rgba(92, 246, 107, 0.4), 0 0 10px rgba(139, 92, 246, 0.3), 0 0 15px rgba(226, 246, 92, 0.2)'
          },
          'to': {
            boxShadow: '0 0 10px rgba(209, 247, 212, 0.6), 0 0 20px rgba(145, 188, 153, 0.4), 0 0 30px rgba(92, 246, 113, 0.3)'
          }
        },
        'subtle-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.4)' },
          '70%': { boxShadow: '0 0 0 6px rgba(139, 92, 246, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)' }
        }
      }
    }
  },
  plugins: []
}

export default config 
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', 'class'],
  theme: {
  	extend: {
  		colors: {
  			custom: {
  				bg: {
  					light: '#f0f0f8',
  					dark: '#111111'
  				},
  				text: {
  					light: '#1d2c1a',
  					dark: '#e2f8e8'
  				}
  			},
  			accent: {
  				light: '#495f4f',
  				dark: '#3d4f42',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		animation: {
  			glow: 'glow 1.5s ease-in-out infinite alternate',
  			'subtle-pulse': 'subtle-pulse 2s infinite'
  		},
  		keyframes: {
  			glow: {
  				from: {
  					boxShadow: '0 0 5px rgba(92, 246, 107, 0.4), 0 0 10px rgba(139, 92, 246, 0.3), 0 0 15px rgba(226, 246, 92, 0.2)'
  				},
  				to: {
  					boxShadow: '0 0 10px rgba(209, 247, 212, 0.6), 0 0 20px rgba(145, 188, 153, 0.4), 0 0 30px rgba(92, 246, 113, 0.3)'
  				}
  			},
  			'subtle-pulse': {
  				'0%': {
  					boxShadow: '0 0 0 0 rgba(139, 92, 246, 0.4)'
  				},
  				'70%': {
  					boxShadow: '0 0 0 6px rgba(139, 92, 246, 0)'
  				},
  				'100%': {
  					boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
}

export default config 
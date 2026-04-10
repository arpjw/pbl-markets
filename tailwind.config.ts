import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pbl: {
          bg:        '#0E0B0B',
          card:      '#161111',
          'card-2':  '#1D1515',
          border:    '#271818',
          'border-2':'#3D2828',
          maroon:    '#790000',
          'maroon-2':'#9B0000',
          orange:    '#FA4E1D',
          warm:      '#FF983A',
          cream:     '#F2EDEC',
          muted:     '#8A7272',
          faint:     '#5A4545',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config

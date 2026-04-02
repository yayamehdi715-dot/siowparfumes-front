/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Stitch design system palette
        'primary':                '#000000',
        'primary-container':      '#1C1B1B',
        'on-primary':             '#ffffff',
        'secondary':              '#8C495F',
        'on-secondary':           '#ffffff',
        'secondary-container':    '#ffacc5',
        'on-secondary-container': '#7c3c52',
        'surface':                '#F9F9F9',
        'surface-dim':            '#dadada',
        'surface-bright':         '#F9F9F9',
        'surface-container-lowest': '#ffffff',
        'surface-container-low':  '#F3F3F4',
        'surface-container':      '#eeeeee',
        'surface-container-high': '#e8e8e8',
        'surface-container-highest': '#E2E2E2',
        'on-surface':             '#1a1c1c',
        'on-surface-variant':     '#444748',
        'surface-variant':        '#e2e2e2',
        'outline':                '#747878',
        'outline-variant':        '#c4c7c7',
        'inverse-surface':        '#2f3131',
        'inverse-on-surface':     '#f0f1f1',
        'error':                  '#ba1a1a',
        'background':             '#F9F9F9',
        'on-background':          '#1a1c1c',
      },
      fontFamily: {
        headline: ['"Noto Serif"', 'Georgia', 'serif'],
        body:     ['"Inter"', 'system-ui', 'sans-serif'],
        label:    ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        sm:      '0px',
        md:      '0px',
        lg:      '0px',
        xl:      '0px',
        '2xl':   '0px',
        '3xl':   '0px',
        full:    '9999px',
      },
      animation: {
        'fade-up':   'fadeUp 0.7s ease-out both',
        'fade-in':   'fadeIn 0.5s ease-out both',
        'marquee':   'marquee 40s linear infinite',
        'slide-in':  'slideIn 0.4s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(24px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        slideIn: {
          '0%':   { opacity: 0, transform: 'translateX(-16px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'ambient': '0 10px 40px rgba(26,28,28,0.04)',
        'float':   '0 10px 40px rgba(26,28,28,0.08)',
      },
    },
  },
  plugins: [],
}

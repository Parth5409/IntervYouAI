/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--color-border)", /* light border */
        input: "var(--color-input)", /* pure white */
        ring: "var(--color-ring)", /* deep professional blue */
        background: "var(--color-background)", /* warm off-white */
        foreground: "var(--color-foreground)", /* rich charcoal */
        primary: {
          DEFAULT: "var(--color-primary)", /* deep professional blue */
          foreground: "var(--color-primary-foreground)", /* white */
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", /* sophisticated slate gray */
          foreground: "var(--color-secondary-foreground)", /* white */
        },
        destructive: {
          DEFAULT: "var(--color-destructive)", /* clear red */
          foreground: "var(--color-destructive-foreground)", /* white */
        },
        muted: {
          DEFAULT: "var(--color-muted)", /* light gray */
          foreground: "var(--color-muted-foreground)", /* balanced gray */
        },
        accent: {
          DEFAULT: "var(--color-accent)", /* confident emerald green */
          foreground: "var(--color-accent-foreground)", /* white */
        },
        popover: {
          DEFAULT: "var(--color-popover)", /* pure white */
          foreground: "var(--color-popover-foreground)", /* rich charcoal */
        },
        card: {
          DEFAULT: "var(--color-card)", /* pure white */
          foreground: "var(--color-card-foreground)", /* rich charcoal */
        },
        success: {
          DEFAULT: "var(--color-success)", /* vibrant green */
          foreground: "var(--color-success-foreground)", /* white */
        },
        warning: {
          DEFAULT: "var(--color-warning)", /* warm amber */
          foreground: "var(--color-warning-foreground)", /* white */
        },
        error: {
          DEFAULT: "var(--color-error)", /* clear red */
          foreground: "var(--color-error-foreground)", /* white */
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        "fade-in": "fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "pulse-gentle": "pulseGentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGentle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'elevated': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
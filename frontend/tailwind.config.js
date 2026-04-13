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
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: {
          DEFAULT: "var(--color-primary)",
          dim: "var(--color-primary-dim)",
          container: "var(--color-primary-container)",
          foreground: "var(--color-primary-foreground)",
          fixed: "var(--color-primary-fixed)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          dim: "var(--color-secondary-dim)",
          container: "var(--color-secondary-container)",
          foreground: "var(--color-secondary-foreground)",
        },
        tertiary: {
          DEFAULT: "var(--color-tertiary)",
          dim: "var(--color-tertiary-dim)",
          container: "var(--color-tertiary-container)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          dim: "var(--color-error-dim)",
          container: "var(--color-error-container)",
          foreground: "var(--color-error-foreground)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          dim: "var(--color-surface-dim)",
          bright: "var(--color-surface-bright)",
          variant: "var(--color-surface-variant)",
          tint: "var(--color-surface-tint)",
          container: {
            lowest: "var(--color-surface-container-lowest)",
            low: "var(--color-surface-container-low)",
            DEFAULT: "var(--color-surface-container)",
            high: "var(--color-surface-container-high)",
            highest: "var(--color-surface-container-highest)",
          },
        },
        outline: {
          DEFAULT: "var(--color-outline)",
          variant: "var(--color-outline-variant)",
        },
        "on-surface": {
          DEFAULT: "var(--color-on-surface)",
          variant: "var(--color-on-surface-variant)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
          foreground: "var(--color-destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--color-popover)",
          foreground: "var(--color-popover-foreground)",
        },
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          foreground: "var(--color-success-foreground)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          foreground: "var(--color-warning-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
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
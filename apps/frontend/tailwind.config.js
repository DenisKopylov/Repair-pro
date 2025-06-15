/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
        },
        secondary: {
          50: 'var(--color-secondary-50)',
          500: 'var(--color-secondary-500)',
          600: 'var(--color-secondary-600)',
        },
        accent: {
          500: 'var(--color-accent-500)',
        },
        error: {
          500: 'var(--color-error-500)',
        },
        warning: {
          500: 'var(--color-warning-500)',
        },
        success: {
          500: 'var(--color-success-500)',
        },
        neutral: {
          50: 'var(--color-neutral-50)',
          900: 'var(--color-neutral-900)',
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
};

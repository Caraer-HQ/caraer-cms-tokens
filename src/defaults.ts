import type { CaraerTokenSet } from './schema.ts';

/**
 * Platform defaults.
 *
 * Every value a company has not configured falls back to one of these, so a
 * module never renders against an empty custom property. The greys match the
 * defaults hard-coded on `DigitalIdentity` in the backend.
 */
export const DEFAULT_TOKENS: CaraerTokenSet = {
  colorScheme: 'light',
  color: {
    primary: '#0D47A1',
    'primary-100': '#E3ECF9',
    secondary: '#1976D2',
    accent: '#FFC107',
    font: '#17181A',
    background: '#FFFFFF',
    destructive: '#D32F2F',
    black: '#17181A',
    white: '#FFFFFF',
    'gray-50': '#F7F7F9',
    'gray-100': '#F7F7F9',
    'gray-200': '#EFF0F1',
    'gray-300': '#E5E6E8',
    'gray-400': '#C6C8CC',
    'gray-500': '#A7AAB1',
    'gray-600': '#92969E',
    'gray-700': '#737882',
    'gray-800': '#4E5258',
    'gray-900': '#333539',
  },
  space: {
    '3xs': '0.125rem',
    '2xs': '0.25rem',
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    section: '5rem',
    gutter: '1.5rem',
  },
  radius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },
  type: {
    h1: { font: 'inherit', size: '3.5rem', weight: '700', leading: '1.1' },
    h2: { font: 'inherit', size: '2.5rem', weight: '700', leading: '1.15' },
    h3: { font: 'inherit', size: '2rem', weight: '600', leading: '1.2' },
    h4: { font: 'inherit', size: '1.5rem', weight: '600', leading: '1.3' },
    h5: { font: 'inherit', size: '1.25rem', weight: '600', leading: '1.4' },
    h6: { font: 'inherit', size: '1.125rem', weight: '600', leading: '1.4' },
    body: { font: 'inherit', size: '1rem', weight: '400', leading: '1.6' },
    small: { font: 'inherit', size: '0.875rem', weight: '400', leading: '1.5' },
    nav: { font: 'inherit', size: '1rem', weight: '500', leading: '1.4' },
    button: { font: 'inherit', size: '1rem', weight: '600', leading: '1.2' },
  },
  layout: {
    'container-max-width': '1200px',
    'header-height': '80px',
    'header-offset': '80px',
  },
  breakpoint: {
    mobile: '640px',
    tablet: '1024px',
    desktop: '1280px',
  },
  shadow: {
    sm: '0 1px 2px rgba(23, 24, 26, 0.06)',
    md: '0 4px 12px rgba(23, 24, 26, 0.08)',
    lg: '0 16px 40px rgba(23, 24, 26, 0.12)',
  },
};

/** The dark-mode colour defaults, mirroring the backend's dark palette. */
export const DEFAULT_DARK_COLORS: CaraerTokenSet['color'] = {
  ...DEFAULT_TOKENS.color,
  font: '#F7F7F9',
  background: '#17181A',
  'gray-50': '#17181A',
  'gray-100': '#333539',
  'gray-200': '#4E5258',
  'gray-300': '#737882',
  'gray-400': '#92969E',
  'gray-500': '#A7AAB1',
  'gray-600': '#C6C8CC',
  'gray-700': '#E5E6E8',
  'gray-800': '#EFF0F1',
  'gray-900': '#F7F7F9',
};

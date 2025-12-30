import { NewsTemplate } from './types';

export const NEWS_TEMPLATES: NewsTemplate[] = [
  {
    id: 'metro-news',
    name: 'Metro Daily',
    description: 'Classic breaking news with a red/blue bottom banner.',
    layoutConfig: {
      primaryColor: '#EF4444', // Red-500
      secondaryColor: '#2563EB', // Blue-600
      overlayStyle: 'bottom-banner',
      fontStyle: 'sans-serif'
    }
  },
  {
    id: 'tech-brief',
    name: 'Tech Insider',
    description: 'Dark mode aesthetic with neon accents.',
    layoutConfig: {
      primaryColor: '#0F172A', // Slate-900
      secondaryColor: '#22C55E', // Green-500
      overlayStyle: 'modern-gradient',
      fontStyle: 'monospace'
    }
  },
  {
    id: 'lifestyle-pop',
    name: 'Daily Pop',
    description: 'Vibrant, high-energy layout with framing.',
    layoutConfig: {
      primaryColor: '#EC4899', // Pink-500
      secondaryColor: '#FACC15', // Yellow-400
      overlayStyle: 'pop-frame',
      fontStyle: 'cursive'
    }
  }
];
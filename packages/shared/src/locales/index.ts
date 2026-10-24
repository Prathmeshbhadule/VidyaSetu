import { en } from './en.js';
import { hi } from './hi.js';
import { mr } from './mr.js';

export { en, hi, mr };

export const translations = {
  en,
  hi,
  mr,
} as const;

export type TranslationKeys = typeof en;

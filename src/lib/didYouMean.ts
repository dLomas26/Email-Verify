import { findClosestDomain } from './levenshtein';

const KNOWN_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'live.com',
  'msn.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
  'mail.com',
  'gmx.com',
];

export function getDidYouMean(email: string): string | null {
  if (!email || !email.includes('@')) return null;

  const atIndex = email.lastIndexOf('@');
  const local = email.substring(0, atIndex);
  const domain = email.substring(atIndex + 1);

  const suggestion = findClosestDomain(domain, KNOWN_DOMAINS, 2);
  if (suggestion && suggestion.toLowerCase() !== domain.toLowerCase()) {
    return `${local}@${suggestion}`;
  }

  return null;
}

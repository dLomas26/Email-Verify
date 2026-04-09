export interface SyntaxValidationResult {
  valid: boolean;
  reason?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export function validateEmailSyntax(email: string | null | undefined): SyntaxValidationResult {
  if (email === null || email === undefined) {
    return { valid: false, reason: 'Email is null or undefined' };
  }

  if (typeof email !== 'string') {
    return { valid: false, reason: 'Email must be a string' };
  }

  if (email.trim() === '') {
    return { valid: false, reason: 'Email cannot be empty' };
  }

  if (email.length > 254) {
    return { valid: false, reason: 'Email exceeds maximum length of 254 characters' };
  }

  const atCount = (email.match(/@/g) || []).length;
  if (atCount === 0) {
    return { valid: false, reason: 'Missing @ symbol' };
  }
  if (atCount > 1) {
    return { valid: false, reason: 'Multiple @ symbols detected' };
  }

  const atIndex = email.indexOf('@');
  const local = email.substring(0, atIndex);
  const domain = email.substring(atIndex + 1);

  if (local.length === 0) {
    return { valid: false, reason: 'Local part (before @) is empty' };
  }

  if (local.length > 64) {
    return { valid: false, reason: 'Local part exceeds 64 characters' };
  }

  if (local.startsWith('.') || local.endsWith('.')) {
    return { valid: false, reason: 'Local part cannot start or end with a dot' };
  }

  if (local.includes('..')) {
    return { valid: false, reason: 'Local part contains consecutive dots' };
  }

  if (domain.length === 0) {
    return { valid: false, reason: 'Domain part (after @) is empty' };
  }

  if (domain.startsWith('.') || domain.endsWith('.')) {
    return { valid: false, reason: 'Domain cannot start or end with a dot' };
  }

  if (domain.includes('..')) {
    return { valid: false, reason: 'Domain contains consecutive dots' };
  }

  if (!domain.includes('.')) {
    return { valid: false, reason: 'Domain must have at least one dot' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, reason: 'Email format is invalid' };
  }

  return { valid: true };
}

export function extractDomain(email: string): string {
  const atIndex = email.lastIndexOf('@');
  return email.substring(atIndex + 1).toLowerCase();
}

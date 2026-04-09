import { validateEmailSyntax } from './emailValidator';
import { getDidYouMean } from './didYouMean';
import type { TestCase, EmailVerificationResponse } from './types';

export const TEST_CASES: TestCase[] = [
  {
    id: 'syntax-01',
    description: 'Valid standard email format passes',
    category: 'syntax',
    input: 'user@example.com',
    validator: (result) => result?.subresult !== 'invalid_syntax',
  },
  {
    id: 'syntax-02',
    description: 'Valid email with dots in local part',
    category: 'syntax',
    input: 'first.last@gmail.com',
    validator: (result) => result?.subresult !== 'invalid_syntax',
  },
  {
    id: 'syntax-03',
    description: 'Valid email with plus sign',
    category: 'syntax',
    input: 'user+tag@gmail.com',
    validator: (result) => result?.subresult !== 'invalid_syntax',
  },
  {
    id: 'syntax-04',
    description: 'Invalid: missing @ symbol',
    category: 'syntax',
    input: 'userexample.com',
    validator: (result) => result?.subresult === 'invalid_syntax' && result?.result === 'invalid',
  },
  {
    id: 'syntax-05',
    description: 'Invalid: multiple @ symbols rejected',
    category: 'syntax',
    input: 'user@@example.com',
    validator: (result) => result?.subresult === 'invalid_syntax' && result?.result === 'invalid',
  },
  {
    id: 'syntax-06',
    description: 'Invalid: double dots in local part',
    category: 'syntax',
    input: 'user..name@example.com',
    validator: (result) => result?.subresult === 'invalid_syntax' && result?.result === 'invalid',
  },
  {
    id: 'syntax-07',
    description: 'Invalid: starts with dot',
    category: 'syntax',
    input: '.user@example.com',
    validator: (result) => result?.subresult === 'invalid_syntax',
  },
  {
    id: 'syntax-08',
    description: 'Invalid: missing domain',
    category: 'syntax',
    input: 'user@',
    validator: (result) => result?.subresult === 'invalid_syntax',
  },
  {
    id: 'smtp-01',
    description: 'SMTP 550 error → invalid result (noreply address)',
    category: 'smtp',
    input: 'noreply@gmail.com',
    validator: (result) => result?.result === 'invalid' && result?.resultcode === 6,
  },
  {
    id: 'smtp-02',
    description: 'SMTP 450 greylisted → unknown result',
    category: 'smtp',
    input: 'user@zoho.com',
    validator: (result) => result?.result === 'unknown' && result?.subresult === 'greylisted',
  },
  {
    id: 'smtp-03',
    description: 'Connection error for unknown domain → unknown result',
    category: 'smtp',
    input: 'user@unknowndomain99.xyz',
    validator: (result) => result?.result !== 'valid',
  },
  {
    id: 'smtp-04',
    description: 'Valid Gmail address → valid result',
    category: 'smtp',
    input: 'realuser@gmail.com',
    validator: (result) => result?.result === 'valid' && result?.resultcode === 1,
  },
  {
    id: 'edge-01',
    description: 'Empty string handled gracefully',
    category: 'edge',
    input: '',
    validator: (result) => result?.result === 'invalid' && result?.subresult === 'invalid_syntax',
  },
  {
    id: 'edge-02',
    description: 'Null input handled gracefully',
    category: 'edge',
    input: null,
    validator: (result) => result?.result === 'invalid',
  },
  {
    id: 'edge-03',
    description: 'Undefined input handled gracefully',
    category: 'edge',
    input: undefined,
    validator: (result) => result?.result === 'invalid',
  },
  {
    id: 'edge-04',
    description: 'Very long email (>254 chars) rejected',
    category: 'edge',
    input: 'a'.repeat(245) + '@example.com',
    validator: (result) => result?.result === 'invalid' && result?.subresult === 'invalid_syntax',
  },
  {
    id: 'edge-05',
    description: 'Typo detected: gmial.com → gmail.com',
    category: 'edge',
    input: 'user@gmial.com',
    validator: (result) => result?.didyoumean === 'user@gmail.com',
  },
  {
    id: 'edge-06',
    description: 'Typo detected: yahooo.com → yahoo.com',
    category: 'edge',
    input: 'test@yahooo.com',
    validator: (result) => result?.didyoumean === 'test@yahoo.com',
  },
  {
    id: 'edge-07',
    description: 'Levenshtein: hotmial.com → hotmail.com suggestion',
    category: 'edge',
    input: 'user@hotmial.com',
    validator: (result) => result?.didyoumean === 'user@hotmail.com',
  },
];

export function runSyntaxTest(testCase: TestCase): { passed: boolean; result: EmailVerificationResponse | null } {
  const input = testCase.input;
  const syntaxResult = validateEmailSyntax(input);
  const safeEmail = typeof input === 'string' ? input : '';
  const didyoumean = typeof input === 'string' && input.includes('@') ? getDidYouMean(input) : null;

  const result: EmailVerificationResponse = {
    email: safeEmail,
    result: syntaxResult.valid ? 'unknown' : 'invalid',
    resultcode: syntaxResult.valid ? 3 : 6,
    subresult: syntaxResult.valid ? 'connection_error' : 'invalid_syntax',
    domain: '',
    mxRecords: [],
    executiontime: 0,
    error: syntaxResult.reason ?? null,
    timestamp: new Date().toISOString(),
    didyoumean,
  };

  return { passed: testCase.validator(result), result };
}
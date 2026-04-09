import { validateEmailSyntax, extractDomain } from './emailValidator';
import { getDidYouMean } from './didYouMean';
import type { EmailVerificationResponse } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export async function verifyEmail(email: string | null | undefined): Promise<EmailVerificationResponse> {
  const timestamp = new Date().toISOString();
  const start = performance.now();

  const syntaxCheck = validateEmailSyntax(email);
  if (!syntaxCheck.valid) {
    const elapsed = Math.round((performance.now() - start) / 100) / 10;
    const safeEmail = typeof email === 'string' ? email : '';
    return {
      email: safeEmail,
      result: 'invalid',
      resultcode: 6,
      subresult: 'invalid_syntax',
      domain: safeEmail.includes('@') ? extractDomain(safeEmail) : '',
      mxRecords: [],
      executiontime: elapsed,
      error: syntaxCheck.reason ?? 'Invalid email syntax',
      timestamp,
      didyoumean: null,
    };
  }

  const safeEmail = email as string;
  const domain = extractDomain(safeEmail);
  const didyoumean = getDidYouMean(safeEmail);

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: safeEmail }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json() as EmailVerificationResponse;
    return { ...data, didyoumean: data.didyoumean ?? didyoumean };
  } catch (err) {
    const elapsed = Math.round((performance.now() - start) / 100) / 10;
    return {
      email: safeEmail,
      result: 'unknown',
      resultcode: 3,
      subresult: 'connection_error',
      domain,
      mxRecords: [],
      executiontime: elapsed,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp,
      didyoumean,
    };
  }
}

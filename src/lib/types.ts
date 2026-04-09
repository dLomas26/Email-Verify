export type VerificationResult = 'valid' | 'invalid' | 'unknown';

export type SubResult =
  | 'mailbox_exists'
  | 'mailbox_does_not_exist'
  | 'greylisted'
  | 'connection_error'
  | 'timeout'
  | 'typo_detected'
  | 'invalid_syntax'
  | 'no_mx_records'
  | 'smtp_error'
  | 'domain_not_found';

export interface EmailVerificationResponse {
  email: string;
  result: VerificationResult;
  resultcode: 1 | 3 | 6;
  subresult: SubResult;
  domain: string;
  mxRecords: string[];
  executiontime: number;
  error: string | null;
  timestamp: string;
  didyoumean?: string | null;
}

export interface TestCase {
  id: string;
  description: string;
  category: 'syntax' | 'smtp' | 'edge';
  input: string | null | undefined;
  expectedResult?: VerificationResult;
  expectedSubresult?: SubResult;
  validator: (result: EmailVerificationResponse | null, error?: string) => boolean;
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  actual: EmailVerificationResponse | null;
  error?: string;
  duration: number;
}

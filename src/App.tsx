import { useState } from 'react';
import { ShieldCheck, FlaskConical, BookOpen } from 'lucide-react';
import EmailInput from './components/EmailInput';
import ResultCard from './components/ResultCard';
import TestPanel from './components/TestPanel';
import { verifyEmail } from './lib/emailVerifier';
import type { EmailVerificationResponse } from './lib/types';

type Tab = 'verify' | 'tests' | 'docs';

export default function App() {
  const [tab, setTab] = useState<Tab>('verify');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailVerificationResponse | null>(null);
  const [history, setHistory] = useState<EmailVerificationResponse[]>([]);

  async function handleVerify(email: string) {
    setLoading(true);
    setResult(null);
    const res = await verifyEmail(email);
    setResult(res);
    setHistory(prev => [res, ...prev].slice(0, 8));
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">EmailVerify</h1>
              <p className="text-xs text-gray-400 leading-tight">SMTP Verification Module</p>
            </div>
          </div>
          <nav className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {([
              { key: 'verify', label: 'Verifier', icon: ShieldCheck },
              { key: 'tests', label: 'Unit Tests', icon: FlaskConical },
              { key: 'docs', label: 'Docs', icon: BookOpen },
            ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {tab === 'verify' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Email Verification</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Validate email syntax, perform DNS MX lookup, and simulate SMTP mailbox verification with typo detection.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <EmailInput onVerify={handleVerify} loading={loading} />
            </div>

            {loading && (
              <div className="flex flex-col items-center gap-4 py-12">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">Verifying email...</p>
                  <p className="text-xs text-gray-400 mt-1">Checking syntax, DNS MX records & SMTP</p>
                </div>
              </div>
            )}

            {result && !loading && (
              <div>
                <ResultCard result={result} />
              </div>
            )}

            {history.length > 1 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Verifications</h3>
                <div className="space-y-2">
                  {history.slice(1).map((h, i) => (
                    <HistoryRow key={i} result={h} onClick={() => setResult(h)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'tests' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Unit Test Suite</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                19 comprehensive test cases covering syntax validation, SMTP error codes, and edge cases.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <TestPanel />
            </div>
          </div>
        )}

        {tab === 'docs' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Module Documentation</h2>
              <p className="text-gray-500">API reference for the Email Verification Module</p>
            </div>
            <DocsPanel />
          </div>
        )}
      </main>
    </div>
  );
}

function HistoryRow({ result, onClick }: { result: EmailVerificationResponse; onClick: () => void }) {
  const color = result.result === 'valid' ? 'text-emerald-500' : result.result === 'invalid' ? 'text-red-500' : 'text-amber-500';
  const dot = result.result === 'valid' ? 'bg-emerald-400' : result.result === 'invalid' ? 'bg-red-400' : 'bg-amber-400';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all text-left"
    >
      <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
      <span className="flex-1 text-sm font-mono text-gray-700 truncate">{result.email}</span>
      <span className={`text-xs font-semibold ${color} shrink-0`}>{result.result}</span>
      <span className="text-xs text-gray-400 shrink-0">{result.executiontime}s</span>
    </button>
  );
}

function DocsPanel() {
  return (
    <div className="space-y-6">
      <DocSection
        title="verifyEmail(email)"
        badge="async function"
        badgeColor="bg-blue-100 text-blue-700"
        description="Core verification function. Validates syntax, performs DNS MX lookup simulation, and checks mailbox existence via SMTP protocol."
        code={`const result = await verifyEmail("user@gmail.com");
// Returns:
{
  email: "user@gmail.com",
  result: "valid",          // "valid" | "invalid" | "unknown"
  resultcode: 1,            // 1=valid, 3=unknown, 6=invalid
  subresult: "mailbox_exists",
  domain: "gmail.com",
  mxRecords: ["alt1.gmail-smtp-in.l.google.com"],
  executiontime: 1.2,       // seconds
  error: null,
  timestamp: "2026-02-11T10:30:00.000Z",
  didyoumean: null
}`}
      />
      <DocSection
        title="getDidYouMean(email)"
        badge="function"
        badgeColor="bg-emerald-100 text-emerald-700"
        description="Detects common domain typos using Levenshtein distance algorithm (edit distance 2). Returns a corrected email suggestion or null."
        code={`getDidYouMean("user@gmial.com");
// Returns: "user@gmail.com"

getDidYouMean("test@yahooo.com");
// Returns: "test@yahoo.com"

getDidYouMean("user@gmail.com");
// Returns: null (no typo detected)`}
      />
      <DocSection
        title="validateEmailSyntax(email)"
        badge="function"
        badgeColor="bg-orange-100 text-orange-700"
        description="Pure syntax validation. Checks format, length, character validity, dot rules, and @ symbol count. Handles null/undefined safely."
        code={`validateEmailSyntax("user@example.com");
// Returns: { valid: true }

validateEmailSyntax("user@@example.com");
// Returns: { valid: false, reason: "Multiple @ symbols detected" }

validateEmailSyntax(null);
// Returns: { valid: false, reason: "Email is null or undefined" }`}
      />
      <DocSection
        title="levenshteinDistance(a, b)"
        badge="function"
        badgeColor="bg-slate-100 text-slate-700"
        description="Dynamic programming implementation of the Levenshtein edit distance algorithm. Used internally by getDidYouMean for fuzzy domain matching."
        code={`levenshteinDistance("gmial", "gmail");
// Returns: 2

levenshteinDistance("outlok", "outlook");
// Returns: 1

levenshteinDistance("hotmial", "hotmail");
// Returns: 2`}
      />

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-gray-900">Result Codes</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { code: '1', label: 'Valid', desc: 'Mailbox confirmed', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            { code: '3', label: 'Unknown', desc: 'Could not confirm', color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { code: '6', label: 'Invalid', desc: 'Mailbox rejected', color: 'text-red-600 bg-red-50 border-red-200' },
          ].map(({ code, label, desc, color }) => (
            <div key={code} className={`border rounded-xl p-3 ${color}`}>
              <p className="font-mono font-bold text-lg">{code}</p>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs opacity-75 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocSection({ title, badge, badgeColor, description, code }: {
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  code: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <h3 className="font-bold text-gray-900 font-mono text-sm">{title}</h3>
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${badgeColor}`}>{badge}</span>
      </div>
      <div className="px-6 py-4 space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        <pre className="bg-gray-950 text-gray-100 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed">
          {code}
        </pre>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react';
import { TEST_CASES, runSyntaxTest } from '../lib/testCases';
import { verifyEmail } from '../lib/emailVerifier';
import type { TestResult, TestCase } from '../lib/types';
import type { EmailVerificationResponse } from '../lib/types';

const CATEGORY_LABELS = {
  syntax: 'Syntax Validation',
  smtp: 'SMTP Error Codes',
  edge: 'Edge Cases',
};

const CATEGORY_COLORS = {
  syntax: 'bg-blue-100 text-blue-700',
  smtp: 'bg-orange-100 text-orange-700',
  edge: 'bg-slate-100 text-slate-700',
};

export default function TestPanel() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const syntaxOnly = TEST_CASES.filter(tc => tc.category === 'syntax' || tc.category === 'edge');
  const smtpTests = TEST_CASES.filter(tc => tc.category === 'smtp');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  async function runAllTests() {
    setRunning(true);
    setResults([]);

    const allResults: TestResult[] = [];

    for (const tc of TEST_CASES) {
      const start = performance.now();

      if (tc.category === 'syntax' || tc.category === 'edge') {
        const { passed, result } = runSyntaxTest(tc);
        allResults.push({
          testCase: tc,
          passed,
          actual: result,
          duration: Math.round(performance.now() - start),
        });
        setResults([...allResults]);
      } else {
        try {
          const result = await verifyEmail(tc.input as string);
          const duration = Math.round(performance.now() - start);
          allResults.push({ testCase: tc, passed: tc.validator(result), actual: result, duration });
          setResults([...allResults]);
        } catch (err) {
          const duration = Math.round(performance.now() - start);
          allResults.push({
            testCase: tc,
            passed: false,
            actual: null,
            error: String(err),
            duration,
          });
          setResults([...allResults]);
        }
      }
    }

    setRunning(false);
  }

  const grouped = TEST_CASES.reduce<Record<string, { tc: TestCase; result?: TestResult }[]>>((acc, tc) => {
    if (!acc[tc.category]) acc[tc.category] = [];
    const result = results.find(r => r.testCase.id === tc.id);
    acc[tc.category].push({ tc, result });
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Unit Test Suite</h2>
          <p className="text-sm text-gray-500 mt-0.5">{TEST_CASES.length} test cases across 3 categories</p>
        </div>
        <button
          onClick={runAllTests}
          disabled={running}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          {running ? (
            <><Clock className="w-4 h-4 animate-spin" /> Running...</>
          ) : (
            <><Play className="w-4 h-4" /> Run All Tests</>
          )}
        </button>
      </div>

      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <SummaryTile label="Total" value={TEST_CASES.length} color="text-gray-900" bg="bg-gray-50 border-gray-200" />
          <SummaryTile label="Passed" value={passed} color="text-emerald-600" bg="bg-emerald-50 border-emerald-200" />
          <SummaryTile label="Failed" value={failed} color="text-red-600" bg="bg-red-50 border-red-200" />
        </div>
      )}

      {(['syntax', 'smtp', 'edge'] as const).map(cat => {
        const group = grouped[cat] ?? TEST_CASES.filter(tc => tc.category === cat).map(tc => ({ tc }));
        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {CATEGORY_LABELS[cat]}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[cat]}`}>
                {group.length} tests
              </span>
            </div>
            <div className="space-y-1.5">
              {group.map(({ tc, result }) => (
                <TestRow
                  key={tc.id}
                  testCase={tc}
                  result={result}
                  expanded={expanded === tc.id}
                  onToggle={() => setExpanded(expanded === tc.id ? null : tc.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TestRow({ testCase, result, expanded, onToggle }: {
  testCase: TestCase;
  result?: TestResult;
  expanded: boolean;
  onToggle: () => void;
}) {
  const pending = !result;
  const bg = pending ? 'bg-gray-50 border-gray-100' : result.passed ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100';

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${bg}`}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={result ? onToggle : undefined}
      >
        <span className="shrink-0">
          {pending ? (
            <span className="w-5 h-5 rounded-full border-2 border-gray-300 inline-block" />
          ) : result.passed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </span>
        <span className="flex-1 text-sm text-gray-700">{testCase.description}</span>
        <span className="text-xs text-gray-400 font-mono shrink-0">
          {testCase.input === null ? 'null' : testCase.input === undefined ? 'undefined' : `"${String(testCase.input).substring(0, 24)}${String(testCase.input).length > 24 ? '…' : ''}"`}
        </span>
        {result && (
          <span className="text-xs text-gray-400 shrink-0">{result.duration}ms</span>
        )}
        {result && (expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />)}
      </button>

      {expanded && result?.actual && (
        <div className="px-4 pb-3 border-t border-gray-100">
          <pre className="text-xs text-gray-600 bg-white rounded-lg p-3 mt-2 overflow-x-auto font-mono border border-gray-100">
            {JSON.stringify(result.actual, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function SummaryTile({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`border rounded-xl px-4 py-3 text-center ${bg}`}>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
    </div>
  );
}

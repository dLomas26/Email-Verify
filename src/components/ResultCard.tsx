import { CheckCircle, XCircle, AlertCircle, Clock, Globe, Mail, Server, Lightbulb } from 'lucide-react';
import type { EmailVerificationResponse } from '../lib/types';

interface ResultCardProps {
  result: EmailVerificationResponse;
}

const STATUS_CONFIG = {
  valid: {
    icon: CheckCircle,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Valid',
  },
  invalid: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-500',
    badge: 'bg-red-100 text-red-700',
    label: 'Invalid',
  },
  unknown: {
    icon: AlertCircle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Unknown',
  },
};

const SUBRESULT_LABELS: Record<string, string> = {
  mailbox_exists: 'Mailbox exists',
  mailbox_does_not_exist: 'Mailbox does not exist',
  greylisted: 'Greylisted (retry later)',
  connection_error: 'Connection error',
  timeout: 'Connection timed out',
  typo_detected: 'Typo detected',
  invalid_syntax: 'Invalid syntax',
  no_mx_records: 'No MX records found',
  smtp_error: 'SMTP error',
  domain_not_found: 'Domain not found',
};

export default function ResultCard({ result }: ResultCardProps) {
  const cfg = STATUS_CONFIG[result.result];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-6 space-y-5 transition-all duration-300`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Icon className={`w-8 h-8 ${cfg.iconColor} shrink-0`} />
          <div>
            <p className="text-sm text-gray-500 font-medium">Verification Result</p>
            <h3 className="text-xl font-bold text-gray-900">{result.email}</h3>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
          <span className="text-xs text-gray-400 font-mono">code: {result.resultcode}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoTile icon={<Server className="w-4 h-4" />} label="Sub-result" value={SUBRESULT_LABELS[result.subresult] ?? result.subresult} />
        <InfoTile icon={<Globe className="w-4 h-4" />} label="Domain" value={result.domain || '—'} />
        <InfoTile icon={<Clock className="w-4 h-4" />} label="Execution Time" value={`${result.executiontime}s`} />
        <InfoTile icon={<Mail className="w-4 h-4" />} label="MX Records" value={result.mxRecords.length > 0 ? `${result.mxRecords.length} found` : 'None'} />
      </div>

      {result.mxRecords.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">MX Records</p>
          <div className="space-y-1">
            {result.mxRecords.map((mx, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded-lg px-3 py-1.5 border border-gray-100">
                <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                <span className="font-mono text-xs">{mx}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.didyoumean && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Did you mean?</p>
            <p className="text-sm text-blue-700 font-mono mt-0.5">{result.didyoumean}</p>
          </div>
        </div>
      )}

      {result.error && (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">SMTP Response</p>
          <p className="text-sm text-gray-600 font-mono">{result.error}</p>
        </div>
      )}

      <p className="text-xs text-gray-400 text-right">
        {new Date(result.timestamp).toLocaleString()}
      </p>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
    </div>
  );
}

import { useState } from 'react';
import { Search, Mail, X } from 'lucide-react';

interface EmailInputProps {
  onVerify: (email: string) => void;
  loading: boolean;
}

const EXAMPLE_EMAILS = [
  'user@gmail.com',
  'noreply@outlook.com',
  'test@gmial.com',
  'user@zoho.com',
  'invalid-email',
];

export default function EmailInput({ onVerify, loading }: EmailInputProps) {
  const [value, setValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) onVerify(value.trim());
  }

  function handleExample(email: string) {
    setValue(email);
    onVerify(email);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Mail className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Enter an email address to verify..."
          className="w-full pl-12 pr-28 py-4 rounded-2xl border-2 border-gray-200 focus:border-gray-400 focus:outline-none text-gray-900 text-sm placeholder-gray-400 bg-white transition-colors"
          disabled={loading}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue('')}
            className="absolute inset-y-0 right-24 flex items-center px-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={!value.trim() || loading}
          className="absolute inset-y-0 right-2 my-2 px-4 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-xl font-semibold text-sm transition-colors flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" />
          Verify
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">Try:</span>
        {EXAMPLE_EMAILS.map(email => (
          <button
            key={email}
            onClick={() => handleExample(email)}
            disabled={loading}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-mono transition-colors disabled:opacity-50"
          >
            {email}
          </button>
        ))}
      </div>
    </div>
  );
}

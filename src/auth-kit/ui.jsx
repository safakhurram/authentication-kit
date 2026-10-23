import { Chrome } from 'lucide-react';

export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin text-current ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function Input({ icon: Icon, label, id, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-gray-400">{label}</label>
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon size={16} />
          </span>
        )}
        <input
          id={id}
          className={`w-full rounded-lg border border-white/10 bg-ak-field py-2.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-ak-accent focus:ring-1 focus:ring-ak-accent/50 ${Icon ? 'pl-10 pr-3' : 'px-3'}`}
          {...props}
        />
      </div>
    </div>
  );
}

export function Alert({ type, children }) {
  const styles =
    type === 'error'
      ? 'border-red-500/20 bg-red-500/10 text-red-200'
      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200';
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3 py-2 text-xs ${styles}`}>
      {children}
    </div>
  );
}

export function OtpInput({ value, onChange }) {
  return (
    <div className="flex justify-center">
      <input
        type="text"
        inputMode="numeric"
        autoFocus
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="••••••"
        autoComplete="one-time-code"
        aria-label="6-digit code"
        className="w-56 rounded-lg border border-white/10 bg-ak-field py-3 text-center font-mono text-2xl tracking-[0.6em] text-white outline-none transition placeholder:text-gray-700 focus:border-ak-accent focus:ring-1 focus:ring-ak-accent/50"
      />
    </div>
  );
}

export function PrimaryButton({ loading, icon: Icon, children, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="ak-btn flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold"
      {...props}
    >
      {loading ? <Spinner /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function Divider() {
  return (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
      <div className="relative flex justify-center text-xs"><span className="bg-ak-card px-2 text-gray-500">or</span></div>
    </div>
  );
}

export function GoogleButton({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-ak-field py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5 disabled:opacity-60"
    >
      <Chrome size={18} className="text-ak-accent" />
      {label}
    </button>
  );
}

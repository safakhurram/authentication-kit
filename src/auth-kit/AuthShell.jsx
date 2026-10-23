import { ArrowLeft, Lock } from 'lucide-react';
import './auth.css';
import { useAuthConfig } from './AuthProvider.jsx';

/** Page frame: themed background, card, logo + brand + subtitle. */
export default function AuthShell({ subtitle, icon: Icon = Lock, onBack, children }) {
  const { brand, theme } = useAuthConfig();
  const vars = {
    '--ak-bg': theme.bg,
    '--ak-card': theme.card,
    '--ak-field': theme.field,
    '--ak-accent': theme.accent,
  };

  return (
    <div style={vars} className="relative flex min-h-screen items-center justify-center bg-ak-bg px-4 py-10 text-white">
      <div className="ak-grid pointer-events-none fixed inset-0" />
      <div className="relative w-full max-w-md rounded-2xl border border-white/5 bg-ak-card p-7 shadow-2xl sm:p-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute left-4 top-4 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="rounded-xl bg-ak-accent/15 p-3 text-ak-accent">
            {brand.logo ? <img src={brand.logo} alt="" className="h-7 w-7 object-contain" /> : <Icon size={28} />}
          </span>
          <h1 className="ak-gradient-text font-mono text-lg font-bold tracking-widest">{brand.name}</h1>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { CheckCircle, Lock, XCircle } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { useAuthConfig } from './AuthProvider.jsx';
import { getSupabase } from './supabaseClient.js';
import { Alert, Input, PrimaryButton, Spinner } from './ui.jsx';

/** Landing page of the password-reset email link. Rendered automatically by <AuthGate> on routes.resetPassword. */
export default function ResetPasswordPage() {
  const { minPasswordLength: minPw, routes } = useAuthConfig();
  const [status, setStatus] = useState('checking'); // checking | ready | invalid | done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    const supabase = getSupabase();
    let active = true;
    const markReady = () => active && setStatus((s) => (s === 'checking' ? 'ready' : s));

    supabase.auth.getSession().then(({ data }) => data.session && markReady());
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => session && markReady());
    // The SDK needs a moment to consume the token in the URL. No session after 4s = bad/expired link.
    const timer = setTimeout(() => active && setStatus((s) => (s === 'checking' ? 'invalid' : s)), 4000);

    return () => {
      active = false;
      clearTimeout(timer);
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < minPw) return setError(`Password must be at least ${minPw} characters.`);
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    const supabase = getSupabase();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) return setError(err.message || 'Could not update password.');

    setStatus('done');
    await supabase.auth.signOut();
    setTimeout(() => { window.location.href = routes.afterReset; }, 2000);
  };

  return (
    <AuthShell subtitle="Reset your password">
      {status === 'checking' && (
        <div className="flex flex-col items-center gap-3 py-8 text-gray-400">
          <Spinner className="h-6 w-6" />
          <p className="text-sm">Preparing secure reset…</p>
        </div>
      )}

      {status === 'invalid' && (
        <div className="space-y-4 text-center">
          <XCircle className="mx-auto h-10 w-10 text-red-400" />
          <p className="text-sm text-gray-300">This reset link is invalid or has expired.</p>
          <a href={routes.afterReset} className="ak-btn inline-block rounded-lg px-5 py-2 text-sm font-semibold">Back to sign in</a>
        </div>
      )}

      {status === 'done' && (
        <div className="space-y-3 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-emerald-400" />
          <h2 className="text-base font-semibold">Password updated</h2>
          <p className="text-sm text-gray-300">Redirecting you to sign in…</p>
        </div>
      )}

      {status === 'ready' && (
        <form onSubmit={submit} className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}
          <Input id="ak-new" icon={Lock} label="New password" type="password" placeholder={`At least ${minPw} characters`} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          <Input id="ak-confirm" icon={Lock} label="Confirm password" type="password" placeholder="Re-enter your password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          <PrimaryButton loading={loading} icon={Lock}>Save New Password</PrimaryButton>
        </form>
      )}
    </AuthShell>
  );
}

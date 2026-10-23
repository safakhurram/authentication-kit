import { useState } from 'react';
import { ArrowLeft, Lock, LogIn, Mail, ShieldCheck, User } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { useAuthConfig } from './AuthProvider.jsx';
import { authGuard, getAppOrigin, getSupabase } from './supabaseClient.js';
import { Alert, Divider, GoogleButton, Input, OtpInput, PrimaryButton } from './ui.jsx';

const MODES = { SIGN_IN: 'signin', SIGN_UP: 'signup', FORGOT: 'forgot', VERIFY_SIGNUP: 'verify-signup', VERIFY_LOGIN: 'verify-login' };
const validEmail = (e) => /^\S+@\S+\.\S+$/.test(e);

/**
 * Full auth screen: sign in, sign up (+email code), login code, forgot password, Google.
 * Props: onBack (optional) shows a "Back" button, e.g. to return to your landing page.
 */
export default function AuthPage({ onBack }) {
  const { features, minPasswordLength: minPw, routes, text } = useAuthConfig();
  const [mode, setMode] = useState(MODES.SIGN_IN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', code: '' });

  const isVerify = mode === MODES.VERIFY_SIGNUP || mode === MODES.VERIFY_LOGIN;
  const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };
  const switchMode = (next) => { setMode(next); setError(''); setMessage(''); setForm((f) => ({ ...f, code: '' })); };
  const reset = () => { setError(''); setMessage(''); };

  // ---------- SIGN IN ----------
  const handleSignIn = async (e) => {
    e.preventDefault(); reset();
    if (!validEmail(form.email)) return setError('Please enter a valid email address.');
    if (form.password.length < minPw) return setError(`Password must be at least ${minPw} characters.`);

    const supabase = getSupabase();
    setLoading(true);

    if (!features.loginCode) {
      const { error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      setLoading(false);
      if (err) setError(err.message || 'Invalid email or password.');
      return; // AuthProvider picks up the session
    }

    // Step 1: verify the password, but never let the app see this session.
    authGuard.hold = true;
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (err) throw err;
      await supabase.auth.signOut({ scope: 'local' }); // drop the half-session
      // Step 2: email a 6-digit code. The user is only signed in after verifyOtp succeeds.
      const { error: otpErr } = await supabase.auth.signInWithOtp({ email: form.email, options: { shouldCreateUser: false } });
      if (otpErr) throw otpErr;
      setPendingEmail(form.email);
      setForm((f) => ({ ...f, code: '' }));
      setMode(MODES.VERIFY_LOGIN);
      setMessage(`A 6-digit code was sent to ${form.email}.`);
    } catch (err) {
      setError(err.message || 'Could not sign in.');
    } finally {
      authGuard.hold = false;
      setLoading(false);
    }
  };

  // ---------- SIGN UP ----------
  const handleSignUp = async (e) => {
    e.preventDefault(); reset();
    if (form.username.trim().length < 2) return setError('Username must be at least 2 characters.');
    if (!validEmail(form.email)) return setError('Please enter a valid email address.');
    if (form.password.length < minPw) return setError(`Password must be at least ${minPw} characters.`);
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setLoading(true);
    const { data, error: err } = await getSupabase().auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username.trim() } },
    });
    setLoading(false);
    if (err) return setError(err.message || 'Could not create account.');

    // Supabase returns a fake user with no identities when the email is already registered.
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return setError('An account with this email already exists. Please sign in.');
    }
    // Email confirmation disabled in Supabase -> session exists, AuthProvider signs the user in.
    if (data?.session) return;

    setPendingEmail(form.email);
    setForm((f) => ({ ...f, code: '' }));
    setMode(MODES.VERIFY_SIGNUP);
    setMessage(`We sent a 6-digit verification code to ${form.email}.`);
  };

  // ---------- VERIFY CODE (signup confirm or login code) ----------
  const handleVerify = async (e) => {
    e.preventDefault(); reset();
    const code = form.code.trim();
    if (!/^\d{6}$/.test(code)) return setError('Please enter the 6-digit code from your email.');
    setLoading(true);
    const { error: err } = await getSupabase().auth.verifyOtp({
      email: pendingEmail,
      token: code,
      type: mode === MODES.VERIFY_SIGNUP ? 'signup' : 'email',
    });
    setLoading(false);
    if (err) setError(err.message || 'Invalid or expired code.');
    // success -> session created -> AuthProvider signs the user in
  };

  const handleResend = async () => {
    if (!pendingEmail || loading) return;
    reset(); setLoading(true);
    const auth = getSupabase().auth;
    const { error: err } =
      mode === MODES.VERIFY_SIGNUP
        ? await auth.resend({ type: 'signup', email: pendingEmail })
        : await auth.signInWithOtp({ email: pendingEmail, options: { shouldCreateUser: false } });
    setLoading(false);
    if (err) return setError(err.message || 'Could not resend the code.');
    setMessage(`A new code was sent to ${pendingEmail}.`);
  };

  // ---------- FORGOT ----------
  const handleForgot = async (e) => {
    e.preventDefault(); reset();
    if (!validEmail(form.email)) return setError('Please enter a valid email address.');
    setLoading(true);
    const { error: err } = await getSupabase().auth.resetPasswordForEmail(form.email, {
      redirectTo: `${getAppOrigin()}${routes.resetPassword}`,
    });
    setLoading(false);
    if (err) return setError(err.message || 'Could not send reset email.');
    setMessage('If this account exists, a password reset link has been sent.');
  };

  // ---------- GOOGLE ----------
  const handleGoogle = async () => {
    reset(); setLoading(true);
    const { error: err } = await getSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getAppOrigin() },
    });
    if (err) {
      setLoading(false);
      setError(
        /not enabled/i.test(err.message || '')
          ? 'Google sign-in is not enabled for this project. Enable it in Supabase -> Authentication -> Providers, or set features.google to false.'
          : err.message || 'Google sign in failed.',
      );
    }
  };

  const subtitle = {
    [MODES.SIGN_IN]: text.signIn,
    [MODES.SIGN_UP]: text.signUp,
    [MODES.FORGOT]: text.forgot,
    [MODES.VERIFY_SIGNUP]: text.verifySignup,
    [MODES.VERIFY_LOGIN]: text.verifyLogin,
  }[mode];

  const showTabs = features.signUp && !isVerify && mode !== MODES.FORGOT;

  return (
    <AuthShell subtitle={subtitle} icon={isVerify ? ShieldCheck : Lock} onBack={onBack}>
      {showTabs && (
        <div className="mb-6 flex rounded-full bg-ak-field p-1">
          {[MODES.SIGN_IN, MODES.SIGN_UP].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 rounded-full py-2 text-xs font-semibold transition sm:text-sm ${mode === m ? 'bg-ak-accent text-black' : 'text-gray-400 hover:text-white'}`}
            >
              {m === MODES.SIGN_IN ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>
      )}

      {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}
      {message && <div className="mb-4"><Alert type="success">{message}</Alert></div>}

      {mode === MODES.SIGN_IN && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <Input id="ak-email" icon={Mail} label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" />
          <Input id="ak-password" icon={Lock} label="Password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => update('password', e.target.value)} autoComplete="current-password" />
          {features.forgotPassword && (
            <div className="flex justify-end">
              <button type="button" onClick={() => switchMode(MODES.FORGOT)} className="text-xs text-ak-accent hover:underline">Forgot password?</button>
            </div>
          )}
          <PrimaryButton loading={loading} icon={LogIn}>Sign In</PrimaryButton>
          {features.google && (<><Divider /><GoogleButton label="Continue with Google" onClick={handleGoogle} disabled={loading} /></>)}
        </form>
      )}

      {mode === MODES.SIGN_UP && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input id="ak-username" icon={User} label="Username" type="text" placeholder="johndoe" value={form.username} onChange={(e) => update('username', e.target.value)} autoComplete="username" />
          <Input id="ak-email" icon={Mail} label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" />
          <Input id="ak-password" icon={Lock} label="Password" type="password" placeholder={`At least ${minPw} characters`} value={form.password} onChange={(e) => update('password', e.target.value)} autoComplete="new-password" />
          <Input id="ak-confirm" icon={Lock} label="Confirm Password" type="password" placeholder="••••••••" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} autoComplete="new-password" />
          <PrimaryButton loading={loading} icon={User}>Create Account</PrimaryButton>
          {features.google && (<><Divider /><GoogleButton label="Sign up with Google" onClick={handleGoogle} disabled={loading} /></>)}
        </form>
      )}

      {mode === MODES.FORGOT && (
        <form onSubmit={handleForgot} className="space-y-4">
          <button type="button" onClick={() => switchMode(MODES.SIGN_IN)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white">
            <ArrowLeft size={14} /> Back to sign in
          </button>
          <p className="text-sm text-gray-300">Enter your email and we’ll send you a reset link.</p>
          <Input id="ak-email" icon={Mail} label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" />
          <PrimaryButton loading={loading} icon={Mail}>Send Reset Link</PrimaryButton>
        </form>
      )}

      {isVerify && (
        <form onSubmit={handleVerify} className="space-y-5">
          <p className="text-center text-sm text-gray-300">
            Enter the 6-digit code sent to <span className="font-medium text-white">{pendingEmail}</span>.
          </p>
          <OtpInput value={form.code} onChange={(v) => update('code', v)} />
          <PrimaryButton loading={loading} icon={ShieldCheck}>
            {mode === MODES.VERIFY_LOGIN ? text.verifyLoginButton : 'Verify Email'}
          </PrimaryButton>
          <button type="button" onClick={handleResend} disabled={loading} className="w-full text-center text-xs text-ak-accent hover:underline disabled:opacity-60">
            Didn’t get a code? Resend
          </button>
          <button type="button" onClick={() => switchMode(MODES.SIGN_IN)} className="w-full text-center text-xs text-gray-400 hover:text-white">
            Back to sign in
          </button>
        </form>
      )}
    </AuthShell>
  );
}

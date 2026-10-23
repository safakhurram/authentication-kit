import AuthPage from './AuthPage.jsx';
import AuthShell from './AuthShell.jsx';
import { useAuth, useAuthConfig } from './AuthProvider.jsx';
import ResetPasswordPage from './ResetPasswordPage.jsx';
import { Spinner } from './ui.jsx';

/**
 * Wrap your protected app:
 *   <AuthGate>{({ user, signOut }) => <App user={user} />}</AuthGate>
 *
 * - not signed in  -> <AuthPage /> (or your own `fallback`)
 * - signed in      -> children (node, or function receiving { user, signOut })
 * - reset-password route and missing-env screen are handled automatically.
 */
export default function AuthGate({ children, fallback, onBack }) {
  const { user, loading, configError, signOut } = useAuth();
  const { routes } = useAuthConfig();

  if (configError) {
    return (
      <AuthShell subtitle="Configuration missing">
        <p className="text-center text-sm leading-relaxed text-gray-400">{configError}</p>
      </AuthShell>
    );
  }
  if (window.location.pathname === routes.resetPassword) return <ResetPasswordPage />;
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-gray-400">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (!user) return fallback ?? <AuthPage onBack={onBack} />;
  return typeof children === 'function' ? children({ user, signOut }) : children;
}

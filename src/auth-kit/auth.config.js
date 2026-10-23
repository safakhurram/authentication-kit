/**
 * EDIT THIS FILE — branding, colors, text and feature switches for the auth pages.
 * Colors are "R G B" triplets (space separated).
 * You can also pass overrides at runtime: <AuthProvider config={{ brand: { name: 'MyApp' } }}>
 */
export const defaultAuthConfig = {
  brand: {
    name: 'YOUR APP',
    logo: '', // optional image url (e.g. '/logo.svg'); empty = default lock icon
  },

  theme: {
    bg: '10 10 10',
    card: '18 21 30',
    field: '24 28 40',
    accent: '245 166 35',
  },

  features: {
    signUp: true, // show Sign Up tab (email + OTP verification)
    google: false, // "Continue with Google": set true ONLY after enabling Google in Supabase -> Authentication -> Providers
    forgotPassword: true,
    loginCode: true, // email 6-digit code step after correct password
  },

  minPasswordLength: 6,

  // Public profile table. sync:false = don't touch any table (auth only).
  profile: { table: 'users', sync: true },

  routes: {
    resetPassword: '/reset-password', // must also be added in Supabase -> Auth -> URL Configuration -> Redirect URLs
    afterReset: '/', // where to go after the password is changed
  },

  text: {
    signIn: 'Welcome back',
    signUp: 'Create your account',
    forgot: 'Reset your password',
    verifySignup: 'Confirm your email to finish signing up',
    verifyLogin: 'Two-step verification',
    verifyLoginButton: 'Verify & Sign In',
  },
};

export function mergeConfig(overrides = {}) {
  const out = {};
  for (const key of Object.keys(defaultAuthConfig)) {
    const base = defaultAuthConfig[key];
    const over = overrides[key];
    out[key] = base && typeof base === 'object' && !Array.isArray(base) ? { ...base, ...(over || {}) } : over ?? base;
  }
  return out;
}

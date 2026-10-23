import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { mergeConfig } from './auth.config.js';
import { authGuard, getConfigError, getSupabase } from './supabaseClient.js';

const AuthContext = createContext(null);
const ConfigContext = createContext(mergeConfig());

export const useAuthConfig = () => useContext(ConfigContext);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

function deriveUsername(u) {
  const m = u?.user_metadata || {};
  return m.username || m.full_name || m.name || u?.email?.split('@')[0] || 'User';
}

export function AuthProvider({ children, config }) {
  const cfg = useMemo(() => mergeConfig(config), [config]);
  const [state, setState] = useState({ user: null, loading: true });
  const mounted = useRef(true);

  const loadUser = useCallback(
    async (authUser) => {
      if (!mounted.current) return;
      if (!authUser) {
        setState({ user: null, loading: false });
        return;
      }

      let username = deriveUsername(authUser);

      // Best-effort profile sync: a missing table / RLS problem must NOT block login.
      const supabase = getSupabase();
      if (cfg.profile.sync && supabase) {
        try {
          const table = cfg.profile.table;
          const { data } = await supabase.from(table).select('id, username').eq('id', authUser.id).maybeSingle();
          if (data?.username) {
            username = data.username;
          } else {
            const { error } = await supabase
              .from(table)
              .upsert({ id: authUser.id, username, email: authUser.email }, { onConflict: 'id' });
            if (error) console.warn('[auth-kit] profile sync failed:', error.message);
          }
        } catch (e) {
          console.warn('[auth-kit] profile sync failed:', e?.message || e);
        }
      }

      if (!mounted.current) return;
      setState({
        user: { id: authUser.id, email: authUser.email, username, name: username, authUser },
        loading: false,
      });
    },
    [cfg.profile.sync, cfg.profile.table],
  );

  useEffect(() => {
    mounted.current = true;
    const supabase = getSupabase();
    if (!supabase) {
      setState({ user: null, loading: false });
      return undefined;
    }

    // NOTE: don't call supabase from inside this callback directly (can deadlock) -> defer with setTimeout.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (authGuard.hold) return;
      setTimeout(() => loadUser(session?.user ?? null), 0);
    });

    supabase.auth.getSession().then(({ data }) => loadUser(data.session?.user ?? null));

    return () => {
      mounted.current = false;
      listener?.subscription?.unsubscribe();
    };
  }, [loadUser]);

  const signOut = useCallback(async () => {
    await getSupabase()?.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ ...state, configError: getConfigError(), signOut }),
    [state, signOut],
  );

  return (
    <ConfigContext.Provider value={cfg}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </ConfigContext.Provider>
  );
}

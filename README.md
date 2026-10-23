# Auth Kit — ready-made Login page (React + Supabase + Tailwind)

Ek baar setup, phir kisi bhi project mein login system ready:

- Sign In / Sign Up (username + email + password)
- Email ke 6-digit code se signup verification
- Login par optional email code step
- Forgot password + Reset password page
- Google login
- `<AuthGate>`: logged-out user ko login page dikhata hai
- Branding, colors, text, features: sirf `src/auth-kit/auth.config.js` se

## 1. Supabase setup (5 min)

1. https://supabase.com par project banao. **Project Settings -> API** se URL aur anon key lo.
2. `.env.example` ko `.env` copy karo aur dono values bharo.
3. **SQL Editor** mein `supabase/setup.sql` run karo (profile table `users` + RLS). Profile table nahi chahiye to config mein `profile.sync: false` kar do.
4. **Authentication -> Email Templates**: "Confirm signup" aur "Magic Link" dono templates mein `{{ .Token }}` hona chahiye, warna email mein 6-digit code nahi, sirf link aayega.
5. **Authentication -> URL Configuration**: Site URL aur Redirect URLs mein apna URL daalo (jaise `http://localhost:5173` aur `http://localhost:5173/reset-password`).
6. Google login (default mein band hai): chahiye to pehle **Authentication -> Providers -> Google** enable karo (Google Cloud ka Client ID/Secret lagta hai), phir config mein `features.google: true`.

## 2. Chalana

```bash
npm install
npm run dev
```

## 3. Apne project mein lagana

1. `src/auth-kit/` folder copy karo.
2. `npm i @supabase/supabase-js lucide-react`
3. `tailwind.config.js` ke `theme.extend.colors` mein add karo:
   ```js
   ak: {
     bg: 'rgb(var(--ak-bg) / <alpha-value>)',
     card: 'rgb(var(--ak-card) / <alpha-value>)',
     field: 'rgb(var(--ak-field) / <alpha-value>)',
     accent: 'rgb(var(--ak-accent) / <alpha-value>)',
   },
   ```
4. App wrap karo:
   ```jsx
   import { AuthProvider, AuthGate } from './auth-kit';

   <AuthProvider config={{ brand: { name: 'MyApp' } }}>
     <AuthGate>{({ user, signOut }) => <MyApp user={user} signOut={signOut} />}</AuthGate>
   </AuthProvider>
   ```
5. Kisi bhi component mein user chahiye: `const { user, signOut } = useAuth();`

Agar aapke app mein pehle se Supabase client hai: render se pehle ek baar `setSupabaseClient(myClient)` call karo.

Landing page ke saath: `<AuthGate fallback={showAuth ? <AuthPage onBack={...} /> : <Landing />}>`

## Config

`src/auth-kit/auth.config.js` mein, ya `<AuthProvider config={{...}}>` se override:

| Key | Kaam |
|---|---|
| `brand.name`, `brand.logo` | Naam aur logo |
| `theme` | Colors (`"R G B"` format) |
| `features.signUp / google / forgotPassword / loginCode` | Features on/off |
| `minPasswordLength` | Password ki kam se kam length |
| `profile.table / sync` | Profile table ka naam, ya sync band |
| `routes.resetPassword / afterReset` | Reset link ka path aur uske baad redirect |
| `text.*` | Subtitles |

`/reset-password` route ke liye SPA fallback chahiye (Vite dev mein by default hai; production host par sab paths `index.html` par bhejo).

## Security note (zaroor padhein)

`features.loginCode` ek **email code step** hai, asli server-enforced 2FA nahi. Supabase par email-code login alag se bhi available hota hai, aur server par "password + code dono zaroori" ka rule nahi hai. Banking jaisi security chahiye to Supabase ka TOTP MFA (`supabase.auth.mfa`) use karo.

Is kit mein password check ke baad half-session turant local sign-out kar di jati hai, to app ko code verify hone se pehle user kabhi logged-in nahi dikhta.

## Structure

```
src/auth-kit/
  AuthProvider.jsx        session + useAuth()
  AuthGate.jsx            logged-in / logged-out switch
  AuthPage.jsx            sign in / up / forgot / code screens
  ResetPasswordPage.jsx
  AuthShell.jsx           card, brand, theme
  ui.jsx, auth.css        shared UI
  supabaseClient.js
  auth.config.js          <- edit this
supabase/setup.sql
```

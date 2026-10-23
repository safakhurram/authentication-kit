## Developer Integration Guide

Integrate Auth Kit into your existing React application to add authentication features without building the entire authentication flow from scratch.

### 1. Requirements

- Node.js and npm
- React application using Vite
- A Supabase project
- Tailwind CSS (for the Auth Kit styling)

### 2. Install Dependencies

Install the required packages in your existing project:

```bash
npm install @supabase/supabase-js lucide-react
```

Make sure your project has the dependencies required by Auth Kit. If any additional dependencies are used by the kit, install them as well.

### 3. Copy the Auth Kit

Copy the `src/auth-kit/` directory into your React project's `src/` directory.

Your project structure should look similar to this:

```text
my-app/
├── src/
│   ├── auth-kit/
│   │   ├── index.js
│   │   ├── AuthProvider.jsx
│   │   ├── AuthGate.jsx
│   │   └── ...
│   ├── App.jsx
│   └── main.jsx
├── .env
├── package.json
└── ...
```

The filenames inside `auth-kit/` may differ depending on the version you are using. Preserve the original directory structure when copying the files.

### 4. Configure Supabase

Create a `.env` file in your project's root directory:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLIC_KEY
```

Replace the example values with your Supabase Project URL and public client key.

Next, run the SQL script provided with Auth Kit:

1. Open your Supabase dashboard.
2. Navigate to **SQL Editor**.
3. Open `supabase/setup.sql` from the Auth Kit repository.
4. Paste the SQL into a new query and click **Run**.

Do not expose your Supabase service-role key in frontend code.

### 5. Configure Tailwind CSS

If your project uses Tailwind CSS and the Auth Kit relies on its custom color tokens, add the following under `theme.extend.colors` in `tailwind.config.js`:

```js
ak: {
  bg: 'rgb(var(--ak-bg) / <alpha-value>)',
  card: 'rgb(var(--ak-card) / <alpha-value>)',
  field: 'rgb(var(--ak-field) / <alpha-value>)',
  accent: 'rgb(var(--ak-accent) / <alpha-value>)',
},
```

Keep your existing Tailwind configuration and merge these values into it. Do not replace the entire configuration.

### 6. Wrap Your Application

Import the authentication components from the Auth Kit entry point:

```jsx
import { AuthProvider, AuthGate } from './auth-kit';

function MyApp({ user, signOut }) {
  return (
    <main>
      <h1>Welcome, {user.username || user.email}</h1>

      <button onClick={signOut}>
        Sign Out
      </button>

      {/* Render your existing application here */}
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider config={{ brand: { name: 'MyApp' } }}>
      <AuthGate>
        {({ user, signOut }) => (
          <MyApp user={user} signOut={signOut} />
        )}
      </AuthGate>
    </AuthProvider>
  );
}
```

Replace `MyApp` and the example content with your application's actual UI. Auth Kit should handle the authentication flow while your application renders its own content for authenticated users.

**Important:** Confirm the exported component names and import path against the version of Auth Kit you copied.

### 7. Access the Authenticated User

Inside a component rendered within `AuthProvider`, use the `useAuth()` hook:

```jsx
import { useAuth } from './auth-kit';

export default function Profile() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Username: {user?.username}</p>

      <button onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
}
```

Use optional chaining when user data may not be available yet.

### 8. Use an Existing Supabase Client (Optional)

If your application already has a Supabase client, reuse it instead of creating another client, provided Auth Kit supports client injection.

```jsx
import { setSupabaseClient } from './auth-kit';
import { supabase } from './lib/supabase';

setSupabaseClient(supabase);
```

Call `setSupabaseClient()` once during application initialization, before rendering the authentication components. Verify the exact export and initialization requirements in your Auth Kit version.

### 9. Google Login (Optional)

Google Login requires additional configuration outside the application code.

1. Create a Google OAuth client in Google Cloud Console.
2. Add the Supabase callback URL to the OAuth client's authorized redirect URIs.
3. Enable Google under **Supabase → Authentication → Sign In / Providers**.
4. Add the Google Client ID and Client Secret to Supabase.
5. Configure the application URLs under **Supabase → Authentication → URL Configuration**.
6. Enable the Google feature in the Auth Kit configuration.

Google Login will not work until the provider is configured correctly in Supabase.

### 10. Run and Test

Start your application:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

Test the following flows:

- Sign up and email verification
- Sign in with valid credentials
- Incorrect password and invalid verification code
- Sign out and sign back in
- Forgot password and password reset
- Session persistence after refresh
- Google Login, if enabled
- User profile synchronization, if enabled

If Vite uses a different port, update the Supabase Site URL and Redirect URLs to match the actual application URL.

### Integration Notes

- Keep the Auth Kit source files together when copying them into an existing project.
- Merge environment variables and Tailwind configuration instead of overwriting existing settings.
- Never commit real secrets or `.env` files to GitHub.
- Configure Supabase Row Level Security policies for any tables containing user data.
- Test the complete authentication flow with your own Supabase project before deploying to production.

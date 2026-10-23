import { AuthGate, AuthProvider } from './auth-kit';

// Demo: everything inside <AuthGate> is only visible to signed-in users.
// Replace <Dashboard /> with your real app.
function Dashboard({ user, signOut }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold">Welcome, {user.username} 👋</h1>
      <p className="text-gray-400">{user.email}</p>
      <button onClick={signOut} className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5">
        Sign out
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>{({ user, signOut }) => <Dashboard user={user} signOut={signOut} />}</AuthGate>
    </AuthProvider>
  );
}

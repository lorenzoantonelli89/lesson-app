import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function LoginGoogle() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session) {
      // User is already logged in, redirect to dashboard
      router.push('/dashboard');
      return;
    }

    if (status === 'unauthenticated') {
      // User is not logged in, proceed with Google sign in
      handleGoogleSignIn();
    }
  }, [session, status, router]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Accesso in corso...</p>
        </div>
      </div>
    );
  }

  // This should not be reached, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Accesso con Google
        </h1>
        <p className="text-gray-600 mb-4">
          Reindirizzamento a Google...
        </p>
        <button
          onClick={handleGoogleSignIn}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Accedi con Google
        </button>
      </div>
    </div>
  );
} 
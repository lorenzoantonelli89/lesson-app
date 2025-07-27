import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function RegisterGoogle() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session) {
      // User is already logged in, check if they need to complete profile
      if (session.user.isNewUser) {
        router.push('/auth/select-role');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    if (status === 'unauthenticated') {
      // User is not logged in, proceed with Google sign in for registration
      handleGoogleSignIn();
    }
  }, [session, status, router]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/auth/select-role' });
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Registrazione in corso...</p>
        </div>
      </div>
    );
  }

  // This should not be reached, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Registrazione con Google
        </h1>
        <p className="text-gray-600 mb-4">
          Reindirizzamento a Google...
        </p>
        <button
          onClick={handleGoogleSignIn}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Registrati con Google
        </button>
      </div>
    </div>
  );
} 
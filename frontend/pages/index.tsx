import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      // Check if user has a defined role
      if (session.user.role && session.user.role !== 'TO_BE_DEFINED') {
        // User has a defined role, check if profile is complete
        if (session.user.role === 'MASTER') {
          if (!session.user.hasProfile) {
            router.push('/auth/complete-profile?role=MASTER');
          } else {
            router.push('/dashboard/master');
          }
        } else if (session.user.role === 'STUDENT') {
          if (!session.user.hasProfile) {
            router.push('/auth/complete-profile?role=STUDENT');
          } else {
            router.push('/dashboard/student');
          }
        }
        return;
      }

      // User doesn't have a defined role yet
      if (session.user.isNewUser) {
        router.push('/auth/select-role');
        return;
      }

      // Fallback
      router.push('/auth/select-role');
    }
  }, [session, router]);

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Piattaforma di Coaching Sportivo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connetti maestri e studenti per lezioni di sport
          </p>

          {session ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Benvenuto, {session.user.name || session.user.email}!
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Vai alla Dashboard
                </button>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleSignIn}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mx-auto"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Accedi o Registrati
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
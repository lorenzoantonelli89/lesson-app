import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      // Redirect based on user role
      if (session.user.role === 'MASTER') {
        router.push('/dashboard/master');
      } else if (session.user.role === 'STUDENT') {
        router.push('/dashboard/student');
      } else if (session.user.role === 'TO_BE_DEFINED') {
        // Redirect to role selection if role is not defined
        router.push('/auth/select-role');
      } else {
        // Fallback for unknown roles
        router.push('/');
      }
    }
  }, [session, status, router]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // This should not be reached, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Reindirizzamento...
        </h1>
        <p className="text-gray-600">
          Ti stiamo portando alla tua dashboard.
        </p>
      </div>
    </div>
  );
} 
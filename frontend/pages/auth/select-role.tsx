import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { User, GraduationCap } from 'lucide-react';

export default function SelectRole() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'MASTER' | 'STUDENT' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  // Redirect if user already has a defined role
  if (session?.user?.role && session.user.role !== 'TO_BE_DEFINED') {
    if (session.user.role === 'MASTER') {
      router.push('/dashboard/master');
    } else if (session.user.role === 'STUDENT') {
      router.push('/dashboard/student');
    }
    return null;
  }

  const handleRoleSelection = async (role: 'MASTER' | 'STUDENT') => {
    setSelectedRole(role);
    setIsLoading(true);

    try {
      // Update user role in database
      const response = await fetch('/api/users/update-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        // Force a page reload to refresh the session
        window.location.href = `/auth/complete-profile?role=${role}`;
      } else {
        console.error('Error updating role');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Benvenuto, {session?.user?.name}!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Seleziona il tuo ruolo per iniziare
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {/* Master Option */}
          <button
            onClick={() => handleRoleSelection('MASTER')}
            disabled={isLoading}
            className={`w-full flex items-center p-6 border-2 rounded-lg transition-all duration-200 ${
              selectedRole === 'MASTER'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-medium text-gray-900">Sono un Maestro</h3>
                <p className="text-sm text-gray-600">
                  Offro lezioni e corsi di sport
                </p>
              </div>
            </div>
          </button>

          {/* Student Option */}
          <button
            onClick={() => handleRoleSelection('STUDENT')}
            disabled={isLoading}
            className={`w-full flex items-center p-6 border-2 rounded-lg transition-all duration-200 ${
              selectedRole === 'STUDENT'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-medium text-gray-900">Sono uno Studente</h3>
                <p className="text-sm text-gray-600">
                  Cerco lezioni e corsi di sport
                </p>
              </div>
            </div>
          </button>
        </div>

        {isLoading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Configurando il tuo profilo...</p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            ← Torna alla home
          </button>
        </div>
      </div>
    </div>
  );
} 
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function SignOut() {
  const router = useRouter();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Conferma logout
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sei sicuro di voler uscire?
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex space-x-4">
            <button
              onClick={handleSignOut}
              className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sì, esci
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
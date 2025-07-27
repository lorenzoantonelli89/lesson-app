import { useRouter } from 'next/router';

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'Configuration':
        return 'Errore di configurazione del server.';
      case 'AccessDenied':
        return 'Accesso negato.';
      case 'Verification':
        return 'Il link di verifica non è più valido.';
      default:
        return 'Si è verificato un errore durante l\'autenticazione.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Errore di Autenticazione
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getErrorMessage(error as string)}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <button
              onClick={() => router.push('/auth/signin')}
              className="text-blue-600 hover:text-blue-500"
            >
              Riprova
            </button>
          </div>
          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-500"
            >
              ← Torna alla home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
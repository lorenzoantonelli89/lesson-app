import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { GraduationCap, User, Save } from 'lucide-react';

interface MasterProfile {
  bio: string;
  specialties: string[];
  hourlyRate: number;
  availability: string;
  location: string;
  phoneNumber: string;
}

interface StudentProfile {
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  goals: string[];
  preferredSports: string[];
  medicalInfo: string;
}

export default function CompleteProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { role } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

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

  // Redirect if user already has a complete profile
  if (session?.user?.hasProfile) {
    if (session.user.role === 'MASTER') {
      router.push('/dashboard/master');
    } else if (session.user.role === 'STUDENT') {
      router.push('/dashboard/student');
    }
    return null;
  }

  if (!role || !['MASTER', 'STUDENT'].includes(role as string)) {
    router.push('/auth/select-role');
    return null;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/users/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          profile: formData
        }),
      });

      if (response.ok) {
        // Force a page reload to refresh the session
        window.location.href = `/dashboard/${(role as string).toLowerCase()}`;
      } else {
        console.error('Error completing profile');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const isMaster = role === 'MASTER';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {isMaster ? (
                <GraduationCap className="h-12 w-12 text-blue-600" />
              ) : (
                <User className="h-12 w-12 text-green-600" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Completa il tuo profilo
            </h2>
            <p className="text-gray-600 mt-2">
              {isMaster ? 'Configura il tuo profilo da maestro' : 'Configura il tuo profilo da studente'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isMaster ? (
              // Master Profile Form
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrivi la tua esperienza e specialità..."
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialità
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="es. Tennis, Calcio, Nuoto"
                    value={formData.specialties || ''}
                    onChange={(e) => handleInputChange('specialties', e.target.value.split(',').map(s => s.trim()))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tariffa oraria (€)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.hourlyRate || ''}
                      onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefono
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilità
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="es. Lunedì-Venerdì 9:00-18:00"
                    value={formData.availability || ''}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Località
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="es. Milano, Centro Sportivo"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              </>
            ) : (
              // Student Profile Form
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Livello di abilità
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.skillLevel || 'BEGINNER'}
                    onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                  >
                    <option value="BEGINNER">Principiante</option>
                    <option value="INTERMEDIATE">Intermedio</option>
                    <option value="ADVANCED">Avanzato</option>
                    <option value="EXPERT">Esperto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Obiettivi
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrivi i tuoi obiettivi sportivi..."
                    value={formData.goals || ''}
                    onChange={(e) => handleInputChange('goals', [e.target.value])}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sport preferiti
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="es. Tennis, Calcio, Nuoto"
                    value={formData.preferredSports || ''}
                    onChange={(e) => handleInputChange('preferredSports', e.target.value.split(',').map(s => s.trim()))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Informazioni mediche
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Allergie, condizioni mediche, ecc. (opzionale)"
                    value={formData.medicalInfo || ''}
                    onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => router.push('/auth/select-role')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Indietro
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Completa Profilo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
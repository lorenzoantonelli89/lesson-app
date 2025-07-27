import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Save, ArrowLeft, User, GraduationCap } from 'lucide-react';

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

export default function EditProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentProfile, setCurrentProfile] = useState<MasterProfile | StudentProfile | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadCurrentProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        setCurrentProfile(data.profile);
        setFormData(data.profile || {});
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      loadCurrentProfile();
    }
  }, [session, status]);

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
      const response = await fetch('/api/users/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: session?.user?.role,
          profile: formData
        }),
      });

      if (response.ok) {
        // Redirect back to dashboard
        router.push(`/dashboard/${session?.user?.role?.toLowerCase()}`);
      } else {
        console.error('Error updating profile');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

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

  const isMaster = session?.user?.role === 'MASTER';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                {isMaster ? (
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                ) : (
                  <User className="h-8 w-8 text-green-600" />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Modifica Profilo
                  </h2>
                  <p className="text-gray-600">
                    {isMaster ? 'Aggiorna i tuoi dati da maestro' : 'Aggiorna i tuoi dati da studente'}
                  </p>
                </div>
              </div>
            </div>
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
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+39 123 456 7890"
                      value={formData.phoneNumber || ''}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilità
                  </label>
                  <textarea
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descrivi la tua disponibilità oraria..."
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
                    placeholder="es. Milano, Roma, Napoli"
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
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Annulla
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
                    Salva Modifiche
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
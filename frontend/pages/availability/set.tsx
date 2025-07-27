import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Clock, Calendar, Save, ArrowLeft, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Availability {
  id: string;
  masterId: string;
  timeSlots: TimeSlot[];
  notes: string;
}

export default function SetAvailability() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [availability, setAvailability] = useState<Availability>({
    id: '',
    masterId: '',
    timeSlots: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    show: boolean;
  } | null>(null);

  const daysOfWeek = [
    { id: 0, name: 'Domenica', short: 'Dom' },
    { id: 1, name: 'Lunedì', short: 'Lun' },
    { id: 2, name: 'Martedì', short: 'Mar' },
    { id: 3, name: 'Mercoledì', short: 'Mer' },
    { id: 4, name: 'Giovedì', short: 'Gio' },
    { id: 5, name: 'Venerdì', short: 'Ven' },
    { id: 6, name: 'Sabato', short: 'Sab' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30'
  ];

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'MASTER') {
      fetchAvailability();
    }
  }, [status, session]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/masters/availability');
      if (response.ok) {
        const data = await response.json();
        if (data.availability) {
          setAvailability(data.availability);
        } else {
          // Initialize with default slots
          const defaultSlots = daysOfWeek.map(day => ({
            id: `slot-${day.id}`,
            dayOfWeek: day.id,
            startTime: '09:00',
            endTime: '18:00',
            isActive: false
          }));
          setAvailability({
            id: '',
            masterId: session?.user?.id || '',
            timeSlots: defaultSlots,
            notes: ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => setNotification(null), 5000);
  };

  const validateTimeSlots = (slots: TimeSlot[]): boolean => {
    for (const slot of slots) {
      if (typeof slot.dayOfWeek !== 'number' || slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
        showNotification('error', 'Ogni slot deve avere un giorno della settimana valido (0-6)');
        return false;
      }
      
      if (slot.isActive) {
        if (!slot.startTime || !slot.endTime) {
          showNotification('error', 'Gli slot attivi devono avere orario di inizio e fine');
          return false;
        }
        
        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
          showNotification('error', 'Il formato dell\'orario deve essere HH:MM');
          return false;
        }
        
        // Validate that end time is after start time
        const startMinutes = parseInt(slot.startTime.split(':')[0]) * 60 + parseInt(slot.startTime.split(':')[1]);
        const endMinutes = parseInt(slot.endTime.split(':')[0]) * 60 + parseInt(slot.endTime.split(':')[1]);
        
        if (endMinutes <= startMinutes) {
          showNotification('error', 'L\'orario di fine deve essere successivo all\'orario di inizio');
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    // Debug: log what we're about to send
    console.log('=== SAVING AVAILABILITY DEBUG ===');
    console.log('Availability to send:', JSON.stringify(availability, null, 2));
    console.log('TimeSlots:', availability.timeSlots);
    console.log('TimeSlots length:', availability.timeSlots.length);
    
    // Validate data before sending
    if (!validateTimeSlots(availability.timeSlots)) {
      console.log('❌ Validation failed');
      return;
    }
    
    console.log('✅ Validation passed');

    setSaving(true);
    try {
      // Send only timeSlots and notes as expected by the API
      const payload = {
        timeSlots: availability.timeSlots,
        notes: availability.notes
      };
      
      console.log('Sending payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch('/api/masters/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showNotification('success', 'Disponibilità salvata con successo!');
        setTimeout(() => router.push('/appointments/calendar'), 1500);
      } else {
        const error = await response.json();
        console.log('❌ API Error:', error);
        showNotification('error', error.message || 'Errore durante il salvataggio');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      showNotification('error', 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayId: number) => {
    setAvailability(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map(slot => 
        slot.dayOfWeek === dayId 
          ? { ...slot, isActive: !slot.isActive }
          : slot
      )
    }));
  };

  const updateTimeSlot = (dayId: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map(slot => 
        slot.dayOfWeek === dayId 
          ? { ...slot, [field]: value }
          : slot
      )
    }));
  };

  const getDaySlots = (dayId: number) => {
    return availability.timeSlots.find(slot => slot.dayOfWeek === dayId);
  };

  // Redirect if not authenticated or not master
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

  if (session?.user?.role !== 'MASTER') {
    router.push('/dashboard');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-start">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/appointments/calendar')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Imposta Disponibilità
                </h1>
                <p className="text-gray-600">
                  Definisci i tuoi orari di disponibilità
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salva Disponibilità'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Come funziona
              </h3>
              <p className="text-sm text-blue-800">
                Seleziona i giorni in cui sei disponibile e imposta gli orari di inizio e fine. 
                Gli studenti potranno prenotare solo negli slot che hai definito come disponibili.
              </p>
            </div>
          </div>
        </div>

        {/* Availability Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Orari di Disponibilità
            </h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {daysOfWeek.map((day) => {
                const daySlots = getDaySlots(day.id);
                const isActive = daySlots?.isActive || false;
                
                return (
                  <div
                    key={day.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      isActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => toggleDay(day.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="text-lg font-medium text-gray-900">
                          {day.name}
                        </label>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isActive 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isActive ? 'Disponibile' : 'Non disponibile'}
                      </div>
                    </div>

                    {isActive && daySlots && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Orario di inizio
                          </label>
                          <select
                            value={daySlots.startTime}
                            onChange={(e) => updateTimeSlot(day.id, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Orario di fine
                          </label>
                          <select
                            value={daySlots.endTime}
                            onChange={(e) => updateTimeSlot(day.id, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Note aggiuntive
            </h2>
          </div>
          
          <div className="p-6">
            <textarea
              value={availability.notes}
              onChange={(e) => setAvailability(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              placeholder="Aggiungi note sulla tua disponibilità (es. pause pranzo, giorni di riposo, ecc.)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Azioni Rapide
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  const newSlots = availability.timeSlots.map(slot => ({
                    ...slot,
                    isActive: slot.dayOfWeek >= 1 && slot.dayOfWeek <= 5, // Lunedì-Venerdì
                    startTime: '09:00',
                    endTime: '18:00'
                  }));
                  setAvailability(prev => ({ ...prev, timeSlots: newSlots }));
                }}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <span className="font-medium text-gray-900">Lunedì-Venerdì</span>
                  <p className="text-sm text-gray-600 mt-1">09:00-18:00</p>
                </div>
              </button>

              <button
                onClick={() => {
                  const newSlots = availability.timeSlots.map(slot => ({
                    ...slot,
                    isActive: slot.dayOfWeek >= 1 && slot.dayOfWeek <= 6, // Lunedì-Sabato
                    startTime: '08:00',
                    endTime: '20:00'
                  }));
                  setAvailability(prev => ({ ...prev, timeSlots: newSlots }));
                }}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <span className="font-medium text-gray-900">Lunedì-Sabato</span>
                  <p className="text-sm text-gray-600 mt-1">08:00-20:00</p>
                </div>
              </button>

              <button
                onClick={() => {
                  const newSlots = availability.timeSlots.map(slot => ({
                    ...slot,
                    isActive: false,
                    startTime: '09:00',
                    endTime: '18:00'
                  }));
                  setAvailability(prev => ({ ...prev, timeSlots: newSlots }));
                }}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-center">
                  <X className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <span className="font-medium text-gray-900">Non disponibile</span>
                  <p className="text-sm text-gray-600 mt-1">Disattiva tutto</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
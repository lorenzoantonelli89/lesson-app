import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { MapPin, Star, Clock, DollarSign, Phone, Mail, Calendar, User, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface Master {
  id: string;
  name: string;
  email: string;
  averageRating: number;
  totalReviews: number;
  isAvailable: boolean;
  masterProfile: {
    bio: string;
    specialties: string[];
    hourlyRate: number;
    location: string;
    phoneNumber: string;
    availability: string;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
  booked: boolean;
}

export default function MasterProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [master, setMaster] = useState<Master | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingForm, setBookingForm] = useState({ duration: 60, notes: '' });
  const [booking, setBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchMasterProfile = async () => {
    try {
      const response = await fetch(`/api/masters/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMaster(data.master);
      } else {
        setErrorMessage('Errore nel caricamento del profilo maestro');
        setShowError(true);
      }
    } catch (error) {
      console.error('Error fetching master:', error);
      setErrorMessage('Errore nel caricamento del profilo maestro');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'STUDENT' && id) {
      fetchMasterProfile();
    }
  }, [id, status, session?.user?.role]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setErrorMessage('Seleziona data e orario');
      setShowError(true);
      return;
    }

    setBooking(true);
    try {
      // Send date and time separately to avoid timezone issues
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          masterId: id,
          date: selectedDate,
          time: selectedTime,
          duration: bookingForm.duration,
          notes: bookingForm.notes,
          price: master?.masterProfile?.hourlyRate ? master.masterProfile.hourlyRate * (bookingForm.duration / 60) : 0
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShowSuccess(true);
        setTimeout(() => {
          router.push(`/appointments/${data.appointment.id}`);
        }, 2000);
      } else {
        const error = await response.json();
        setErrorMessage(error.message || 'Errore durante la prenotazione');
        setShowError(true);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrorMessage('Errore durante la prenotazione');
      setShowError(true);
    } finally {
      setBooking(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };

  const getAvailableTimeSlots = async (date: string): Promise<TimeSlot[]> => {
    if (!date || !id) return [];
    
    try {
      const response = await fetch(`/api/masters/availability-public?date=${date}&masterId=${id}`);
      if (response.ok) {
        const data = await response.json();
        return data.availability.timeSlots || [];
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
    
    // Fallback to default slots if API fails
    const slots: TimeSlot[] = [];
    const selectedDateObj = new Date(date);
    const dayOfWeek = selectedDateObj.getDay();
    
    // Generate time slots from 8:00 to 20:00
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // For demo purposes, make slots available on weekdays
        const isAvailable = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
        const isBooked = false; // In real implementation, check against existing appointments
        
        slots.push({
          time,
          available: isAvailable,
          booked: isBooked
        });
      }
    }
    
    return slots;
  };

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (selectedDate && id) {
      getAvailableTimeSlots(selectedDate).then(slots => {
        setTimeSlots(slots);
      });
    }
  }, [selectedDate, id]);

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from now
    return maxDate.toISOString().split('T')[0];
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

  if (session?.user?.role !== 'STUDENT') {
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

  if (!master) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Maestro non trovato</h2>
          <p className="text-gray-600">Il maestro che stai cercando non esiste o non è più disponibile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success/Error Notifications */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Prenotazione effettuata con successo! Reindirizzamento...
        </div>
      )}

      {showError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <XCircle className="h-5 w-5 mr-2" />
          {errorMessage}
          <button 
            onClick={() => setShowError(false)}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/masters/search')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Profilo Maestro
                </h1>
                <p className="text-gray-600">
                  Prenota una lezione con {master.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Master Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                    {master.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{master.name}</h2>
                    <div className="flex items-center mt-1">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="text-gray-600">{master.averageRating} ({master.totalReviews} recensioni)</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">€{master.masterProfile.hourlyRate}/h</p>
                  <p className="text-sm text-gray-600">Tariffa oraria</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Località</p>
                    <p className="font-medium">{master.masterProfile.location}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Telefono</p>
                    <p className="font-medium">{master.masterProfile.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{master.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Disponibilità</p>
                    <p className="font-medium">{master.isAvailable ? 'Disponibile' : 'Non disponibile'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Biografia</h3>
                <p className="text-gray-700">{master.masterProfile.bio}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialità</h3>
                <div className="flex flex-wrap gap-2">
                  {master.masterProfile.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Seleziona Data e Orario
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedDate && (
                    <div className="mt-2 text-sm">
                      {(() => {
                        const selectedDateObj = new Date(selectedDate);
                        const dayOfWeek = selectedDateObj.getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        
                        if (isWeekend) {
                          return (
                            <div className="flex items-center text-orange-600">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>Maestro non disponibile nei weekend</span>
                            </div>
                          );
                        }
                        
                        const availableSlots = timeSlots.filter(slot => slot.available && !slot.booked).length;
                        const totalSlots = timeSlots.length;
                        
                        return (
                          <div className="flex items-center text-green-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{availableSlots} slot disponibili su {totalSlots}</span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durata
                  </label>
                  <select
                    value={bookingForm.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={30}>30 minuti</option>
                    <option value={60}>1 ora</option>
                    <option value={90}>1 ora e 30 minuti</option>
                    <option value={120}>2 ore</option>
                  </select>
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orario
                  </label>
                  <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.available || slot.booked}
                        className={`p-2 text-sm rounded-md transition-colors ${
                          selectedTime === slot.time
                            ? 'bg-blue-600 text-white'
                            : slot.available && !slot.booked
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : slot.booked
                            ? 'bg-red-100 text-red-800 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                        title={
                          slot.booked 
                            ? 'Orario già prenotato' 
                            : !slot.available 
                            ? 'Maestro non disponibile in questo orario'
                            : 'Orario disponibile'
                        }
                      >
                        {slot.time}
                        {slot.booked && (
                          <span className="ml-1 text-xs">🔒</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (opzionale)
                </label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  placeholder="Aggiungi note per il maestro..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Riepilogo Prenotazione
              </h3>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-2">Prezzo</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{((master.masterProfile.hourlyRate * bookingForm.duration) / 60).toFixed(2)}
                  </p>
                </div>

                {selectedDate && selectedTime && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Data</p>
                      <p className="font-medium">{new Date(selectedDate).toLocaleDateString('it-IT')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Orario</p>
                      <p className="font-medium">{selectedTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Durata</p>
                      <p className="font-medium">{bookingForm.duration} minuti</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBookingSubmit}
                  disabled={booking || !selectedDate || !selectedTime}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {booking ? 'Prenotando...' : 'Prenota Lezione'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
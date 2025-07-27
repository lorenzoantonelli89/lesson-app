import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ArrowLeft, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';

interface Appointment {
  id: string;
  date: string;
  duration: number;
  status: string;
  price: number;
  notes: string;
  master?: {
    id: string;
    name: string;
    email: string;
    masterProfile: {
      specialties: string[];
      hourlyRate: number;
      location: string;
      phoneNumber: string;
    };
  };
  student?: {
    id: string;
    name: string;
    email: string;
    studentProfile: {
      skillLevel: string;
      preferredSports: string[];
    };
  };
}

export default function AppointmentsList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAppointments();
    }
  }, [status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isStudent = session?.user?.role === 'STUDENT';
  const isMaster = session?.user?.role === 'MASTER';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push(isStudent ? '/dashboard/student' : '/dashboard/master')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  I Miei Appuntamenti
                </h1>
                <p className="text-gray-600">
                  {isStudent ? 'Le tue lezioni programmate' : 'Gestisci i tuoi appuntamenti'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isStudent && (
                <button
                  onClick={() => router.push('/masters/search')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Prenota Nuova Lezione
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Filtri</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tutti
              </button>
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'PENDING'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                In Attesa
              </button>
              <button
                onClick={() => setFilter('CONFIRMED')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'CONFIRMED'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Confermati
              </button>
              <button
                onClick={() => setFilter('CANCELLED')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === 'CANCELLED'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancellati
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessun appuntamento trovato
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Non hai ancora nessun appuntamento'
                  : `Non hai appuntamenti con stato "${filter}"`
                }
              </p>
              {isStudent && (
                <button
                  onClick={() => router.push('/masters/search')}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Prenota la tua prima lezione
                </button>
              )}
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      {getStatusIcon(appointment.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status === 'CONFIRMED' && 'Confermato'}
                        {appointment.status === 'PENDING' && 'In attesa'}
                        {appointment.status === 'CANCELLED' && 'Cancellato'}
                        {appointment.status === 'COMPLETED' && 'Completato'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Data</p>
                          <p className="font-medium">{formatDate(appointment.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Orario</p>
                          <p className="font-medium">{formatTime(appointment.date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">
                            {isStudent ? 'Maestro' : 'Studente'}
                          </p>
                          <p className="font-medium">
                            {isStudent 
                              ? appointment.master?.name 
                              : appointment.student?.name
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Luogo</p>
                          <p className="font-medium">
                            {isStudent 
                              ? appointment.master?.masterProfile.location
                              : 'Da definire'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-1">Note</p>
                        <p className="text-gray-900">{appointment.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-2 ml-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Prezzo</p>
                      <p className="text-lg font-bold text-gray-900">
                        €{appointment.price.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => router.push(`/appointments/${appointment.id}`)}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Dettagli
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 
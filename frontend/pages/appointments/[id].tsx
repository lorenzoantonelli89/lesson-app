import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ArrowLeft, CheckCircle, XCircle, AlertCircle, Mail, Phone } from 'lucide-react';

interface Appointment {
  id: string;
  date: string;
  duration: number;
  status: string;
  price: number;
  notes: string;
  master: {
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
  student: {
    id: string;
    name: string;
    email: string;
    studentProfile?: {
      skillLevel: string;
      preferredSports: string[];
    };
  };
}

export default function AppointmentDetails() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${id}`);
      if (response.ok) {
        const data = await response.json();
        setAppointment(data.appointment);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && id) {
      fetchAppointment();
    }
  }, [id, status]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!appointment) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setAppointment(data.appointment);
      } else {
        const error = await response.json();
        alert(error.message || 'Errore durante l\'aggiornamento');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Errore durante l\'aggiornamento');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;

    if (!confirm('Sei sicuro di voler cancellare questo appuntamento?')) {
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/student');
      } else {
        const error = await response.json();
        alert(error.message || 'Errore durante la cancellazione');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Errore durante la cancellazione');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PENDING':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'CANCELLED':
        return 'bg-red-500';
      case 'COMPLETED':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Appuntamento non trovato</h2>
          <p className="text-gray-600">L'appuntamento che stai cercando non esiste o non hai i permessi per visualizzarlo.</p>
        </div>
      </div>
    );
  }

  const isStudent = session?.user?.role === 'STUDENT';
  const isMaster = session?.user?.role === 'MASTER';
  const canModify = (isStudent && appointment.student.id === session?.user?.id) || 
                   (isMaster && appointment.master.id === session?.user?.id);

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
                  Dettagli Appuntamento
                </h1>
                <p className="text-gray-600">
                  {formatDate(appointment.date)} alle {formatTime(appointment.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(appointment.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status === 'CONFIRMED' && 'Confermato'}
                {appointment.status === 'PENDING' && 'In attesa'}
                {appointment.status === 'CANCELLED' && 'Cancellato'}
                {appointment.status === 'COMPLETED' && 'Completato'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointment Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informazioni Appuntamento
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Data e Ora</p>
                    <p className="font-medium">
                      {formatDate(appointment.date)} alle {formatTime(appointment.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Durata</p>
                    <p className="font-medium">{appointment.duration} minuti</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Luogo</p>
                    <p className="font-medium">{appointment.master.masterProfile.location}</p>
                  </div>
                </div>

                {appointment.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Note</p>
                    <p className="text-gray-900">{appointment.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* User Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isStudent ? 'Informazioni Maestro' : 'Informazioni Studente'}
              </h3>

              {isStudent ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-medium">{appointment.master.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{appointment.master.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Telefono</p>
                      <p className="font-medium">{appointment.master.masterProfile.phoneNumber}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Specialità</p>
                    <div className="flex flex-wrap gap-2">
                      {appointment.master.masterProfile.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Nome</p>
                      <p className="font-medium">{appointment.student.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{appointment.student.email}</p>
                    </div>
                  </div>

                  {appointment.student.studentProfile && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Livello</p>
                        <p className="font-medium">
                          {appointment.student.studentProfile.skillLevel || 'Non specificato'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Sport Preferiti</p>
                        <div className="flex flex-wrap gap-2">
                          {appointment.student.studentProfile.preferredSports && 
                           appointment.student.studentProfile.preferredSports.length > 0 ? (
                            appointment.student.studentProfile.preferredSports.map((sport, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                              >
                                {sport}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">Nessuno specificato</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Azioni
              </h3>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-2">Prezzo</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{appointment.price.toFixed(2)}
                  </p>
                </div>

                {canModify && appointment.status === 'PENDING' && isMaster && (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleStatusUpdate('CONFIRMED')}
                      disabled={updating}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Confermando...' : 'Conferma Appuntamento'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('CANCELLED')}
                      disabled={updating}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Rifiutando...' : 'Rifiuta Appuntamento'}
                    </button>
                  </div>
                )}

                {canModify && appointment.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    disabled={updating}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Completando...' : 'Segna come Completato'}
                  </button>
                )}

                {canModify && appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                  <button
                    onClick={handleCancel}
                    disabled={updating}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Cancellando...' : 'Cancella Appuntamento'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
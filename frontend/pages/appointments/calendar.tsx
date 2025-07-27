import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react';

interface Appointment {
  id: string;
  date: string;
  duration: number;
  status: string;
  price: number;
  notes: string;
  student: {
    id: string;
    name: string;
    email: string;
    studentProfile: {
      skillLevel: string;
      preferredSports: string[];
    };
  };
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

export default function MasterCalendar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

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
    if (status === 'authenticated' && session?.user?.role === 'MASTER') {
      fetchAppointments();
    }
  }, [currentDate, status, session?.user?.role]);

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confermato';
      case 'PENDING':
        return 'In attesa';
      case 'CANCELLED':
        return 'Cancellato';
      case 'COMPLETED':
        return 'Completato';
      default:
        return status;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const getMonthDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.toDateString() === currentDate.toDateString();
      });
      
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        appointments: dayAppointments
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = (date: Date): CalendarDay[] => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.toDateString() === currentDate.toDateString();
      });
      
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === new Date().toDateString(),
        appointments: dayAppointments
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const getNavigationFunction = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'month':
        return () => navigateMonth(direction);
      case 'week':
        return () => navigateWeek(direction);
      case 'day':
        return () => navigateDay(direction);
      default:
        return () => navigateMonth(direction);
    }
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case 'month':
        return currentDate.toLocaleDateString('it-IT', {
          month: 'long',
          year: 'numeric'
        });
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      case 'day':
        return currentDate.toLocaleDateString('it-IT', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      default:
        return '';
    }
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard/master')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Calendario Appuntamenti
                </h1>
                <p className="text-gray-600">
                  Gestisci le tue lezioni e disponibilità
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/availability/set')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Imposta Disponibilità
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Calendar Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={getNavigationFunction('prev')}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900">
                {getViewTitle()}
              </h2>
              
              <button
                onClick={getNavigationFunction('next')}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Mese
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Settimana
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Giorno
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow">
          {viewMode === 'month' && (
            <div className="p-6">
              {/* Week Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {getMonthDays(currentDate).map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border border-gray-200 ${
                      day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    } ${day.isToday ? 'text-blue-600' : ''}`}>
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {day.appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          onClick={() => router.push(`/appointments/${appointment.id}`)}
                          className={`p-1 rounded text-xs cursor-pointer transition-colors ${
                            getStatusColor(appointment.status)
                          } text-white hover:opacity-80`}
                        >
                          <div className="font-medium truncate">
                            {appointment.student.name}
                          </div>
                          <div className="text-xs opacity-90">
                            {formatTime(appointment.date)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="p-6">
              {/* Week Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {getWeekDays(currentDate).map((day) => (
                  <div key={day.date.toISOString()} className="text-center">
                    <div className="text-sm font-medium text-gray-500">
                      {day.date.toLocaleDateString('it-IT', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-bold ${
                      day.isToday ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day.date.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getWeekDays(currentDate).map((day) => (
                  <div
                    key={day.date.toISOString()}
                    className={`min-h-[200px] p-2 border border-gray-200 ${
                      day.isToday ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      {day.appointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          onClick={() => router.push(`/appointments/${appointment.id}`)}
                          className={`p-2 rounded text-xs cursor-pointer transition-colors ${
                            getStatusColor(appointment.status)
                          } text-white hover:opacity-80`}
                        >
                          <div className="font-medium truncate">
                            {appointment.student.name}
                          </div>
                          <div className="text-xs opacity-90">
                            {formatTime(appointment.date)} - {appointment.duration}min
                          </div>
                          <div className="text-xs opacity-90">
                            {getStatusText(appointment.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'day' && (
            <div className="p-6">
              <div className="space-y-4">
                {appointments
                  .filter(appointment => {
                    const appointmentDate = new Date(appointment.date);
                    return appointmentDate.toDateString() === currentDate.toDateString();
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() => router.push(`/appointments/${appointment.id}`)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        getStatusColor(appointment.status)
                      } text-white hover:opacity-80`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Clock className="h-5 w-5" />
                          <div>
                            <div className="font-medium">
                              {formatTime(appointment.date)} - {appointment.duration} minuti
                            </div>
                            <div className="text-sm opacity-90">
                              {appointment.student.name} - {appointment.student.studentProfile.skillLevel}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">€{appointment.price.toFixed(2)}</div>
                          <div className="text-sm opacity-90">
                            {getStatusText(appointment.status)}
                          </div>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="mt-2 text-sm opacity-90">
                          Note: {appointment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                
                {appointments.filter(appointment => {
                  const appointmentDate = new Date(appointment.date);
                  return appointmentDate.toDateString() === currentDate.toDateString();
                }).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nessun appuntamento per oggi</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
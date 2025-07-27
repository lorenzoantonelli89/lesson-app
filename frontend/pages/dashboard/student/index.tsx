import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  MessageSquare, 
  BookOpen, 
  LogOut,
  Clock,
  MapPin,
  User
} from 'lucide-react';

interface Appointment {
  id: string;
  date: string;
  masterName: string;
  sport: string;
  duration: number;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  location: string;
}

interface Master {
  id: string;
  name: string;
  sport: string;
  rating: number;
  hourlyRate: number;
  location: string;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recommendedMasters, setRecommendedMasters] = useState<Master[]>([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedLessons: 0,
    totalSpent: 0,
    thisMonthLessons: 0
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session && session.user.role !== 'STUDENT') {
      router.push('/dashboard');
      return;
    }

    // Load dashboard data
    loadDashboardData();
  }, [session, status, router]);

  const loadDashboardData = async () => {
    try {
      // In a real app, you would fetch this data from your API
      // For now, we'll use mock data
      setAppointments([
        {
          id: '1',
          date: '2024-01-15T10:00:00Z',
          masterName: 'Marco Rossi',
          sport: 'Tennis',
          duration: 60,
          status: 'CONFIRMED',
          location: 'Centro Sportivo Milano'
        },
        {
          id: '2',
          date: '2024-01-18T14:00:00Z',
          masterName: 'Laura Bianchi',
          sport: 'Nuoto',
          duration: 45,
          status: 'PENDING',
          location: 'Piscina Comunale'
        }
      ]);

      setRecommendedMasters([
        {
          id: '1',
          name: 'Marco Rossi',
          sport: 'Tennis',
          rating: 4.8,
          hourlyRate: 50,
          location: 'Milano'
        },
        {
          id: '2',
          name: 'Laura Bianchi',
          sport: 'Nuoto',
          rating: 4.9,
          hourlyRate: 40,
          location: 'Roma'
        }
      ]);

      setStats({
        totalAppointments: 15,
        completedLessons: 12,
        totalSpent: 750,
        thisMonthLessons: 3
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading') {
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Studente
              </h1>
              <p className="text-gray-600">
                Benvenuto, {session?.user?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/profile/edit')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                Modifica Profilo
              </button>
              <button
                onClick={() => router.push('/masters/search')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                Trova Maestro
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Appuntamenti Totali</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lezioni Completate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedLessons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Speso Totalmente</p>
                <p className="text-2xl font-bold text-gray-900">€{stats.totalSpent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Questo Mese</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonthLessons}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/masters/search')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <Search className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trova Maestro</h3>
            <p className="text-gray-600">Cerca e prenota lezioni con maestri esperti</p>
          </button>

          <button
            onClick={() => router.push('/appointments')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <Calendar className="h-8 w-8 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">I Miei Appuntamenti</h3>
            <p className="text-gray-600">Gestisci le tue lezioni programmate</p>
          </button>

          <button
            onClick={() => router.push('/messages')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <MessageSquare className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Messaggi</h3>
            <p className="text-gray-600">Comunica con i tuoi maestri</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Appointments */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Appuntamenti Recenti</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Maestro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sport
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(appointment.date).toLocaleDateString('it-IT')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.masterName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.sport}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status === 'CONFIRMED' ? 'Confermato' : 
                           appointment.status === 'PENDING' ? 'In Attesa' : 'Cancellato'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Masters */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Maestri Consigliati</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recommendedMasters.map((master) => (
                  <div key={master.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{master.name}</h3>
                        <p className="text-sm text-gray-600">{master.sport}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-gray-600">{master.rating}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{master.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">€{master.hourlyRate}/h</p>
                      <button
                        onClick={() => router.push(`/masters/${master.id}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Prenota
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
// import { Button } from "../components/ui/button";
// import { useNavigate } from "react-router-dom";

// export default function Dashboard() {
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     try {
//       const refreshToken = localStorage.getItem("refreshToken");

//       // optional: notify backend
//       if (refreshToken) {
//         await fetch("http://localhost:5000/auth/logout", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ refreshToken }),
//         });
//       }
//     } catch (err) {
//       console.error("Logout error:", err);
//     } finally {
//       // clear tokens locally
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//       localStorage.removeItem("user");

//       // redirect to login
//       navigate("/", { replace: true });
//     }
//   };

//   return (
//     <div className="p-6 flex flex-col gap-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">Dashboard</h1>
//         <Button
//           onClick={handleLogout}
//           variant="secondary"
//           className="cursor-pointer"
//         >
//           Logout
//         </Button>
//       </div>

//       <p className="text-white">Welcome to your dashboard 🎉</p>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import {
  Clock,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  LogOut,
  Plus
} from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    user: { first_name: 'Jean', last_name: 'Dupont' },
    stats: {
      activeClients: 0,
      activeProjects: 0,
      totalInvoiced: 0,
      weekHours: 0
    },
    recentTasks: [],
    recentInvoices: [],
    timeEntries: {}
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Get current date range (this week)
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const formatDate = (date) => date.toISOString().split('T')[0];

      // Fetch all data in parallel
      const [clientsRes, projectsRes, invoicesRes, timeRes, tasksRes] = await Promise.all([
        fetch('http://localhost:5000/api/clients?limit=100', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/projects?limit=100', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/invoices/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://localhost:5000/api/time-entries/summary?start_date=${formatDate(startOfWeek)}&end_date=${formatDate(endOfWeek)}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/tasks?limit=10', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const clients = await clientsRes.json();
      const projects = await projectsRes.json();
      const invoiceStats = await invoicesRes.json();
      const timeSummary = await timeRes.json();
      const tasks = await tasksRes.json();

      // Get recent invoices
      const recentInvoicesRes = await fetch('http://localhost:5000/api/invoices?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const recentInvoices = await recentInvoicesRes.json();

      setDashboardData({
        user,
        stats: {
          activeClients: clients.data?.filter(c => !c.is_archived).length || 0,
          activeProjects: projects.data?.filter(p => p.status === 'actif').length || 0,
          totalInvoiced: invoiceStats.data?.total_paid || 0,
          weekHours: parseFloat(timeSummary.data?.total_hours || 0)
        },
        recentTasks: tasks.data?.slice(0, 5) || [],
        recentInvoices: recentInvoices.data || [],
        timeEntries: timeSummary.data || {}
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  const StatCard = ({ title, value, icon: Icon, subtitle }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
          {subtitle && (
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <div className="bg-blue-500/10 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
      </div>
    </div>
  );

  const TaskItem = ({ task }) => {
    const statusColors = {
      'à_faire': 'bg-gray-600 text-gray-200',
      'en_cours': 'bg-blue-600 text-blue-100',
      'terminé': 'bg-green-600 text-green-100'
    };

    const priorityIcons = {
      'basse': <CheckCircle className="w-4 h-4 text-gray-400" />,
      'moyenne': <AlertCircle className="w-4 h-4 text-yellow-400" />,
      'haute': <XCircle className="w-4 h-4 text-red-400" />
    };

    const statusLabels = {
      'à_faire': 'À faire',
      'en_cours': 'En cours',
      'terminé': 'Terminé'
    };

    return (
      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          {priorityIcons[task.priority]}
          <div className="flex-1">
            <p className="text-white font-medium text-sm">{task.title}</p>
            <p className="text-gray-400 text-xs mt-1">Projet: {task.project_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status]}`}>
            {statusLabels[task.status]}
          </span>
          {task.due_date && (
            <span className="text-gray-400 text-xs">{new Date(task.due_date).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    );
  };

  const InvoiceItem = ({ invoice }) => {
    const statusColors = {
      'brouillon': 'bg-gray-600 text-gray-200',
      'envoyée': 'bg-blue-600 text-blue-100',
      'payée': 'bg-green-600 text-green-100',
      'en_retard': 'bg-red-600 text-red-100'
    };

    const statusLabels = {
      'brouillon': 'Brouillon',
      'envoyée': 'Envoyée',
      'payée': 'Payée',
      'en_retard': 'En retard'
    };

    return (
      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex-1">
          <p className="text-white font-medium text-sm">{invoice.number}</p>
          <p className="text-gray-400 text-xs mt-1">{invoice.client_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[invoice.status]}`}>
            {statusLabels[invoice.status]}
          </span>
          <p className="text-white font-bold text-sm">{invoice.total_ttc.toFixed(2)} {invoice.currency}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">
                Bienvenue, {dashboardData.user?.first_name} {dashboardData.user?.last_name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Clients Actifs"
            value={dashboardData.stats.activeClients}
            icon={Users}
            subtitle="Total de clients"
          />
          <StatCard
            title="Projets Actifs"
            value={dashboardData.stats.activeProjects}
            icon={FileText}
            subtitle="En cours"
          />
          <StatCard
            title="Heures cette semaine"
            value={dashboardData.stats.weekHours}
            icon={Clock}
            subtitle={`${dashboardData.timeEntries.unbilled_hours || 0}h non facturées`}
          />
          <StatCard
            title="Total Facturé"
            value={`${dashboardData.stats.totalInvoiced.toFixed(0)} €`}
            icon={DollarSign}
            subtitle="Paiements reçus"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Tâches Récentes</h2>
              <button
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Voir tout →
              </button>
            </div>
            <div className="space-y-3">
              {dashboardData.recentTasks.length > 0 ? (
                dashboardData.recentTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">Aucune tâche récente</p>
              )}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Factures Récentes</h2>
              <button
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Voir tout →
              </button>
            </div>
            <div className="space-y-3">
              {dashboardData.recentInvoices.length > 0 ? (
                dashboardData.recentInvoices.map(invoice => (
                  <InvoiceItem key={invoice.id} invoice={invoice} />
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">Aucune facture récente</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              className="flex items-center justify-center gap-2 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouveau Client
            </button>
            <button
              className="flex items-center justify-center gap-2 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouveau Projet
            </button>
            <button
              className="flex items-center justify-center gap-2 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              <Clock className="w-5 h-5" />
              Démarrer Timer
            </button>
            <button
              className="flex items-center justify-center gap-2 p-4 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Facture
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

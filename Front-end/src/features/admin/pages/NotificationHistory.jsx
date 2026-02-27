import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Table from "../../../shared/components/Table";
import { listLogs } from "../../../services/logsService";
import { formatDate, formatDateTime } from "../../../shared/utils/dateUtils";
import { 
  BellIcon, 
  ClockIcon, 
  FunnelIcon, 
  ArrowPathIcon,
  EyeIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const NotificationHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await listLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    !filter || log.action.toLowerCase().includes(filter.toLowerCase()) || log.user.toLowerCase().includes(filter.toLowerCase())
  );

  const columns = [
    { 
      header: "Date & Heure", 
      key: "date",
      render: (val) => (
        <div className="flex flex-col">
          <span className="text-white font-medium">{formatDate(val)}</span>
          <span className="text-xs text-gray-500">{new Date(val).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    { 
      header: "Utilisateur", 
      key: "user",
      render: (val) => <span className="font-bold text-primary-400">{val}</span>
    },
    { header: "Action", key: "action" },
    { 
      header: "Type", 
      key: "type",
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          val === 'create' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
          val === 'delete' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
          val === 'update' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' :
          'bg-gray-500/10 text-gray-400 border border-gray-500/20'
        }`}>
          {val}
        </span>
      )
    },
    { 
      header: "Statut", 
      key: "status",
      render: () => (
        <div className="flex items-center text-accent-500">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          <span className="text-[10px] font-bold uppercase">Lu</span>
        </div>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, row) => (
        <Link 
          to={`/admin/notifications/${row.id}`}
          className="p-2 rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 border border-primary-500/20 transition-all inline-block"
        >
          <EyeIcon className="w-4 h-4" />
        </Link>
      )
    }
  ];

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-600/10 rounded-2xl border border-primary-500/20 shadow-lg shadow-primary-500/5">
              <BellIcon className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Historique des Notifications</h1>
              <p className="text-gray-400 mt-1 font-medium text-lg">Consultez l'activité passée du système</p>
            </div>
          </div>
          <button 
            onClick={loadLogs}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl border border-gray-700 transition-all shadow-xl font-bold uppercase tracking-widest text-xs"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="relative flex-1 max-w-md">
              <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input 
                type="text"
                placeholder="Filtrer l'historique..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-2xl text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
              />
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <span className="text-accent-500">{filteredLogs.length}</span>
              <span>Entrées trouvées</span>
            </div>
          </div>

          <Table 
            columns={columns} 
            data={filteredLogs} 
            loading={loading}
            emptyMessage="Aucun historique disponible"
          />
        </Card>
      </div>
    </Layout>
  );
};

export default NotificationHistory;

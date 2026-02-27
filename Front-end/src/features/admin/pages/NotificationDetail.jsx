import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import { getLog } from "../../../services/logsService";
import { 
  BellIcon, 
  ClockIcon, 
  UserIcon, 
  GlobeAltIcon, 
  InformationCircleIcon,
  ArrowLeftIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLog = async () => {
      try {
        setLoading(true);
        const data = await getLog(id);
        setLog(data);
      } catch (err) {
        setError("Impossible de charger les détails de la notification.");
      } finally {
        setLoading(false);
      }
    };
    loadLog();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Chargement des détails...</p>
        </div>
      </Layout>
    );
  }

  if (error || !log) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl inline-block mb-6">
            <InformationCircleIcon className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Erreur</h1>
          <p className="text-gray-400 mb-8">{error || "Notification introuvable."}</p>
          <Button variant="secondary" onClick={() => navigate(-1)}>Retour</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition-all"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Détails de la Notification</h1>
              <p className="text-gray-400 mt-1">Informations complètes sur l'événement système</p>
            </div>
          </div>
          <div className={`p-3 rounded-2xl border ${
            log.type === 'create' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
            log.type === 'delete' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
            log.type === 'update' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
            'bg-gray-500/10 border-gray-500/20 text-gray-400'
          }`}>
            <BellIcon className="h-8 w-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 border-gray-800/50">
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-blue-600/10 rounded-lg">
                  <InformationCircleIcon className="h-6 w-6 text-blue-500" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Description de l'Action</h2>
              </div>
              
              <div className="p-6 bg-gray-800/30 rounded-2xl border border-gray-700/30 mb-8">
                <p className="text-2xl font-black text-white leading-tight">
                  {log.action}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Détails Techniques</h3>
                <div className="p-6 bg-gray-950/50 rounded-2xl border border-gray-800 font-mono text-sm text-gray-400 leading-relaxed">
                  {log.details}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="p-6 border-gray-800/50">
              <h2 className="text-lg font-bold text-white mb-6 uppercase tracking-widest border-b border-gray-800 pb-4">Contexte</h2>
              <div className="space-y-6">
                <ContextItem 
                  icon={<UserIcon className="h-5 w-5" />} 
                  label="Utilisateur" 
                  value={log.user}
                  subValue={log.user_email}
                />
                <ContextItem 
                  icon={<ClockIcon className="h-5 w-5" />} 
                  label="Date & Heure" 
                  value={new Date(log.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  subValue={new Date(log.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                />
                <ContextItem 
                  icon={<GlobeAltIcon className="h-5 w-5" />} 
                  label="Adresse IP" 
                  value={log.ip}
                />
                <ContextItem 
                  icon={<ShieldCheckIcon className="h-5 w-5" />} 
                  label="Type d'Entité" 
                  value={log.type.toUpperCase()}
                  color={
                    log.type === 'create' ? 'text-green-500' :
                    log.type === 'delete' ? 'text-red-500' :
                    log.type === 'update' ? 'text-blue-500' :
                    'text-gray-400'
                  }
                />
              </div>
            </Card>

            <Card className="p-6 border-blue-500/10 bg-blue-500/5">
              <p className="text-xs text-gray-500 italic text-center">
                Ce log est généré automatiquement par le système d'audit et ne peut pas être modifié.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ContextItem = ({ icon, label, value, subValue, color = "text-white" }) => (
  <div className="flex items-start space-x-4">
    <div className="mt-1 p-2 bg-gray-800 rounded-xl text-gray-500 border border-gray-700/50">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-bold truncate ${color}`}>{value}</p>
      {subValue && <p className="text-xs text-gray-500 mt-0.5 truncate">{subValue}</p>}
    </div>
  </div>
);

export default NotificationDetail;

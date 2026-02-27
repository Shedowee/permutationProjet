import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import { fetchCommissionStats } from '../redux/commissionSlice';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const CommissionDashboard = () => {
  const dispatch = useDispatch();
  const stats = useSelector(state => state.commission.stats.data);
  const loading = useSelector(state => state.commission.stats.loading);
  const error = useSelector(state => state.commission.stats.error);

  useEffect(() => {
    dispatch(fetchCommissionStats());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCommissionStats());
  };

  if (loading && !stats) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="text-surface-400 font-medium uppercase tracking-widest text-xs">Chargement des statistiques...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-10 pb-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-surface-900 tracking-tight">Espace Commission</h1>
            <p className="text-surface-500 mt-1 font-medium">Supervision et traitement des demandes de permutation</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-surface-50 text-surface-700 rounded-2xl border border-surface-200 shadow-sm transition-all text-xs font-black uppercase tracking-widest group"
          >
            <ArrowPathIcon className={`w-4 h-4 transition-transform group-hover:rotate-180 duration-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6 flex items-center space-x-4 text-red-600 animate-fadeIn">
            <XCircleIcon className="h-8 w-8 shrink-0" />
            <p className="text-sm font-bold uppercase tracking-widest">Erreur: {error}</p>
          </div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard 
                title="Total Demandes" 
                value={stats.totalRequests} 
                icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
                color="indigo"
              />
              <StatCard 
                title="En Attente" 
                value={stats.pendingRequests} 
                icon={<ClockIcon className="w-6 h-6" />}
                color="amber"
              />
              <StatCard 
                title="Validées" 
                value={stats.validatedRequests} 
                icon={<CheckCircleIcon className="w-6 h-6" />}
                color="teal"
              />
              <StatCard 
                title="Refusées" 
                value={stats.rejectedRequests} 
                icon={<XCircleIcon className="w-6 h-6" />}
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="p-10 lg:col-span-1 flex flex-col items-center justify-center text-center space-y-6 rounded-[2.5rem] bg-white border-surface-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      className="text-surface-100"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="70"
                      cx="80"
                      cy="80"
                    />
                    <circle
                      className="text-primary-600 transition-all duration-1000 ease-out shadow-sm shadow-primary-500/50"
                      strokeWidth="10"
                      strokeDasharray={439.8}
                      strokeDashoffset={439.8 - (439.8 * stats.processingRate) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="70"
                      cx="80"
                      cy="80"
                    />
                  </svg>
                  <span className="absolute text-3xl font-black text-surface-900 tracking-tighter">{stats.processingRate}%</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-surface-900 uppercase tracking-widest">Taux de Traitement</h3>
                  <p className="text-xs text-surface-400 mt-2 font-bold uppercase tracking-[0.2em]">Progression globale</p>
                </div>
              </Card>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 rounded-[2.5rem] border-surface-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-primary-50 rounded-2xl border border-primary-100 group-hover:scale-110 transition-transform">
                      <BoltIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-sm font-black text-surface-900 uppercase tracking-widest">Performance</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-surface-900 tracking-tight">{stats.avgProcessingTime}</p>
                    <p className="text-[10px] text-surface-400 font-black uppercase tracking-[0.2em]">Temps moyen de réponse</p>
                  </div>
                  <div className="mt-10 pt-6 border-t border-surface-100 flex items-center justify-between">
                    <span className="text-[10px] text-surface-400 font-black uppercase tracking-widest">Dernière action</span>
                    <span className="text-[10px] text-primary-600 font-black px-3 py-1 bg-primary-50 border border-primary-100 rounded-lg uppercase tracking-widest">Il y a 24h</span>
                  </div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] border-surface-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-accent-50 rounded-2xl border border-accent-100 group-hover:scale-110 transition-transform">
                      <ChartBarIcon className="w-6 h-6 text-accent-600" />
                    </div>
                    <h3 className="text-sm font-black text-surface-900 uppercase tracking-widest">Activité</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-surface-900 tracking-tight truncate max-w-full" title={stats.lastProcessedRequest}>
                      {stats.lastProcessedRequest.length > 15 ? stats.lastProcessedRequest.substring(0, 15) + '...' : stats.lastProcessedRequest}
                    </p>
                    <p className="text-[10px] text-surface-400 font-black uppercase tracking-[0.2em]">Dernier dossier traité</p>
                  </div>
                  <div className="mt-10 pt-6 border-t border-surface-100 flex items-center justify-between">
                    <span className="text-[10px] text-surface-400 font-black uppercase tracking-widest">Statut global</span>
                    <span className="text-[10px] text-teal-600 font-black px-3 py-1 bg-teal-50 border border-teal-100 rounded-lg uppercase tracking-widest">OPÉRATIONNEL</span>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    indigo: 'bg-primary-50 text-primary-600 border-primary-100',
    teal: 'bg-accent-50 text-accent-600 border-accent-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <Card className={`p-8 border shadow-sm group hover:shadow-lg transition-all duration-500 rounded-[2.5rem] ${colorClasses[color] || colorClasses.indigo}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{title}</p>
          <h3 className="text-4xl font-black tracking-tight">{value}</h3>
        </div>
        <div className="p-4 rounded-2xl bg-white shadow-sm border border-black/5 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default CommissionDashboard;
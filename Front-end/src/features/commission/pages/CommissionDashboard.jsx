import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { fetchCommissionStats } from '../redux/commissionSlice';
import { motion } from 'framer-motion';
import { 
  ClipboardDocumentListIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  BoltIcon,
  CheckBadgeIcon
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
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin"></div>
          </div>
          <p className="text-surface-500 font-bold uppercase tracking-widest text-[10px]">Chargement des statistiques...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-12 pb-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-black text-surface-900 tracking-tight uppercase">Espace Commission</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="h-1 w-12 bg-primary-500 rounded-full"></span>
              <p className="text-surface-500 font-bold uppercase tracking-widest text-[10px]">Supervision et traitement des demandes</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              variant="outline"
              onClick={handleRefresh}
              icon={ArrowPathIcon}
              className={loading ? 'animate-spin' : ''}
            >
              Actualiser
            </Button>
          </motion.div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 text-red-700"
          >
            <XCircleIcon className="h-6 w-6 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Une erreur est survenue</p>
              <p className="text-sm font-bold mt-1 opacity-80">{error}</p>
            </div>
          </motion.div>
        )}

        {stats && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard 
                title="Total Demandes" 
                value={stats.totalRequests} 
                icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
                color="primary"
              />
              <StatCard 
                title="En Attente" 
                value={stats.pendingRequests} 
                icon={<ClockIcon className="w-6 h-6" />}
                color="accent"
              />
              <StatCard 
                title="Validées" 
                value={stats.validatedRequests} 
                icon={<CheckCircleIcon className="w-6 h-6" />}
                color="success"
              />
              <StatCard 
                title="Refusées" 
                value={stats.rejectedRequests} 
                icon={<XCircleIcon className="w-6 h-6" />}
                color="danger"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="p-10 lg:col-span-1 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-standard">
                  <ChartBarIcon className="w-32 h-32" />
                </div>
                
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      className="text-surface-100"
                      strokeWidth="12"
                      stroke="currentColor"
                      fill="transparent"
                      r="80"
                      cx="96"
                      cy="96"
                    />
                    <motion.circle
                      initial={{ strokeDashoffset: 502.6 }}
                      animate={{ strokeDashoffset: 502.6 - (502.6 * stats.processingRate) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-primary-500 shadow-primary"
                      strokeWidth="12"
                      strokeDasharray={502.6}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="80"
                      cx="96"
                      cy="96"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black text-surface-900 tracking-tighter">{stats.processingRate}%</span>
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Traité</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-surface-900 uppercase tracking-widest">Taux de Traitement</h3>
                  <p className="text-[10px] text-surface-400 mt-2 font-bold uppercase tracking-[0.2em]">Progression globale des dossiers</p>
                </div>
              </Card>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 group">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl border border-primary-100 group-hover:scale-110 transition-standard shadow-sm">
                      <BoltIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-[10px] font-black text-surface-900 uppercase tracking-[0.2em]">Performance</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-5xl font-black text-surface-900 tracking-tight">{stats.avgProcessingTime}</p>
                    <p className="text-[10px] text-surface-500 font-black uppercase tracking-widest leading-relaxed">Temps moyen de réponse</p>
                  </div>
                  <div className="mt-12 pt-8 border-t border-surface-50 flex items-center justify-between">
                    <span className="text-[10px] text-surface-400 font-black uppercase tracking-widest">Efficacité</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 4 ? 'bg-primary-500' : 'bg-surface-200'}`}></div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card variant="dark" className="p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-standard">
                    <CheckBadgeIcon className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="p-3 bg-white/10 text-primary-400 rounded-2xl border border-white/10 group-hover:scale-110 transition-standard shadow-lg">
                      <ChartBarIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Activité Récente</h3>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <p className="text-4xl font-black text-white tracking-tight truncate" title={stats.lastProcessedRequest}>
                      {stats.lastProcessedRequest}
                    </p>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-relaxed">Dernier dossier traité</p>
                  </div>
                  <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between relative z-10">
                    <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Statut global</span>
                    <span className="px-3 py-1.5 rounded-xl text-[9px] font-black bg-primary-500 text-white uppercase tracking-widest shadow-primary">
                      OPÉRATIONNEL
                    </span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorStyles = {
    primary: 'border-primary-100 bg-primary-50/10 text-primary-600',
    secondary: 'border-secondary-100 bg-secondary-50/10 text-secondary-600',
    success: 'border-green-100 bg-green-50/10 text-green-600',
    accent: 'border-amber-100 bg-amber-50/10 text-amber-600',
    danger: 'border-red-100 bg-red-50/10 text-red-600',
  };

  const iconStyles = {
    primary: 'bg-primary-500 text-white shadow-primary',
    secondary: 'bg-secondary-500 text-white shadow-secondary',
    success: 'bg-green-500 text-white shadow-soft',
    accent: 'bg-amber-500 text-white shadow-soft',
    danger: 'bg-red-500 text-white shadow-soft',
  };

  return (
    <Card className={`p-8 border-2 transition-standard ${colorStyles[color] || colorStyles.primary}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">{title}</p>
          <h3 className="text-4xl font-black tracking-tight text-surface-900">{value}</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 italic">Dossiers</p>
        </div>
        <div className={`p-4 rounded-2xl transition-standard group-hover:scale-110 ${iconStyles[color] || iconStyles.primary}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default CommissionDashboard;

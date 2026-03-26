import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/hooks/useAuth';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { fetchFormateurStats } from '../redux/formateurSlice';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CheckBadgeIcon, 
  XCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const FormateurDashboard = () => {
  const dispatch = useDispatch();
  const stats = useSelector(state => state.formateur.stats.data);
  const loading = useSelector(state => state.formateur.stats.loading);
  const error = useSelector(state => state.formateur.stats.error);
  const { role } = useAuth();

  useEffect(() => {
    dispatch(fetchFormateurStats());
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin"></div>
          </div>
          <p className="text-surface-500 font-bold uppercase tracking-widest text-[10px]">Chargement de votre espace personnel...</p>
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
            <h1 className="text-4xl font-black text-surface-900 tracking-tight uppercase">Mon Espace Personnel</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="h-1 w-12 bg-primary-500 rounded-full"></span>
              <p className="text-surface-500 font-bold uppercase tracking-widest text-[10px]">Suivi et gestion de vos demandes</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to={role === 'employe' ? '/employe/demandes/create' : '/formateur/demandes/create'}>
              <Button variant="primary" size="lg" icon={PlusIcon}>
                Nouvelle Demande
              </Button>
            </Link>
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
                title="Mes Demandes" 
                value={stats.totalRequests} 
                icon={<DocumentTextIcon className="w-6 h-6" />}
                color="primary"
              />
              <StatCard 
                title="En Attente" 
                value={stats.pendingRequests} 
                icon={<ClockIcon className="w-6 h-6" />}
                color="accent"
              />
              <StatCard 
                title="Acceptées" 
                value={stats.validatedRequests} 
                icon={<CheckBadgeIcon className="w-6 h-6" />}
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
              {/* Dernier Dossier */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-standard">
                    <DocumentTextIcon className="w-48 h-48" />
                  </div>
                  
                  <div className="relative z-10">
                    <h2 className="text-xs font-black text-surface-900 mb-10 flex items-center uppercase tracking-[0.2em] border-b border-surface-50 pb-6">
                      <InformationCircleIcon className="w-5 h-5 mr-3 text-primary-500" />
                      Dernière Demande Soumise
                    </h2>

                    {stats.lastRequestStatus ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                          <div>
                            <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-4">Statut Actuel</p>
                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black border uppercase tracking-widest inline-block ${
                              stats.lastRequestStatus === 'EN_ATTENTE' ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' :
                              stats.lastRequestStatus === 'VALIDE' ? 'bg-primary-50 text-primary-700 border-primary-200 shadow-sm' : 
                              'bg-red-50 text-red-700 border-red-200 shadow-sm'
                            }`}>
                              {stats.lastRequestStatus === 'EN_ATTENTE' ? 'EN ATTENTE' :
                               stats.lastRequestStatus === 'VALIDE' ? 'VALIDÉE' : 'REFUSÉE'}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-3">Date de Soumission</p>
                            <div className="flex items-center gap-3">
                              <CalendarDaysIcon className="w-5 h-5 text-primary-500" />
                              <p className="text-surface-900 font-black text-xl tracking-tight">{stats.lastRequestDate}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-8 bg-surface-50 rounded-2xl border border-surface-100 relative group/motif">
                          <div className="absolute top-4 right-4 text-primary-200 group-hover/motif:text-primary-500 transition-standard">
                            <SparklesIcon className="w-5 h-5" />
                          </div>
                          <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-4">Motif de la demande</p>
                          <p className="text-surface-700 italic text-sm font-bold leading-relaxed">"{stats.lastRequestMotif}"</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 text-center bg-surface-50 rounded-3xl border-2 border-dashed border-surface-100">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-soft flex items-center justify-center mx-auto mb-6">
                          <PlusIcon className="w-8 h-8 text-surface-200" />
                        </div>
                        <p className="text-surface-400 font-bold italic uppercase tracking-widest text-xs">Aucune demande soumise pour le moment.</p>
                        <Link to={role === 'employe' ? '/employe/demandes/create' : '/formateur/demandes/create'} className="mt-8 inline-block">
                          <Button variant="ghost" size="sm" icon={ArrowRightIcon}>
                            Créer ma première demande
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* KPIs Secondaires */}
              <div className="space-y-8">
                <Card variant="dark" className="p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-standard">
                    <CalendarDaysIcon className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="p-3 bg-white/10 text-primary-400 rounded-2xl border border-white/10 group-hover:scale-110 transition-standard shadow-lg">
                      <CalendarDaysIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Période Cible</h3>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <p className="text-3xl font-black text-white tracking-tight">{stats.lastRequestDates || "Aucune"}</p>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-relaxed">Dernière session</p>
                  </div>
                </Card>

                <Card className="p-8 group">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-secondary-50 text-secondary-600 rounded-2xl border border-secondary-100 group-hover:scale-110 transition-standard shadow-sm">
                      <ChartPieIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-[10px] font-black text-surface-900 uppercase tracking-[0.2em]">Réussite</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <p className="text-5xl font-black text-secondary-600 tracking-tighter">{stats.successRate}</p>
                      <p className="text-xl text-secondary-400 font-black">%</p>
                    </div>
                    <p className="text-[10px] text-surface-400 font-black uppercase tracking-widest leading-relaxed">Taux d'acceptation</p>
                  </div>
                  <div className="mt-10 w-full bg-surface-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.successRate}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-primary-500 h-full rounded-full shadow-primary" 
                    ></motion.div>
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

export default FormateurDashboard;

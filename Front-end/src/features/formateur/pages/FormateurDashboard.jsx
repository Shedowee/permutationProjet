import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import StatCard from '../../../shared/components/StatCard';
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
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchFormateurStats());
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-jb-bg-elevated border-t-jb-magenta animate-spin"></div>
          </div>
          <p className="text-jb-text-muted font-black uppercase tracking-widest text-[10px]">Chargement de votre espace personnel...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-12 pb-12 max-w-[1600px] mx-auto">
        <Card className="p-6 sm:p-8 bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary-600">Formateur</p>
              <h1 className="mt-3 text-4xl font-black text-jb-text-primary tracking-tight uppercase">Mon Espace Personnel</h1>
              <p className="mt-3 text-sm font-medium text-jb-text-muted leading-6">
                Suivi et gestion de vos demandes avec un accès direct aux actions principales.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="shrink-0"
            >
              <Link to="/formateur/demandes/create">
                <Button variant="primary" size="lg" icon={PlusIcon}>
                  Nouvelle Demande
                </Button>
              </Link>
            </motion.div>
          </div>
        </Card>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-red-500/15 bg-red-500/5 p-6 flex items-start gap-4 text-red-700"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                title="Mes Demandes" 
                value={stats.totalRequests} 
                subValue="Historique total"
                icon={<DocumentTextIcon className="w-6 h-6" />}
                color="primary"
                to="/formateur/demandes"
              />
              <StatCard 
                title="En Attente" 
                value={stats.pendingRequests} 
                subValue="En cours"
                icon={<ClockIcon className="w-6 h-6" />}
                color="accent"
                to="/formateur/demandes?etat=EN_ATTENTE"
              />
              <StatCard 
                title="Acceptées" 
                value={stats.validatedRequests} 
                subValue="Dossiers validés"
                icon={<CheckBadgeIcon className="w-6 h-6" />}
                color="success"
                to="/formateur/demandes?etat=VALIDE"
              />
              <StatCard 
                title="Refusées" 
                value={stats.rejectedRequests} 
                subValue="Dossiers rejetés"
                icon={<XCircleIcon className="w-6 h-6" />}
                color="danger"
                to="/formateur/demandes?etat=REFUSE"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Dernier Dossier */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="p-10 relative overflow-hidden group border border-white/70" onClick={() => navigate('/formateur/demandes')}>
                  <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-standard">
                    <DocumentTextIcon className="w-48 h-48" />
                  </div>
                  
                  <div className="relative z-10">
                    <h2 className="text-xs font-black text-jb-text-primary mb-10 flex items-center uppercase tracking-[0.2em] border-b border-white/70 pb-6">
                      <InformationCircleIcon className="w-5 h-5 mr-3 text-jb-magenta" />
                      Dernière Demande Soumise
                    </h2>

                    {stats.lastRequestStatus ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                          <div>
                            <p className="text-[10px] font-black text-jb-text-muted uppercase tracking-[0.2em] mb-4">Statut Actuel</p>
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
                            <p className="text-[10px] font-black text-jb-text-muted uppercase tracking-[0.2em] mb-3">Date de Soumission</p>
                            <div className="flex items-center gap-3">
                              <CalendarDaysIcon className="w-5 h-5 text-jb-magenta" />
                              <p className="text-jb-text-primary font-black text-xl tracking-tight">{stats.lastRequestDate}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-8 bg-jb-bg-section rounded-lg border border-white/70 relative group/motif">
                          <div className="absolute top-4 right-4 text-jb-magenta/20 group-hover/motif:text-jb-magenta transition-standard">
                            <SparklesIcon className="w-5 h-5" />
                          </div>
                          <p className="text-[10px] font-black text-jb-text-muted uppercase tracking-[0.2em] mb-4">Motif de la demande</p>
                          <p className="text-jb-text-secondary italic text-sm font-bold leading-relaxed">"{stats.lastRequestMotif}"</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-20 text-center bg-jb-bg-section rounded-lg border-2 border-dashed border-white/70">
                        <div className="w-16 h-16 bg-white rounded-lg shadow-soft flex items-center justify-center mx-auto mb-6 border border-jb-border">
                          <PlusIcon className="w-8 h-8 text-jb-text-muted" />
                        </div>
                        <p className="text-jb-text-muted font-black italic uppercase tracking-widest text-xs">Aucune demande soumise pour le moment.</p>
                        <Link to="/formateur/demandes/create" className="mt-8 inline-block">
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
                <Card variant="dark" noPadding onClick={() => navigate('/formateur/demandes')}>
                  <div className="p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-standard">
                      <CalendarDaysIcon className="w-32 h-32" />
                    </div>
                    <div className="flex items-center gap-4 mb-8 relative z-10">
                      <div className="p-3 bg-white/10 text-primary-400 rounded-lg border border-white/10 group-hover:scale-110 transition-standard shadow-lg">
                        <CalendarDaysIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Période Cible</h3>
                    </div>
                    <div className="space-y-2 relative z-10">
                      <p className="text-3xl font-black text-white tracking-tight">{stats.lastRequestLocation || "Aucune"}</p>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-widest leading-relaxed">Destination souhaitée</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 group border border-white/70" onClick={() => navigate('/formateur/demandes/create')}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-lg border border-white/70 group-hover:scale-110 transition-standard shadow-[0_18px_34px_-20px_rgba(15,159,181,0.24)]" style={{ background: 'linear-gradient(90deg, #2f7be5 0%, #0f9fb5 100%)', color: '#fff' }}>
                      <ChartPieIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-[10px] font-black text-jb-text-primary uppercase tracking-[0.2em]">Réussite</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <p className="text-5xl font-black text-jb-blue tracking-tighter">{stats.successRate}</p>
                      <p className="text-xl text-jb-text-muted font-black">%</p>
                    </div>
                    <p className="text-[10px] text-jb-text-muted font-black uppercase tracking-widest leading-relaxed">Taux d'acceptation</p>
                  </div>
                  <div className="mt-10 w-full bg-jb-bg-elevated rounded-full h-2.5 overflow-hidden border border-white/70">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.successRate}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full rounded-full shadow-primary" 
                      style={{ background: 'var(--jb-gradient-primary)' }}
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

export default FormateurDashboard;

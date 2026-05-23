import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import StatCard from '../../../shared/components/StatCard';
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
  CheckBadgeIcon,
  UserIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const CommissionDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stats = useSelector(state => state.commission.stats.data);
  const loading = useSelector(state => state.commission.stats.loading);
  const error = useSelector(state => state.commission.stats.error);
  const lastActivity = stats?.lastProcessedDemand || null;

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
            <div className="w-16 h-16 rounded-full border-4 border-jb-bg-elevated border-t-jb-magenta animate-spin"></div>
          </div>
          <p className="text-jb-text-muted font-black uppercase tracking-widest text-[10px]">Chargement...</p>
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
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary-600">Commission</p>
              <h1 className="mt-3 text-4xl font-black text-jb-text-primary tracking-tight uppercase">Espace commission</h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="shrink-0"
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
                title="Total Demandes" 
                value={stats.totalRequests} 
                subValue="Tous les dossiers"
                icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
                color="primary"
                to="/commission/demandes"
              />
              <StatCard 
                title="En Attente" 
                value={stats.pendingRequests} 
                subValue="À traiter"
                icon={<ClockIcon className="w-6 h-6" />}
                color="accent"
                to="/commission/demandes?etat=EN_ATTENTE"
              />
              <StatCard 
                title="Validées" 
                value={stats.validatedRequests} 
                subValue="Dossiers acceptés"
                icon={<CheckCircleIcon className="w-6 h-6" />}
                color="success"
                to="/commission/demandes?etat=VALIDE"
              />
              <StatCard 
                title="Refusées" 
                value={stats.rejectedRequests} 
                subValue="Dossiers rejetés"
                icon={<XCircleIcon className="w-6 h-6" />}
                color="danger"
                to="/commission/demandes?etat=REFUSE"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="p-10 lg:col-span-1 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden group border border-white/70">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-standard">
                  <ChartBarIcon className="w-32 h-32" />
                </div>
                
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      className="text-jb-bg-elevated"
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
                    <span className="text-4xl font-black text-jb-text-primary tracking-tighter">{stats.processingRate}%</span>
                    <span className="text-[10px] font-black text-jb-magenta uppercase tracking-widest">Traité</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black text-jb-text-primary uppercase tracking-widest">Taux de traitement</h3>
                </div>
              </Card>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 group border border-white/70" onClick={() => navigate('/commission/demandes?etat=VALIDE')}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-lg border border-white/70 group-hover:scale-110 transition-standard shadow-[0_18px_34px_-20px_rgba(12,122,59,0.24)]" style={{ background: 'var(--jb-gradient-primary)', color: '#fff' }}>
                      <BoltIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-[10px] font-black text-jb-text-primary uppercase tracking-[0.2em]">Délai moyen</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-5xl font-black text-jb-text-primary tracking-tight">{stats.avgProcessingTime}</p>
                  </div>
                </Card>

                <Card
                  variant="dark"
                  className={`p-8 relative overflow-hidden group ${lastActivity?.id ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (lastActivity?.id) {
                      navigate(`/commission/demandes?demande=${lastActivity.id}`);
                    } else {
                      navigate('/commission/demandes');
                    }
                  }}
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-standard">
                    <CheckBadgeIcon className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="p-3 bg-white/10 text-white rounded-lg border border-white/10 group-hover:scale-110 transition-standard shadow-lg">
                      <ChartBarIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Activité récente</h3>
                  </div>
                  {lastActivity ? (
                    <div className="space-y-4 relative z-10">
                      <div className="space-y-2">
                        <p className="text-3xl font-black text-white tracking-tight truncate" title={lastActivity.requesterName}>
                          {lastActivity.requesterName}
                        </p>
                        <p className="text-[10px] text-white/45 font-black uppercase tracking-widest">
                          {lastActivity.statusLabel} le {stats.lastProcessedRequest}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoLine icon={UserIcon} label="Formateur" value={lastActivity.requesterEmail} />
                        <InfoLine icon={BuildingOffice2Icon} label="Établissement" value={lastActivity.requesterEstablishment} />
                        <InfoLine icon={MapPinIcon} label="Cible" value={`${lastActivity.targetRegion} · ${lastActivity.targetCity}`} />
                        <InfoLine icon={CheckBadgeIcon} label="Traitée par" value={lastActivity.reviewerName} />
                      </div>

                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Commentaire</p>
                        <p className="mt-2 text-sm font-medium text-white/80 leading-relaxed line-clamp-3">
                          {lastActivity.commentary || 'Aucun commentaire ajouté pour cette action.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 relative z-10">
                      <p className="text-3xl font-black text-white tracking-tight">—</p>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-relaxed">Aucune activité récente disponible</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

const InfoLine = ({ icon, label, value }) => {
  const IconComponent = icon;

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-2 text-white/45">
        <IconComponent className="w-4 h-4" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-bold text-white/90 truncate" title={value}>
        {value || '—'}
      </p>
    </div>
  );
};

export default CommissionDashboard;

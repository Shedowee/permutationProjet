import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../auth/hooks/useAuth';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { fetchFormateurStats } from '../redux/formateurSlice';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  CheckBadgeIcon, 
  XCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ChartPieIcon,
  InformationCircleIcon
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="text-secondary-600 font-bold uppercase tracking-widest text-xs">Chargement de votre espace personnel...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-10 pb-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-surface-800 tracking-tight">Mon Espace Personnel</h1>
            <p className="text-secondary-700 mt-1 font-medium italic">Suivi et gestion de vos demandes de permutation</p>
            <div className="h-1.5 w-24 bg-primary-500 rounded-full mt-3"></div>
          </div>
          <Link to={role === 'employe' ? '/employe/demandes/create' : '/formateur/demandes/create'}>
            <Button variant="primary" className="px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary-500/20">
              <PlusIcon className="w-5 h-5 mr-2" />
              Nouvelle Demande
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center space-x-4 text-red-700 animate-fadeIn">
            <XCircleIcon className="h-8 w-8 shrink-0" />
            <p className="text-sm font-bold uppercase tracking-widest">Erreur: {error}</p>
          </div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard 
                title="Mes Demandes" 
                value={stats.totalRequests} 
                icon={<DocumentTextIcon className="w-6 h-6" />}
                color="blue"
              />
              <StatCard 
                title="En Attente" 
                value={stats.pendingRequests} 
                icon={<ClockIcon className="w-6 h-6" />}
                color="amber"
              />
              <StatCard 
                title="Acceptées" 
                value={stats.validatedRequests} 
                icon={<CheckBadgeIcon className="w-6 h-6" />}
                color="green"
              />
              <StatCard 
                title="Refusées" 
                value={stats.rejectedRequests} 
                icon={<XCircleIcon className="w-6 h-6" />}
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Dernier Dossier */}
              <div className="lg:col-span-2 space-y-8">
                <Card variant="institutional" className="p-10 rounded-2xl relative overflow-hidden group border-secondary-100">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                    <DocumentTextIcon className="w-48 h-48 text-secondary-900" />
                  </div>
                  
                  <div className="relative z-10">
                    <h2 className="text-lg font-black text-surface-800 mb-10 flex items-center uppercase tracking-widest border-b border-secondary-100 pb-4">
                      <InformationCircleIcon className="w-6 h-6 mr-3 text-primary-500" />
                      Dernière Demande Soumise
                    </h2>

                    {stats.lastRequestStatus ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                          <div>
                            <p className="text-[10px] font-black text-secondary-600 uppercase tracking-[0.2em] mb-4">Statut Actuel</p>
                            <span className={`px-6 py-2 rounded-lg text-[10px] font-black border tracking-[0.2em] inline-block ${
                              stats.lastRequestStatus === 'EN_ATTENTE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              stats.lastRequestStatus === 'VALIDE' ? 'bg-primary-50 text-primary-700 border-primary-200' : 
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {stats.lastRequestStatus === 'EN_ATTENTE' ? 'EN ATTENTE' :
                               stats.lastRequestStatus === 'VALIDE' ? 'VALIDÉE' : 'REFUSÉE'}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-secondary-600 uppercase tracking-[0.2em] mb-3">Soumise le</p>
                            <p className="text-surface-900 font-black text-xl">{stats.lastRequestDate}</p>
                          </div>
                        </div>
                        
                        <div className="p-8 bg-secondary-50/80 backdrop-blur-sm rounded-2xl border border-secondary-200 shadow-inner">
                          <p className="text-[10px] font-black text-secondary-600 uppercase tracking-[0.2em] mb-4">Motif de la demande</p>
                          <p className="text-secondary-900 italic text-sm font-bold leading-relaxed">"{stats.lastRequestMotif}"</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-16 text-center bg-surface-50 rounded-2xl border border-dashed border-secondary-200">
                        <p className="text-secondary-400 font-bold italic uppercase tracking-widest text-sm">Vous n'avez pas encore de demande soumise.</p>
                        <Link to="/formateur/demandes/create" className="text-primary-500 hover:text-primary-600 text-xs mt-6 inline-block font-black uppercase tracking-widest underline underline-offset-8 decoration-2">
                          Créer ma première demande
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* KPIs Secondaires */}
              <div className="space-y-8">
                <Card className="p-8 rounded-2xl bg-primary-500 border-none shadow-xl shadow-primary-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex items-center space-x-4 mb-8 relative z-10">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
                      <CalendarDaysIcon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Période Cible</h3>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <p className="text-3xl font-black text-white tracking-tight">{stats.lastRequestDates || "Aucune"}</p>
                    <p className="text-[10px] text-primary-100 font-black uppercase tracking-[0.2em]">Dernière demande</p>
                  </div>
                </Card>

                <Card variant="institutional" className="p-8 rounded-2xl relative overflow-hidden group border-secondary-100">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-secondary-50 rounded-xl border border-secondary-100 shadow-sm">
                      <ChartPieIcon className="w-6 h-6 text-secondary-500" />
                    </div>
                    <h3 className="text-sm font-black text-surface-800 uppercase tracking-widest">Réussite</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-5xl font-black text-secondary-600 tracking-tighter">{stats.successRate}<span className="text-2xl text-secondary-400">%</span></p>
                    <p className="text-[10px] text-secondary-400 font-black uppercase tracking-[0.2em]">Taux d'acceptation</p>
                  </div>
                  <div className="mt-8 w-full bg-secondary-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-primary-500 h-full rounded-full transition-all duration-1000 shadow-sm" 
                      style={{ width: `${stats.successRate}%` }}
                    ></div>
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
    blue: 'bg-white text-secondary-600 border-secondary-100 hover:border-secondary-300',
    green: 'bg-white text-primary-600 border-primary-100 hover:border-primary-300',
    amber: 'bg-white text-amber-600 border-amber-100 hover:border-amber-300',
    red: 'bg-white text-red-600 border-red-100 hover:border-red-300',
  };

  const iconColors = {
    blue: 'bg-secondary-50 text-secondary-600',
    green: 'bg-primary-50 text-primary-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <Card variant="institutional" className={`p-8 border-2 group hover:translate-y-[-4px] ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400">{title}</p>
          <h3 className="text-4xl font-black tracking-tight text-surface-800">{value}</h3>
        </div>
        <div className={`p-4 rounded-xl shadow-sm border border-transparent group-hover:scale-110 transition-transform duration-500 ${iconColors[color] || iconColors.blue}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default FormateurDashboard;

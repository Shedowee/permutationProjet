import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import { fetchAdminStats } from '../redux/adminSlice';

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  UserGroupIcon, 
  ClockIcon, 
  MapPinIcon, 
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const stats = useSelector(state => state.admin.stats.data);
  const loading = useSelector(state => state.admin.stats.loading);

  const monthlyActivityData = useMemo(() => stats?.monthlyActivityData || [], [stats]);
  const userStatsData = useMemo(() => stats?.userStatsData || [], [stats]);
  const recentActions = useMemo(() => stats?.recentActions || [], [stats]);
  const regionStats = useMemo(() => stats?.regionStats || [], [stats]);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p className="text-secondary-600 font-bold uppercase tracking-widest text-xs">Chargement du tableau de bord...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-10 pb-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-surface-800 tracking-tight">Tableau de bord</h1>
            <p className="text-secondary-700 mt-1 font-medium italic">Vue d'ensemble de l'activité du système de permutation</p>
            <div className="h-1.5 w-24 bg-primary-500 rounded-full mt-4"></div>
          </div>
          <button 
            onClick={() => dispatch(fetchAdminStats())}
            className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-secondary-50 text-secondary-700 rounded-xl border border-secondary-200 shadow-sm transition-all text-xs font-black uppercase tracking-widest group"
          >
            <ArrowPathIcon className={`w-4 h-4 transition-transform group-hover:rotate-180 duration-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
        </div>
        
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard 
            title="Utilisateurs" 
            value={stats?.totalUsers || 0}
            subValue={`${stats?.activeUsers || 0} actifs`}
            icon={<UserGroupIcon className="w-6 h-6" />}
            color="blue"
            percentage={stats?.totalUsers ? (stats.activeUsers / stats.totalUsers) * 100 : 0}
          />
          <StatCard 
            title="Demandes Validées" 
            value={stats?.validatedRequests || 0}
            subValue="Toutes périodes"
            icon={<CheckBadgeIcon className="w-6 h-6" />}
            color="green"
            percentage={stats?.validatedRequests && stats?.pendingRequests ? (stats.validatedRequests / (stats.validatedRequests + stats.pendingRequests)) * 100 : 0}
          />
          <StatCard 
            title="En Attente" 
            value={stats?.pendingRequests || 0}
            subValue="Nécessite action"
            icon={<ExclamationCircleIcon className="w-6 h-6" />}
            color="amber"
          />
          <StatCard 
            title="Établissements" 
            value={stats?.totalEstablishments || 0}
            subValue="Inscrits"
            icon={<BuildingOffice2Icon className="w-6 h-6" />}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-8">
            <Card variant="institutional" className="p-8 rounded-2xl border-secondary-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4 border-b border-secondary-100 pb-6">
                <h2 className="text-lg font-black text-surface-800 flex items-center uppercase tracking-widest">
                  <PresentationChartLineIcon className="w-6 h-6 mr-3 text-primary-500" />
                  Activité du Système
                </h2>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500 mr-2 shadow-sm shadow-primary-500/50"></span>
                    <span className="text-[10px] font-black text-secondary-500 uppercase tracking-widest">Connexions</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary-500 mr-2 shadow-sm shadow-secondary-500/50"></span>
                    <span className="text-[10px] font-black text-secondary-500 uppercase tracking-widest">Inscriptions</span>
                  </div>
                </div>
              </div>
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#009245" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#009245" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0072BC" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0072BC" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}}
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                        padding: '12px'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                      labelStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#009245" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorUsers)" 
                      name="Connexions"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="registrations" 
                      stroke="#0072BC" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorReg)" 
                      name="Inscriptions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card variant="institutional" className="p-8 rounded-2xl border-secondary-100">
                <h2 className="text-sm font-black text-surface-800 mb-8 flex items-center uppercase tracking-widest border-b border-secondary-50 pb-4">
                  <MapPinIcon className="w-5 h-5 mr-3 text-primary-500" />
                  Top Régions (Demandes)
                </h2>
                <div className="space-y-6">
                  {regionStats.length > 0 ? regionStats.map((item, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                        <span className="text-secondary-700">{item.region}</span>
                        <span className="text-surface-800">{item.users} <span className="text-secondary-400 font-bold lowercase">demandes</span></span>
                      </div>
                      <div className="w-full bg-secondary-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-primary-500 h-full rounded-full transition-all duration-1000 shadow-sm" 
                          style={{ width: item.growth }}
                        ></div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-12 text-center">
                      <p className="text-secondary-400 text-xs font-black uppercase tracking-widest italic">Aucune donnée disponible</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card variant="institutional" className="p-8 rounded-2xl border-secondary-100">
                <h2 className="text-sm font-black text-surface-800 mb-8 flex items-center uppercase tracking-widest border-b border-secondary-50 pb-4">
                  <ClockIcon className="w-5 h-5 mr-3 text-secondary-500" />
                  Activités Récentes
                </h2>
                <div className="space-y-4">
                  {recentActions.length > 0 ? recentActions.map((action, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-4 rounded-xl bg-secondary-50/50 hover:bg-secondary-50 transition-all border border-secondary-100 group">
                      <div className={`shrink-0 w-2.5 h-2.5 rounded-full ring-4 ${
                        action.type === 'create' ? 'bg-primary-500 ring-primary-100' : 
                        action.type === 'delete' ? 'bg-red-500 ring-red-100' : 'bg-secondary-500 ring-secondary-100'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-surface-800 font-bold truncate group-hover:text-primary-600 transition-colors">{action.action}</p>
                        <div className="flex items-center mt-1 text-[10px] font-black uppercase tracking-widest text-secondary-500 space-x-2">
                          <span className="text-primary-600">{action.user}</span>
                          <span className="text-secondary-200">•</span>
                          <span className="italic">{new Date(action.time).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-12 text-center">
                      <p className="text-secondary-400 text-xs font-black uppercase tracking-widest italic">Aucun log récent</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-8">
            <Card variant="institutional" className="p-8 rounded-2xl border-secondary-100 bg-white shadow-sm">
              <h2 className="text-sm font-black text-surface-800 mb-8 uppercase tracking-widest border-b border-secondary-50 pb-4">Répartition Rôles</h2>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userStatsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                    >
                      {userStatsData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={[ '#009245', '#0072BC', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]}
                          className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-[10px] font-black text-secondary-500 uppercase tracking-widest ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-8 rounded-2xl bg-primary-500 border-none shadow-xl shadow-primary-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <h2 className="text-sm font-black text-white mb-2 uppercase tracking-[0.2em] relative z-10">
                À Vérifier
              </h2>
              <p className="text-xs text-primary-100 font-medium mb-8 relative z-10 leading-relaxed italic">
                Comptes en attente de validation ou sans rôle attribué.
              </p>
              <div className="space-y-4 relative z-10">
                {stats?.pendingUsers?.slice(0, 3).map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/25 transition-all group">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-primary-100 font-medium truncate mt-0.5">{user.email}</p>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-lg text-[9px] font-black bg-white text-primary-700 uppercase tracking-widest shadow-sm">
                      {user.status}
                    </span>
                  </div>
                )) || (
                  <div className="py-6 text-center">
                    <CheckBadgeIcon className="h-8 w-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Tout est en ordre</p>
                  </div>
                )}
                {stats?.pendingUsers?.length > 3 && (
                  <button className="w-full py-3 text-[10px] font-black text-white hover:bg-white/10 rounded-xl transition-all uppercase tracking-widest border border-white/10">
                    Voir les {stats.pendingUsers.length - 3} autres
                  </button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, subValue, icon, color, percentage }) => {
  const colorClasses = {
    blue: 'bg-white text-secondary-600 border-secondary-100 hover:border-secondary-300',
    green: 'bg-white text-primary-600 border-primary-100 hover:border-primary-300',
    amber: 'bg-white text-amber-600 border-amber-100 hover:border-amber-300',
  };

  const iconColors = {
    blue: 'bg-secondary-50 text-secondary-600',
    green: 'bg-primary-50 text-primary-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <Card variant="institutional" className={`p-8 border-2 group hover:translate-y-[-4px] transition-all duration-300 ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-400">{title}</p>
          <div className="flex items-baseline space-x-3">
            <h3 className="text-4xl font-black tracking-tight text-surface-800">{value}</h3>
            {percentage !== undefined && (
              <div className={`flex items-center px-2 py-1 rounded-lg border shadow-sm ${iconColors[color]}`}>
                <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                <span className="text-[10px] font-black">{Math.round(percentage)}%</span>
              </div>
            )}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary-400 italic">{subValue}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-sm border border-transparent group-hover:scale-110 transition-transform duration-500 ${iconColors[color] || iconColors.blue}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default AdminDashboard;

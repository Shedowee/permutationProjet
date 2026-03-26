import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import { fetchAdminStats } from '../redux/adminSlice';
import { motion } from 'framer-motion';

import {
  PieChart, Pie, Cell,
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
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin"></div>
          </div>
          <p className="text-surface-600 font-black uppercase tracking-widest text-[10px]">Chargement du tableau de bord...</p>
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
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-black text-surface-900 tracking-tight uppercase">Tableau de bord</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="h-1 w-12 bg-primary-500 rounded-full"></span>
              <p className="text-surface-600 font-black uppercase tracking-widest text-[10px]">Vue d'ensemble de l'activité</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button 
              variant="outline"
              onClick={() => dispatch(fetchAdminStats())}
              icon={ArrowPathIcon}
              className={loading ? 'animate-spin' : ''}
            >
              Actualiser
            </Button>
          </motion.div>
        </div>
        
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard 
            title="Utilisateurs" 
            value={stats?.totalUsers || 0}
            subValue={`${stats?.activeUsers || 0} actifs`}
            icon={<UserGroupIcon className="w-6 h-6" />}
            color="primary"
            percentage={stats?.totalUsers ? (stats.activeUsers / stats.totalUsers) * 100 : 0}
          />
          <StatCard 
            title="Demandes Validées" 
            value={stats?.validatedRequests || 0}
            subValue="Toutes périodes"
            icon={<CheckBadgeIcon className="w-6 h-6" />}
            color="success"
            percentage={stats?.validatedRequests && stats?.pendingRequests ? (stats.validatedRequests / (stats.validatedRequests + stats.pendingRequests)) * 100 : 0}
          />
          <StatCard 
            title="En Attente" 
            value={stats?.pendingRequests || 0}
            subValue="Nécessite action"
            icon={<ExclamationCircleIcon className="w-6 h-6" />}
            color="accent"
          />
          <StatCard 
            title="Établissements" 
            value={stats?.totalEstablishments || 0}
            subValue="Inscrits"
            icon={<BuildingOffice2Icon className="w-6 h-6" />}
            color="secondary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4 border-b border-surface-50 pb-6">
                <h2 className="text-[10px] font-black text-surface-900 flex items-center uppercase tracking-[0.2em]">
                  <PresentationChartLineIcon className="w-5 h-5 mr-3 text-primary-500" />
                  Activité du Système
                </h2>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-primary"></span>
                    <span className="text-[10px] font-black text-surface-600 uppercase tracking-widest">Connexions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary-500 shadow-secondary"></span>
                    <span className="text-[10px] font-black text-surface-600 uppercase tracking-widest">Inscriptions</span>
                  </div>
                </div>
              </div>
              <div className="h-[400px] w-full min-h-0">
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                        border: 'none',
                        borderRadius: '1rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        padding: '12px'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                      labelStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#334155', marginBottom: '8px' }}
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
              <Card className="p-8">
                <h2 className="text-[10px] font-black text-surface-900 mb-8 flex items-center uppercase tracking-[0.2em] border-b border-surface-50 pb-4">
                  <MapPinIcon className="w-5 h-5 mr-3 text-primary-500" />
                  Top Régions
                </h2>
                <div className="space-y-6">
                  {regionStats.length > 0 ? regionStats.map((item, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-surface-600">{item.region}</span>
                        <span className="text-surface-900">{item.users} demandes</span>
                      </div>
                      <div className="w-full bg-surface-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: item.growth }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-primary-500 h-full rounded-full shadow-primary" 
                        ></motion.div>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-xs font-bold text-surface-400 uppercase tracking-widest">Aucune donnée</p>
                  )}
                </div>
              </Card>

              <Card className="p-8">
                <h2 className="text-[10px] font-black text-surface-900 mb-8 flex items-center uppercase tracking-[0.2em] border-b border-surface-50 pb-4">
                  <ClockIcon className="w-5 h-5 mr-3 text-secondary-500" />
                  Dernières Actions
                </h2>
                <div className="space-y-6">
                  {recentActions.length > 0 ? recentActions.map((action, idx) => (
                    <div key={idx} className="flex items-start gap-4 group">
                      <div className="w-2 h-2 rounded-full bg-secondary-400 mt-1.5 group-hover:scale-150 transition-standard"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-surface-800 leading-relaxed truncate">{action.action}</p>
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">{action.time}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-xs font-bold text-surface-400 uppercase tracking-widest">Aucun historique</p>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <Card className="p-8">
              <h2 className="text-[10px] font-black text-surface-900 mb-8 uppercase tracking-[0.2em] border-b border-surface-50 pb-4">Répartition Rôles</h2>
              <div className="h-[280px] min-h-0">
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
                          className="hover:opacity-80 transition-standard cursor-pointer focus:outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: 'none',
                        borderRadius: '1rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ fontSize: '12px', fontBold: true, textTransform: 'uppercase' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card variant="dark" className="p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-standard">
                <UserGroupIcon className="w-32 h-32" />
              </div>
              <h2 className="text-[10px] font-black text-white/50 mb-8 uppercase tracking-[0.2em] flex items-center">
                <CheckBadgeIcon className="w-5 h-5 mr-3 text-primary-400" />
                Validations en attente
              </h2>
              <div className="space-y-4 relative z-10">
                {stats?.pendingUsers?.slice(0, 3).map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-standard">
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-black text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-white/50 font-bold truncate mt-1 uppercase tracking-widest">{user.email}</p>
                    </div>
                    <span className="shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black bg-primary-500 text-white uppercase tracking-widest shadow-primary">
                      {user.status}
                    </span>
                  </div>
                )) || (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckBadgeIcon className="h-6 w-6 text-white/20" />
                    </div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Tout est à jour</p>
                  </div>
                )}
                {stats?.pendingUsers?.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full text-white/60 hover:text-white hover:bg-white/5">
                    Voir les {stats.pendingUsers.length - 3} autres
                  </Button>
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
  const colorStyles = {
    primary: 'border-primary-100 bg-primary-50/10 text-primary-600',
    secondary: 'border-secondary-100 bg-secondary-50/10 text-secondary-600',
    success: 'border-green-100 bg-green-50/10 text-green-600',
    accent: 'border-amber-100 bg-amber-50/10 text-amber-600',
  };

  const iconStyles = {
    primary: 'bg-primary-500 text-white shadow-primary',
    secondary: 'bg-secondary-500 text-white shadow-secondary',
    success: 'bg-green-500 text-white shadow-soft',
    accent: 'bg-amber-500 text-white shadow-soft',
  };

  return (
    <Card className="p-6 group hover:shadow-hard transition-all cursor-pointer border-surface-50 overflow-hidden relative">
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-600">{title}</p>
          <div className="flex items-baseline gap-3">
            <h3 className="text-4xl font-black tracking-tight text-surface-900">{value}</h3>
            {percentage !== undefined && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white shadow-soft text-[10px] font-black text-primary-600">
                <ArrowTrendingUpIcon className="w-3 h-3" />
                <span>{Math.round(percentage)}%</span>
              </div>
            )}
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-surface-500 italic">{subValue}</p>
        </div>
        <div className={`p-4 rounded-2xl transition-standard group-hover:scale-110 ${iconStyles[color] || iconStyles.primary}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default AdminDashboard;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import StatCard from '../../../shared/components/StatCard';
import Button from '../../../shared/components/Button';
import Modal from '../../../shared/components/Modal';
import { fetchAdminStats } from '../redux/adminSlice';
import { motion } from 'framer-motion';

import {
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { 
  UserGroupIcon, 
  ClockIcon, 
  MapPinIcon, 
  CheckBadgeIcon,
  BuildingOffice2Icon,
  ArrowPathIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  FunnelIcon,
  PresentationChartLineIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedStat, setSelectedStat] = useState('users');
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [selectedRegionDetail, setSelectedRegionDetail] = useState(null);
  const [selectedActionDetail, setSelectedActionDetail] = useState(null);
  const [isCompactPie, setIsCompactPie] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  ));
  const stats = useSelector(state => state.admin.stats.data);
  const loading = useSelector(state => state.admin.stats.loading);

  const dailyActivityData = useMemo(() => stats?.dailyActivityData || [], [stats]);
  const userStatsData = useMemo(() => stats?.userStatsData || [], [stats]);
  const recentActions = useMemo(() => stats?.recentActions || [], [stats]);
  const regionStats = useMemo(() => stats?.regionStats || [], [stats]);
  const pendingUsers = useMemo(() => stats?.pendingUsers || [], [stats]);
  const activityTotals = useMemo(() => (
    dailyActivityData.reduce((acc, item) => ({
      users: acc.users + Number(item.users || 0),
      signups: acc.signups + Number(item.signups || 0),
      emailConfirmations: acc.emailConfirmations + Number(item.emailConfirmations || 0),
      requests: acc.requests + Number(item.requests || 0),
    }), { users: 0, signups: 0, emailConfirmations: 0, requests: 0 })
  ), [dailyActivityData]);
  const totalRequests = Number(stats?.totalRequests || 0);
  const validatedRequests = Number(stats?.validatedRequests || 0);
  const pendingRequests = Number(stats?.pendingRequests || 0);
  const rejectedRequests = Number(stats?.rejectedRequests || 0);
  const totalAdmins = Number(stats?.totalAdmins || 0);
  const totalCommission = Number(stats?.totalCommission || 0);
  const totalFormateurs = Number(stats?.totalFormateurs || 0);
  const newAccountsToday = Number(stats?.newAccountsToday || 0);
  const newAccounts7d = Number(stats?.newAccounts7d || 0);
  const totalUsers = Number(stats?.totalUsersInDb || 0);
  const activeUsers = Number(stats?.activeUsers || 0);
  const pendingVerification = Number(stats?.pendingVerification || 0);
  const activationRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
  const validationRate = totalRequests > 0 ? (validatedRequests / totalRequests) * 100 : 0;
  const pendingUsersTarget = '/admin/users?pending=1';
  const roleBreakdown = useMemo(
    () => (stats?.userStatsData || []).map((item) => ({
      ...item,
      value: Number(item.value || 0),
    })),
    [stats]
  );
  const topRegion = regionStats[0];
  const refreshStats = useCallback(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  useEffect(() => {
    const updateCompactPie = () => {
      setIsCompactPie(window.innerWidth < 640);
    };

    updateCompactPie();
    window.addEventListener('resize', updateCompactPie);
    return () => window.removeEventListener('resize', updateCompactPie);
  }, []);

  const statCards = useMemo(() => ([
    {
      key: 'users',
      title: 'Utilisateurs',
      value: totalUsers,
      subValue: `${activeUsers} actifs sur ${stats?.totalUsersInDb || 0}`,
      icon: <UserGroupIcon className="w-6 h-6" />,
      color: 'primary',
      percentage: activationRate,
      detail: {
        eyebrow: 'Base utilisateur',
        title: 'Adoption et activation',
        bullets: [
          `${activeUsers} comptes actifs`,
          `${pendingVerification} comptes à vérifier`,
          `${stats?.totalUsersInDb || 0} comptes enregistrés`,
        ],
        actionLabel: 'Ouvrir les utilisateurs',
        actionTo: '/admin/users',
      },
    },
    {
      key: 'requests',
      title: 'Demandes',
      value: totalRequests,
      subValue: `${pendingRequests} en attente, ${validatedRequests} validées`,
      icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />,
      color: 'secondary',
      percentage: validationRate,
      detail: {
        eyebrow: 'Flux de demandes',
        title: 'Traitement et validation',
        bullets: [
          `${validatedRequests} demandes validées`,
          `${pendingRequests} demandes en attente`,
          `${rejectedRequests} demandes refusées`,
        ],
      },
    },
    {
      key: 'verifications',
      title: 'Vérifications',
      value: pendingVerification,
      subValue: 'Comptes à vérifier',
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      color: 'accent',
      detail: {
        eyebrow: 'Contrôle du compte',
        title: 'Validation administrative',
        bullets: pendingUsers.slice(0, 3).map((user) => `${user.name} - ${user.email}`),
        actionLabel: 'Voir les comptes',
        actionTo: pendingUsersTarget,
      },
    },
    {
      key: 'establishments',
      title: 'Établissements',
      value: stats?.totalEstablishments || 0,
      subValue: 'Référencés',
      icon: <BuildingOffice2Icon className="w-6 h-6" />,
      color: 'success',
      detail: {
        eyebrow: 'Référentiel',
        title: 'Couverture réseau',
        bullets: [
          `${stats?.totalEstablishments || 0} établissements enregistrés`,
          `${topRegion?.region || 'Aucune région dominante'} en tête`,
        ],
        actionLabel: 'Gérer les établissements',
        actionTo: '/admin/etablissements',
      },
    },
    {
      key: 'newAccounts',
      title: 'Nouveaux comptes',
      value: newAccountsToday,
      subValue: `Sur les 7 derniers jours: ${newAccounts7d}`,
      icon: <UserPlusIcon className="w-6 h-6" />,
      color: 'primary',
      trend: `+${newAccounts7d}`,
      detail: {
        eyebrow: 'Suivi temps réel',
        title: 'Créations et vérifications',
        bullets: [
          `${newAccountsToday} nouveaux comptes aujourd’hui`,
          `${activityTotals.signups} comptes créés sur la période`,
          `${activityTotals.emailConfirmations} emails vérifiés sur la période`,
        ],
      },
    },
    {
      key: 'rejections',
      title: 'Refus / rejets',
      value: rejectedRequests,
      subValue: 'Demandes refusées',
      icon: <FunnelIcon className="w-6 h-6" />,
      color: 'danger',
      percentage: totalRequests > 0 ? (rejectedRequests / totalRequests) * 100 : 0,
      detail: {
        eyebrow: 'Qualité de traitement',
        title: 'Demandes refusées',
        bullets: [
          `${rejectedRequests} demandes refusées`,
          `${totalRequests} demandes totales`,
        ],
      },
    },
  ]), [
    activeUsers,
    newAccounts7d,
    newAccountsToday,
    pendingRequests,
    pendingUsers,
    pendingUsersTarget,
    pendingVerification,
    rejectedRequests,
    stats?.totalEstablishments,
    stats?.totalUsersInDb,
    totalRequests,
    totalUsers,
    topRegion?.region,
    validatedRequests,
    activationRate,
    validationRate,
    activityTotals.emailConfirmations,
    activityTotals.signups,
  ]);
  const progressionCards = statCards.filter((card) => card.percentage !== undefined || card.trend !== undefined);
  const summaryCards = statCards.filter((card) => card.percentage === undefined && card.trend === undefined);
  const selectedStatData = statCards.find((item) => item.key === selectedStat) || statCards[0];
  const openStatDetail = (key) => {
    setSelectedStat(key);
    setIsStatModalOpen(true);
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, [refreshStats]);

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
        <Card className="p-6 sm:p-8 bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary-600">Administration</p>
              <h1 className="mt-3 text-4xl font-black text-surface-900 tracking-tight uppercase">Tableau de bord</h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="shrink-0"
            >
              <Button 
                variant="outline"
                onClick={refreshStats}
                icon={ArrowPathIcon}
                className={loading ? 'animate-spin' : ''}
              >
                Actualiser
              </Button>
            </motion.div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-8">
          <Card className="p-8 sm:p-10">
            <div className="flex flex-col gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-jb-text-primary">Indicateurs clés</h2>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-lg border-2 border-jb-cyan/20 bg-gradient-to-br from-jb-bg-section/90 to-white/80 p-5 sm:p-6 shadow-[0_30px_72px_-44px_rgba(15,31,24,0.28)] ring-1 ring-inset ring-jb-green/10">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jb-magenta">Suivi</p>
                    <h3 className="mt-2 text-lg font-black text-jb-text-primary">Activité</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {progressionCards.map((card) => (
                    <StatCard
                      key={card.key}
                      title={card.title}
                      value={card.value}
                      subValue={card.subValue}
                      icon={card.icon}
                      color={card.color}
                      percentage={card.percentage}
                      trend={card.trend}
                      onClick={() => openStatDetail(card.key)}
                      selected={selectedStat === card.key}
                      detailLabel="Détails"
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border-2 border-dashed border-jb-green/20 bg-white/55 p-5 sm:p-6 ring-1 ring-inset ring-jb-cyan/10">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jb-text-muted">Synthèse</p>
                    <h3 className="mt-2 text-lg font-black text-jb-text-primary">Résumé</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {summaryCards.map((card) => (
                    <StatCard
                      key={card.key}
                      title={card.title}
                      value={card.value}
                      subValue={card.subValue}
                      icon={card.icon}
                      color={card.color}
                      onClick={() => openStatDetail(card.key)}
                      selected={selectedStat === card.key}
                      detailLabel="Détails"
                      compact
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 sm:p-10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jb-text-muted">Répartition</p>
                <h2 className="mt-2 text-2xl font-black text-jb-text-primary">Rôles et charge</h2>
              </div>
              <div className="rounded-lg bg-jb-bg-elevated px-4 py-3 text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted">Total admins</p>
                <p className="text-xl font-black text-jb-text-primary">{totalAdmins}</p>
              </div>
            </div>

              <div className="space-y-4">
                {[
                  { label: 'Admins', value: totalAdmins, color: 'primary' },
                  { label: 'Commission', value: totalCommission, color: 'secondary' },
                  { label: 'Formateurs', value: totalFormateurs, color: 'accent' },
                  { label: 'Utilisateurs', value: totalUsers - totalAdmins - totalCommission - totalFormateurs, color: 'success' },
              ].map((item) => {
                const max = Math.max(totalUsers, 1);
                const width = Math.max(4, Math.round((item.value / max) * 100));
                const barColor = item.color === 'primary'
                  ? 'var(--jb-gradient-primary)'
                  : item.color === 'secondary'
                    ? 'linear-gradient(90deg, #2f7be5 0%, #0f9fb5 100%)'
                    : item.color === 'accent'
                      ? 'linear-gradient(90deg, #d98c1f 0%, #eab308 100%)'
                      : 'linear-gradient(90deg, #18a874 0%, #009245 100%)';

                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-jb-text-muted">{item.label}</span>
                      <span className="text-jb-text-primary">{item.value}</span>
                    </div>
                    <div className="h-3 rounded-full bg-jb-bg-elevated overflow-hidden border border-white/70">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${width}%`, background: barColor }}
                      />
                    </div>
                  </div>
                  );
              })}
            </div>

            {roleBreakdown.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jb-text-muted">Répartition détaillée</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jb-text-muted">Par rôle</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {roleBreakdown.slice(0, 4).map((role) => (
                    <div key={role.name} className="rounded-lg border-2 border-jb-cyan/20 bg-jb-bg-section px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted">{role.name}</p>
                      <p className="mt-2 text-2xl font-black text-jb-text-primary">{role.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 rounded-lg border-2 border-jb-green/20 bg-white/80 p-5 ring-1 ring-inset ring-jb-cyan/10">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted">Région dominante</p>
                  <p className="mt-1 text-sm font-black text-jb-text-primary">{topRegion?.region || 'Aucune donnée'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted">Demandes</p>
                  <p className="mt-1 text-sm font-black text-jb-text-primary">{topRegion?.users || 0}</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-jb-bg-elevated overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${topRegion ? Math.max(10, Math.min(100, Number(String(topRegion.growth || '0').replace('%', '')))) : 0}%`,
                    background: 'var(--jb-gradient-alt)',
                  }}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <div className="h-[400px] w-full rounded-lg border-2 border-jb-green/20 bg-jb-bg-section/60 p-4 mb-8 ring-1 ring-inset ring-jb-cyan/10">
                <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                  <LineChart data={dailyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="lineUsers" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#009245" />
                        <stop offset="100%" stopColor="#18a874" />
                      </linearGradient>
                      <linearGradient id="lineReg" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0072BC" />
                        <stop offset="100%" stopColor="#0f9fb5" />
                      </linearGradient>
                      <linearGradient id="lineConfirmations" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#eab308" />
                      </linearGradient>
                      <linearGradient id="lineRequests" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#e25555" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}}
                      dy={15}
                      tickFormatter={(value) => String(value)}
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
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#009245" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                      name="Connexions"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="signups" 
                      stroke="#0072BC" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                      name="Comptes créés"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="emailConfirmations" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                      name="Emails vérifiés"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="requests" 
                      stroke="#e25555" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                      name="Demandes"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8">
                <h2 className="text-[10px] font-black text-jb-text-primary mb-8 flex items-center uppercase tracking-[0.2em] border-b-2 border-jb-green/15 pb-4">
                  <MapPinIcon className="w-5 h-5 mr-3 text-primary-500" />
                  Top Régions
                </h2>
                <div className="space-y-6">
                  {regionStats.length > 0 ? regionStats.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedRegionDetail({ ...item, rank: idx + 1 })}
                      className="block w-full rounded-lg p-3 -mx-3 text-left transition-standard hover:bg-jb-bg-elevated/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15"
                    >
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-jb-text-secondary">{item.region}</span>
                        <span className="text-jb-text-primary flex items-center gap-2">
                          {item.users} demandes
                          <ArrowTopRightOnSquareIcon className="w-3 h-3 text-jb-text-muted opacity-70" />
                        </span>
                      </div>
                      <div className="w-full bg-jb-bg-elevated rounded-full h-2.5 overflow-hidden border-2 border-jb-cyan/20">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: item.growth }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-primary-500 h-full rounded-full shadow-primary" 
                        ></motion.div>
                      </div>
                    </button>
                  )) : (
                    <p className="text-center py-10 text-xs font-bold text-surface-400 uppercase tracking-widest">Aucune donnée</p>
                  )}
                </div>
              </Card>

              <Card className="p-8">
                <h2 className="text-[10px] font-black text-jb-text-primary mb-8 flex items-center uppercase tracking-[0.2em] border-b-2 border-jb-cyan/15 pb-4">
                  <ClockIcon className="w-5 h-5 mr-3 text-secondary-500" />
                  Dernières Actions
                </h2>
                <div className="space-y-6">
                  {recentActions.length > 0 ? recentActions.map((action, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedActionDetail(action)}
                      className="flex w-full items-start gap-4 group rounded-lg p-3 -mx-3 text-left hover:bg-jb-bg-elevated/70 transition-standard focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/15"
                    >
                      <div className="w-2 h-2 rounded-full bg-secondary-400 mt-1.5 group-hover:scale-150 transition-standard"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-jb-text-primary leading-relaxed truncate flex items-center gap-2">
                          <span>{action.action}</span>
                          <ArrowTopRightOnSquareIcon className="w-3 h-3 text-jb-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="text-[10px] font-bold text-jb-text-muted uppercase tracking-widest mt-1">{action.time}</p>
                      </div>
                    </button>
                  )) : (
                    <p className="text-center py-10 text-xs font-bold text-jb-text-muted uppercase tracking-widest">Aucun historique</p>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <Card className="p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 border-b-2 border-jb-green/15 pb-4">
                <div className="min-w-0">
                  <h2 className="text-[10px] font-black text-jb-text-primary uppercase tracking-[0.2em]">Répartition rôles</h2>
                </div>
                <div className="rounded-lg bg-jb-bg-elevated px-4 py-3 text-left sm:text-right border-2 border-jb-cyan/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted">Rôles</p>
                  <p className="text-xl font-black text-jb-text-primary">{userStatsData.length}</p>
                </div>
              </div>
              <div className="h-[240px] sm:h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                  <PieChart>
                    <Pie
                      data={userStatsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isCompactPie ? 46 : 70}
                      outerRadius={isCompactPie ? 68 : 95}
                      paddingAngle={isCompactPie ? 6 : 10}
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
                      itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {userStatsData.slice(0, 4).map((entry, index) => (
                  <span
                    key={entry.name || index}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-jb-green/20 bg-white/75 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-jb-text-secondary"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: ['#009245', '#0072BC', '#f59e0b', '#ef4444'][index % 4] }}
                    />
                    <span className="truncate max-w-[120px]">{entry.name}</span>
                    <span className="text-jb-text-primary">{entry.value}</span>
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-8 relative overflow-hidden group bg-jb-bg-section border-2 border-jb-cyan/20 ring-1 ring-inset ring-jb-green/10 shadow-[0_34px_84px_-48px_rgba(15,159,181,0.24)]" onClick={() => navigate(pendingUsersTarget)}>
              <div className="absolute top-0 right-0 p-8 opacity-[0.04] group-hover:scale-110 transition-standard text-jb-cyan">
                <UserGroupIcon className="w-32 h-32" />
              </div>
              <h2 className="text-[10px] font-black text-jb-text-muted mb-8 uppercase tracking-[0.2em] flex items-center">
                <CheckBadgeIcon className="w-5 h-5 mr-3 text-jb-cyan" />
                Validation en attente
              </h2>
              <div className="space-y-4 relative z-10">
                {pendingUsers.slice(0, 3).map((user, idx) => (
                  <Link
                    key={idx}
                    to={`/admin/users?user=${user.id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-jb-bg-main border-2 border-jb-green/20 ring-1 ring-inset ring-jb-cyan/10 hover:bg-white/70 transition-standard group/link"
                  >
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-black text-jb-text-primary truncate flex items-center gap-2">
                        <span>{user.name}</span>
                        <ArrowTopRightOnSquareIcon className="w-3 h-3 text-jb-text-muted opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-[10px] text-jb-text-muted font-bold truncate mt-1 uppercase tracking-widest">{user.email}</p>
                    </div>
                    <span className="shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black bg-primary-500 text-white uppercase tracking-widest shadow-primary">
                      {user.status}
                    </span>
                  </Link>
                )) || (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-jb-cyan/20">
                      <CheckBadgeIcon className="h-6 w-6 text-jb-text-muted" />
                    </div>
                    <p className="text-jb-text-muted text-[10px] font-black uppercase tracking-widest">Tout est à jour</p>
                  </div>
                )}
                {pendingUsers.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-jb-text-muted hover:text-jb-text-primary hover:bg-white/70"
                    onClick={() => navigate('/admin/users')}
                  >
                    Voir les {pendingUsers.length - 3} autres
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedRegionDetail}
        onClose={() => setSelectedRegionDetail(null)}
        title={selectedRegionDetail ? `Région #${selectedRegionDetail.rank}` : 'Détail région'}
        size="md"
      >
        {selectedRegionDetail && (
          <div className="rounded-lg border border-primary-100 bg-white shadow-lg overflow-hidden">
            <div className="border-b border-primary-100 bg-primary-50/70 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jb-text-muted">Top régions</p>
              <h3 className="mt-2 text-2xl font-black text-jb-text-primary">{selectedRegionDetail.region}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5">
              <div className="rounded-lg border border-primary-100 bg-primary-50/40 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted">Demandes</p>
                <p className="mt-2 text-3xl font-black text-jb-text-primary">{selectedRegionDetail.users}</p>
              </div>
              <div className="rounded-lg border border-primary-100 bg-primary-50/40 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted">Part</p>
                <p className="mt-2 text-3xl font-black text-jb-text-primary">{selectedRegionDetail.growth}</p>
              </div>
            </div>
            <div className="border-t border-primary-100 bg-primary-50/50 p-4 text-right">
              <Button variant="outline" size="sm" onClick={() => setSelectedRegionDetail(null)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedActionDetail}
        onClose={() => setSelectedActionDetail(null)}
        title="Détail de l'action"
        size="md"
      >
        {selectedActionDetail && (
          <div className="rounded-lg border border-primary-100 bg-white shadow-lg overflow-hidden">
            <div className="border-b border-primary-100 bg-primary-50/70 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jb-text-muted">Dernière action</p>
              <h3 className="mt-2 text-xl font-black text-jb-text-primary">{selectedActionDetail.action || 'Action système'}</h3>
            </div>
            <div className="space-y-3 p-5">
              {[
                ['Utilisateur', selectedActionDetail.user || '—'],
                ['Type', selectedActionDetail.type || '—'],
                ['Date', selectedActionDetail.time || '—'],
                ['Référence', selectedActionDetail.id ? `#${selectedActionDetail.id}` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 rounded-lg border border-primary-100 bg-primary-50/40 px-4 py-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted">{label}</span>
                  <span className="text-sm font-black text-jb-text-primary text-right">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-primary-100 bg-primary-50/50 p-4 sm:flex-row sm:justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedActionDetail(null)}>
                Fermer
              </Button>
              {selectedActionDetail.id && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const id = selectedActionDetail.id;
                    setSelectedActionDetail(null);
                    navigate(`/admin/logs/${id}`);
                  }}
                >
                  Ouvrir le journal
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isStatModalOpen}
        onClose={() => setIsStatModalOpen(false)}
        title={selectedStatData.detail?.title || selectedStatData.title}
        size="lg"
      >
        <div className="rounded-lg border border-primary-100 bg-white p-0 shadow-lg overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-primary-100 bg-primary-50/70 p-5">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jb-text-muted">
                {selectedStatData.detail?.eyebrow || 'Détails'}
              </p>
              <h3 className="mt-2 text-2xl font-black text-jb-text-primary">
                {selectedStatData.detail?.title || selectedStatData.title}
              </h3>
            </div>
            <div className="shrink-0 rounded-lg px-4 py-3 text-right text-white shadow-[0_24px_42px_-24px_rgba(0,146,69,0.72)]" style={{ background: 'var(--jb-gradient-primary)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Valeur</p>
              <p className="mt-1 text-3xl font-black">{selectedStatData.value}</p>
            </div>
          </div>

          <div className="p-5">
            {(selectedStatData.percentage !== undefined || selectedStatData.trend !== undefined) && (
              <div className="mb-5 space-y-2 rounded-lg border border-primary-100 bg-white px-4 py-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-jb-text-muted">
                  <span>{selectedStatData.percentage !== undefined ? 'Niveau' : 'Évolution'}</span>
                  <span>{selectedStatData.percentage !== undefined ? `${Math.round(Number(selectedStatData.percentage || 0))}%` : String(selectedStatData.trend ?? '')}</span>
                </div>
                {selectedStatData.percentage !== undefined && (
                  <div className="h-2 rounded-full bg-jb-bg-elevated overflow-hidden border border-white/70">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(0, Math.min(100, Number(selectedStatData.percentage || 0)))}%`, background: 'var(--jb-gradient-primary)' }}
                    />
                  </div>
                )}
              </div>
            )}

            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jb-text-muted mb-3">Points clés</p>
            <div className="space-y-2">
              {(selectedStatData.detail?.bullets || []).length > 0 ? (
                selectedStatData.detail.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3 rounded-lg border border-primary-100 bg-primary-50/40 px-4 py-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary-500 shrink-0"></span>
                    <span className="text-sm font-semibold text-jb-text-secondary leading-relaxed">{bullet}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm font-semibold text-jb-text-secondary">Aucun détail supplémentaire disponible.</p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-primary-100 bg-primary-50/50 p-4 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStatModalOpen(false)}
            >
              Fermer
            </Button>
            {selectedStatData.detail?.actionTo && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsStatModalOpen(false);
                  navigate(selectedStatData.detail.actionTo);
                }}
              >
                {selectedStatData.detail.actionLabel || 'Ouvrir'}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default AdminDashboard;

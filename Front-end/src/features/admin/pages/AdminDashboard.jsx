import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import { fetchAdminStats } from '../redux/adminSlice';

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { UserGroupIcon, ClockIcon, MapPinIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981'];

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const stats = useSelector(state => state.admin.stats.data);

  const monthlyActivityData = useMemo(
    () => stats?.monthlyActivityData || [],
    [stats]
  );

  const userStatsData = useMemo(
    () => stats?.userStatsData || [],
    [stats]
  );

  const recentActions = useMemo(
    () => stats?.recentActions || [],
    [stats]
  );

  const regionStats = useMemo(
    () => stats?.regionStats || [],
    [stats]
  );

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Tableau de bord Admin</h1>
          <p className="text-gray-400 mt-2">Bienvenue dans votre panel d'administration</p>
        </div>
        
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card 
              className="p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Utilisateurs</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</h3>
                  {stats.totalUsers > 0 && (
                    <div className="flex items-center mt-2">
                      <span className="text-sm font-medium text-green-400">
                        +{((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
                      </span>
                      <span className="text-gray-500 text-sm ml-1">actifs</span>
                    </div>
                  )}
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
            
            <Card 
              className="p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Demandes Validées</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stats.validatedRequests}</h3>
                  <div className="flex items-center mt-2">
                    <span className="text-sm font-medium text-green-400">
                      {stats.validatedRequests}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">demandes validées</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
            
            <Card 
              className="p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(219, 39, 119, 0.15) 100%)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Demandes En Attente</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stats.pendingRequests}</h3>
                  <div className="flex items-center mt-2">
                    <span className="text-sm font-medium text-red-400">
                      {stats.pendingRequests}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">demandes en attente</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
            
            <Card 
              className="p-5"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Établissements</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stats.totalEstablishments}</h3>
                  <div className="flex items-center mt-2">
                    <span className="text-sm font-medium text-green-400">
                      +0%
                    </span>
                    <span className="text-gray-500 text-sm ml-1">aucune modification</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-violet-500/20">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-blue-400" />
                Activité mensuelle
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyActivityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.5rem',
                        backdropFilter: 'blur(10px)'
                      }} 
                      itemStyle={{ color: 'white' }}
                      labelStyle={{ color: 'white' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3B82F6" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                      name="Utilisateurs actifs"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="registrations" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      name="Nouvelles inscriptions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          {/* User Distribution */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2 text-purple-400" />
                Répartition des utilisateurs
              </h2>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userStatsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {userStatsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.5rem',
                        backdropFilter: 'blur(10px)'
                      }} 
                      formatter={(value) => [value, 'Utilisateurs']}
                      labelFormatter={(name) => name}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2 text-green-400" />
              Dernières actions
            </h2>
            <div className="space-y-4">
              {recentActions.map(action => (
                <div key={action.id} className="flex items-start p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200">
                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${action.type === 'create' ? 'bg-green-500' : action.type === 'update' ? 'bg-blue-500' : action.type === 'block' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  <div className="flex-1">
                    <p className="text-gray-300">
                      <span className="font-medium text-white">{action.user}</span> {action.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{action.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Region Stats */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2 text-indigo-400" />
              Statistiques par région
            </h2>
            <div className="space-y-4">
              {regionStats.map((region, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{region.region}</p>
                      <p className="text-xs text-gray-400">{region.users} utilisateurs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-medium">{region.growth}</p>
                    <div className="w-16 h-2 bg-gray-700 rounded-full mt-1">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" 
                        style={{ width: `${Math.min(100, parseInt(region.growth) + 10)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

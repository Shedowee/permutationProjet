import React, { useMemo } from 'react';
import Card from '../../../shared/components/Card';
import { UserGroupIcon, UserPlusIcon, UserMinusIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';

const DashboardStats = () => {
  const adminStats = useSelector((state) => state.admin.stats.data);
  
  const stats = useMemo(() => {
    if (!adminStats) return [];
    const inactiveUsers = Math.max(0, (adminStats.totalUsers || 0) - (adminStats.activeUsers || 0));
    const activeRate = adminStats.totalUsers > 0 
      ? `${((adminStats.activeUsers / adminStats.totalUsers) * 100).toFixed(1)}%`
      : '0%';
    
    return [
      {
        title: 'Total Utilisateurs',
        value: String(adminStats.totalUsers ?? 0),
        change: activeRate,
        icon: UserGroupIcon,
        color: 'blue',
        trend: 'up'
      },
      {
        title: 'Comptes Actifs',
        value: String(adminStats.activeUsers ?? 0),
        change: '+',
        icon: UserPlusIcon,
        color: 'green',
        trend: 'up'
      },
      {
        title: 'Comptes Inactifs',
        value: String(inactiveUsers),
        change: '-',
        icon: UserMinusIcon,
        color: 'red',
        trend: 'down'
      },
      {
        title: 'Demandes Validées',
        value: String(adminStats.validatedRequests ?? 0),
        change: '+',
        icon: ArrowTrendingUpIcon,
        color: 'purple',
        trend: 'up'
      }
    ];
  }, [adminStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card 
            key={index}
            className="p-5"
            style={{
              background: 'linear-gradient(135deg, ' + 
                (stat.color === 'blue' ? 'rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%' :
                 stat.color === 'green' ? 'rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%' :
                 stat.color === 'red' ? 'rgba(239, 68, 68, 0.15) 0%, rgba(219, 39, 119, 0.15) 100%' :
                 'rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%') + ')'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.trend === 'up' ? '+' : ''}{stat.change}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">depuis le mois dernier</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color === 'blue' ? 'from-blue-500/20 to-indigo-500/20' : stat.color === 'green' ? 'from-green-500/20 to-emerald-500/20' : stat.color === 'red' ? 'from-red-500/20 to-pink-500/20' : 'from-purple-500/20 to-violet-500/20'}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;

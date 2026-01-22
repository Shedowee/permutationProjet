import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { Bars3Icon, BellIcon, MagnifyingGlassIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { listLogs } from '../../services/logsService';

const Navbar = ({ onMenuClick, userRole }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const logs = await listLogs();
        const items = logs.slice(0, 5).map((l) => ({
          id: l.id,
          title: `${l.user} - ${l.action}`,
          time: l.date || '',
          read: false,
          type: l.type,
        }));
        if (mounted) setNotifications(items);
      } catch {
        if (mounted) setNotifications([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 md:px-6 lg:px-8 bg-gradient-to-r from-gray-900/80 to-gray-950/80 backdrop-blur-lg border-b border-gray-800 shadow-lg shadow-blue-500/5">
      <div className="flex items-center">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200 mr-2 md:hidden"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        
        {/* Logo for mobile */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Gestion de permuation OFPPT</span>
        </div>
      </div>
      
      {/* Search */}
      <div className="flex-1 max-w-lg mx-4 md:mx-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border-0 bg-white/5 py-1.5 pl-10 pr-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10"
            placeholder="Rechercher..."
          />
        </div>
      </div>
      
      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200 relative"
          >
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl shadow-blue-500/10 z-50">
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border-b border-gray-700 last:border-b-0 ${!notification.read ? 'bg-blue-500/10' : ''}`}
                  >
                    <p className={`font-medium ${!notification.read ? 'text-blue-300' : 'text-gray-300'}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-700 text-center">
                <button className="text-sm text-blue-400 hover:text-blue-300">Voir tout</button>
              </div>
            </div>
          )}
        </div>
        
        {/* User profile */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-white" />
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-300 max-w-[100px] truncate">
              {userRole === 'admin' ? 'Administrateur' : 
               userRole === 'commission' ? 'Commission' : 
               userRole === 'formateur' ? 'Formateur' : 'Utilisateur'}
            </span>
          </button>
          
          {/* Profile dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl shadow-blue-500/10 z-50">
              <div className="p-4 border-b border-gray-700">
                <p className="text-sm text-gray-300 truncate">
                  {user?.name || (userRole === 'admin' ? 'Administrateur' : 
                   userRole === 'commission' ? 'Commission' : 
                   userRole === 'formateur' ? 'Formateur' : 'Utilisateur')}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || `${userRole}@ofppt.ma`}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center space-x-2"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


export default Navbar;

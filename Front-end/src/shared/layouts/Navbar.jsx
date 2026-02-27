import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  Bars3Icon, 
  BellIcon, 
  ShieldCheckIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { getNotifications, markNotificationRead, getUnreadCount } from '../../services/userService';
import { useToast } from '../../shared/context/useToast';

const Navbar = ({ onMenuClick, userRole }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { success, error: toastError } = useToast();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.data);
      const countRes = await getUnreadCount();
      setUnreadCount(countRes.count);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 60 seconds for new notifications
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      success('Déconnexion réussie');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toastError('La déconnexion a échoué');
    }
  };

  return (
    <header className="bg-[#EA580C] text-white sticky top-0 z-[80] w-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-b border-orange-700/30">
      {/* Top Accent Bar */}
      <div className="h-1 bg-white/20 w-full"></div>
      
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Toggle Menu */}
          <button
            onClick={onMenuClick}
            className="p-2.5 rounded-xl text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/20 lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <ShieldCheckIcon className="h-8 w-8 text-[#EA580C]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white tracking-tighter leading-none">OFPPT</span>
              <span className="text-[10px] font-black text-orange-100 uppercase tracking-widest mt-1 opacity-90">Permutations</span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className={`p-2.5 rounded-xl transition-all relative ${notificationsOpen ? 'bg-white/20 text-white shadow-inner' : 'text-white hover:bg-white/10'}`}
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-orange-600 animate-bounce"></span>
              )}
            </button>

            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-secondary-100 overflow-hidden z-20 animate-scaleIn origin-top-right">
                  <div className="p-4 border-b border-secondary-50 flex items-center justify-between bg-secondary-50/50">
                    <h3 className="text-xs font-bold text-secondary-900 uppercase tracking-widest">Notifications</h3>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className={`flex items-start p-4 hover:bg-secondary-50/50 transition-colors border-b border-secondary-50 last:border-0 cursor-pointer ${!n.is_read ? 'bg-primary-50/30' : ''}`}
                        >
                          <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                            n.type === 'system' ? 'bg-amber-100 text-amber-600' :
                            n.type === 'account' ? 'bg-green-100 text-green-600' :
                            'bg-primary-100 text-primary-600'
                          }`}>
                            <BellIcon className="h-4 w-4" />
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <p className={`text-sm font-semibold text-secondary-900 ${!n.is_read ? 'font-black' : ''}`}>{n.title}</p>
                            <p className="text-xs text-secondary-600 mt-1 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-secondary-400 mt-2 font-bold uppercase tracking-widest">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!n.is_read && (
                            <div className="ml-2 w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <BellIcon className="h-8 w-8 text-secondary-200 mx-auto mb-2" />
                        <p className="text-sm text-secondary-500 font-medium">Aucune notification</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center space-x-3 p-1.5 pr-3 rounded-lg hover:bg-secondary-50 transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-secondary-500 flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-secondary-600 transition-colors">
                {(user?.nom || user?.name || "U")[0].toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-bold text-surface-800 leading-none">{user?.nom || user?.name || "Utilisateur"}</p>
                <p className="text-[10px] font-bold text-secondary-600 uppercase tracking-widest mt-1.5">{userRole}</p>
              </div>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-secondary-100 overflow-hidden z-20 animate-scaleIn origin-top-right">
                  <div className="p-4 border-b border-secondary-50 bg-secondary-50/50">
                    <p className="text-sm font-bold text-secondary-900 truncate">{user?.nom || user?.name}</p>
                    <p className="text-xs text-secondary-600 truncate mt-1">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 p-2.5 rounded-lg text-sm font-semibold text-secondary-700 hover:text-primary-600 hover:bg-primary-50 transition-all"
                      onClick={() => setProfileOpen(false)}
                    >
                      <UserIcon className="h-5 w-5" />
                      <span>Mon Profil</span>
                    </Link>
                    {userRole === 'admin' && (
                      <Link
                        to="/admin/settings"
                        className="flex items-center space-x-3 p-2.5 rounded-lg text-sm font-semibold text-secondary-700 hover:text-primary-600 hover:bg-primary-50 transition-all"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Cog6ToothIcon className="h-5 w-5" />
                        <span>Paramètres</span>
                      </Link>
                    )}
                    <hr className="my-2 border-secondary-50" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 p-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

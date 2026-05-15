import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  BellIcon, 
  ShieldCheckIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
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

  const normalizeNotification = (notification) => {
    const payload = notification?.payload || {};

    return {
      id: notification.id,
      title: payload.title || notification.title || "Notification",
      message: payload.message || notification.message || "",
      type: notification.type || "info",
      read_at: notification.read_at || null,
      is_read: Boolean(notification.read_at),
      created_at: notification.created_at || null,
      route: payload.route || null,
    };
  };

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications((res?.data || []).map(normalizeNotification));
      const countRes = await getUnreadCount();
      setUnreadCount(countRes?.count || 0);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await markNotificationRead(notification.id);
      }
      setNotificationsOpen(false);
      if (notification.route) {
        navigate(notification.route);
      } else if (userRole === "admin") {
        navigate(`/admin/notifications/${notification.id}`);
      }
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
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
    <nav className="relative z-[110] w-full bg-gradient-to-r from-primary-950 via-primary-900 to-primary-700 text-white backdrop-blur-xl border-b border-primary-900/40 shadow-[0_18px_48px_-34px_rgba(0,146,69,0.45)]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:pl-[calc(var(--sidebar-width)+1.5rem)] lg:pr-8 transition-[padding-left] duration-300">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-standard"
              aria-label="Ouvrir la navigation"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link to="/" className="ml-2 sm:ml-4 lg:ml-0 flex items-center gap-3 group">
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center ring-1 ring-inset ring-white/20 shadow-[0_18px_34px_-20px_rgba(0,0,0,0.35)] group-hover:scale-105 transition-standard">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-black text-white tracking-tight leading-none">OFPPT</span>
                <span className="text-[10px] font-bold text-primary-100 uppercase tracking-widest mt-1">Permutations</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className={`p-2 rounded-lg transition-standard relative ${notificationsOpen ? 'bg-white/15 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-10" 
                      onClick={() => setNotificationsOpen(false)}
                    ></motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-hard border border-primary-100 overflow-hidden z-20 origin-top-right"
                    >
                      <div className="p-4 border-b border-primary-50 bg-primary-50/70 flex items-center justify-between">
                        <h3 className="text-xs font-black text-surface-900 uppercase tracking-widest">Notifications</h3>
                        {unreadCount > 0 && <span className="px-2 py-0.5 bg-primary-600 text-white rounded-full text-[10px] font-bold">{unreadCount} nouvelles</span>}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`flex items-start p-4 hover:bg-primary-50/50 transition-standard border-b border-primary-50 last:border-0 cursor-pointer ${!n.is_read ? 'bg-primary-50/20' : ''}`}
                            >
                              <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                                n.type === 'system' ? 'bg-amber-100 text-amber-600' :
                                n.type === 'account' ? 'bg-primary-100 text-primary-700' :
                                'bg-primary-100 text-primary-600'
                              }`}>
                                <BellIcon className="h-4 w-4" />
                              </div>
                              <div className="ml-3 flex-1 min-w-0">
                                <p className={`text-sm font-bold text-surface-900 ${!n.is_read ? 'font-black' : ''}`}>{n.title}</p>
                                <p className="text-xs text-surface-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                                <p className="text-[10px] text-surface-400 mt-2 font-bold uppercase tracking-widest">
                                  {n.created_at ? new Date(n.created_at).toLocaleString() : "Date inconnue"}
                                </p>
                              </div>
                              {!n.is_read && (
                                <div className="ml-2 w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center">
                            <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <BellIcon className="h-8 w-8 text-surface-300" />
                            </div>
                            <p className="text-sm text-surface-600 font-black uppercase tracking-widest">Aucune notification</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className={`flex items-center gap-2 p-1 pr-2.5 rounded-lg transition-standard group ${profileOpen ? 'bg-white/15' : 'hover:bg-white/10'}`}
              >
                <div className="h-9 w-9 rounded-lg bg-white text-primary-800 flex items-center justify-center font-black shadow-[0_16px_28px_-18px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-standard">
                  {(user?.nom || user?.name || "U")[0].toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-black text-white leading-none">{user?.nom || user?.name || "Utilisateur"}</p>
                  <p className="text-[10px] font-black text-primary-100 uppercase tracking-[0.2em] mt-1.5">{userRole}</p>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-10" 
                      onClick={() => setProfileOpen(false)}
                    ></motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-hard border border-primary-100 overflow-hidden z-20 origin-top-right"
                    >
                      <div className="p-5 border-b border-primary-50 bg-primary-50/70">
                        <p className="text-sm font-black text-surface-900 truncate">{user?.nom || user?.name}</p>
                        <p className="text-xs text-surface-600 font-bold truncate mt-1">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-surface-700 hover:text-primary-700 hover:bg-primary-50 transition-standard"
                          onClick={() => setProfileOpen(false)}
                        >
                          <UserIcon className="h-5 w-5" />
                          <span>Mon Profil</span>
                        </Link>
                        {userRole === 'admin' && (
                          <Link
                            to="/admin/settings"
                            className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-surface-700 hover:text-primary-700 hover:bg-primary-50 transition-standard"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Cog6ToothIcon className="h-5 w-5" />
                            <span>Paramètres</span>
                          </Link>
                        )}
                        <div className="my-2 border-t border-surface-50" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-standard"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5" />
                          <span>Déconnexion</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;

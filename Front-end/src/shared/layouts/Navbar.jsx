import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  BellIcon, 
  ShieldCheckIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  UserGroupIcon,
  KeyIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { getNotifications, markNotificationRead, getUnreadCount } from '../../services/userService';
import { useToast } from '../../shared/context/useToast';

const Navbar = ({ onMenuClick, userRole, isSidebarOpen }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { success, error: toastError } = useToast();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const getMenuItems = () => {
    const common = [
      { name: "Mon Profil", href: "/profile", icon: UserCircleIcon },
    ];

    if (userRole === "admin") {
      return [
        { name: "Tableau de bord", href: "/admin", icon: HomeIcon },
        { name: "Utilisateurs", href: "/admin/users", icon: UserGroupIcon },
        { name: "Rôles", href: "/admin/roles", icon: KeyIcon },
        { name: "Établissements", href: "/admin/etablissements", icon: BuildingOffice2Icon },
        ...common
      ];
    } else if (userRole === "commission") {
      return [
        { name: "Tableau de bord", href: "/commission", icon: HomeIcon },
        { name: "Demandes", href: "/commission/demandes", icon: ClipboardDocumentListIcon },
        ...common
      ];
    } else if (userRole === "formateur" || userRole === "employe") {
      return [
        { name: "Tableau de bord", href: `/${userRole}`, icon: HomeIcon },
        { name: "Mes Demandes", href: `/${userRole}/demandes`, icon: ClipboardDocumentListIcon },
        { name: "Créer une Demande", href: `/${userRole}/demandes/create`, icon: PlusCircleIcon },
        ...common
      ];
    }
    return common;
  };

  const navigation = getMenuItems();
  
  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res?.data?.data || []);
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

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
    try {
      await logout();
      success('Déconnexion réussie');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toastError('La déconnexion a échoué');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-xl border-b border-surface-100 shadow-soft">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-4">
            {/* Desktop Sidebar Toggle */}
            <button
              onClick={onMenuClick}
              className="hidden lg:flex p-2.5 rounded-xl text-surface-500 hover:text-primary-600 hover:bg-primary-50 transition-standard"
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className={`w-6 h-6 transform transition-transform duration-500 ${isSidebarOpen ? 'rotate-90' : 'rotate-0'}`} />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-surface-500 hover:text-primary-600 hover:bg-primary-50 transition-standard"
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-primary-500 rounded-xl flex items-center justify-center shadow-primary group-hover:scale-105 transition-standard">
                <ShieldCheckIcon className="h-7 w-7 text-white" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-black text-surface-900 tracking-tight leading-none">OFPPT</span>
                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">Permutations</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className={`p-2.5 rounded-xl transition-standard relative ${notificationsOpen ? 'bg-primary-50 text-primary-600' : 'text-surface-500 hover:text-primary-600 hover:bg-primary-50'}`}
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
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
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-hard border border-surface-100 overflow-hidden z-20 origin-top-right"
                    >
                      <div className="p-4 border-b border-surface-50 bg-surface-50/50 flex items-center justify-between">
                        <h3 className="text-xs font-black text-surface-900 uppercase tracking-widest">Notifications</h3>
                        {unreadCount > 0 && <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-[10px] font-bold">{unreadCount} nouvelles</span>}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleMarkRead(n.id)}
                              className={`flex items-start p-4 hover:bg-primary-50/30 transition-standard border-b border-surface-50 last:border-0 cursor-pointer ${!n.is_read ? 'bg-primary-50/10' : ''}`}
                            >
                              <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                                n.type === 'system' ? 'bg-amber-100 text-amber-600' :
                                n.type === 'account' ? 'bg-green-100 text-green-600' :
                                'bg-primary-100 text-primary-600'
                              }`}>
                                <BellIcon className="h-4 w-4" />
                              </div>
                              <div className="ml-3 flex-1 min-w-0">
                                <p className={`text-sm font-bold text-surface-900 ${!n.is_read ? 'font-black' : ''}`}>{n.title}</p>
                                <p className="text-xs text-surface-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                                <p className="text-[10px] text-surface-400 mt-2 font-bold uppercase tracking-widest">
                                  {new Date(n.created_at).toLocaleString()}
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
                className={`flex items-center gap-3 p-1.5 pr-3 rounded-xl transition-standard group ${profileOpen ? 'bg-primary-50' : 'hover:bg-surface-50'}`}
              >
                <div className="h-10 w-10 rounded-xl bg-primary-500 flex items-center justify-center text-white font-black shadow-primary group-hover:scale-105 transition-standard">
                  {(user?.nom || user?.name || "U")[0].toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-black text-surface-900 leading-none">{user?.nom || user?.name || "Utilisateur"}</p>
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mt-1.5">{userRole}</p>
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
                      className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-hard border border-surface-100 overflow-hidden z-20 origin-top-right"
                    >
                      <div className="p-5 border-b border-surface-50 bg-surface-50/50">
                        <p className="text-sm font-black text-surface-900 truncate">{user?.nom || user?.name}</p>
                        <p className="text-xs text-surface-600 font-bold truncate mt-1">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-surface-700 hover:text-primary-600 hover:bg-primary-50 transition-standard"
                          onClick={() => setProfileOpen(false)}
                        >
                          <UserIcon className="h-5 w-5" />
                          <span>Mon Profil</span>
                        </Link>
                        {userRole === 'admin' && (
                          <Link
                            to="/admin/settings"
                            className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-surface-700 hover:text-primary-600 hover:bg-primary-50 transition-standard"
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white shadow-hard z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-primary">
                      <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-black text-surface-900">OFPPT</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-surface-500 hover:bg-surface-50"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest px-4 mb-4">Navigation</p>
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-standard ${
                          active 
                            ? 'bg-primary-500 text-white shadow-primary' 
                            : 'text-surface-600 hover:bg-primary-50 hover:text-primary-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-10 pt-10 border-t border-surface-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 transition-standard"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

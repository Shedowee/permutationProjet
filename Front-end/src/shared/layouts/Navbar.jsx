import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../auth/hooks/useAuth';
import { 
  Bars3Icon, 
  BellIcon, 
  MagnifyingGlassIcon, 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon, 
  XMarkIcon,
  ShieldCheckIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { listLogs } from '../../services/logsService';
import { setSearchTerm, selectSearchTerm, clearSearch } from '../redux/searchSlice';

const Navbar = ({ onMenuClick, userRole, isSidebarOpen }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const searchTerm = useSelector(selectSearchTerm);
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
          time: l.date ? new Date(l.date).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}) : '',
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
    <header className={`fixed top-0 right-0 z-[50] h-20 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-xl border-b border-surface-200 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isSidebarOpen ? "left-72" : "left-20" } lg:left-auto ${isSidebarOpen ? "lg:left-72" : "lg:left-20" }`}>
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-2.5 rounded-xl text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-all mr-4"
          title={isSidebarOpen ? "Réduire le menu" : "Développer le menu"}
        >
          <Bars3Icon className={`w-6 h-6 transition-transform duration-500 ${isSidebarOpen ? "" : "rotate-180"}`} />
        </button>
        
        <div className="hidden md:flex items-center space-x-3 lg:hidden">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg border border-white/10">
            <ShieldCheckIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black text-surface-900 tracking-tighter">OFPPT</span>
        </div>
      </div>
      
      <div className="flex-1"></div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className={`p-2.5 rounded-xl transition-all relative ${notificationsOpen ? 'bg-primary-50 text-primary-600' : 'text-surface-400 hover:text-primary-600 hover:bg-primary-50'}`}
          >
            <BellIcon className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 block h-2.5 w-2.5 rounded-full bg-accent-500 ring-2 ring-white"></span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden z-20 animate-scaleIn origin-top-right">
                <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
                  <h3 className="text-sm font-black text-surface-900 uppercase tracking-widest">Notifications</h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start p-4 hover:bg-surface-50 transition-colors border-b border-surface-50 last:border-0"
                      >
                        <div className={`mt-1 p-2 rounded-lg shrink-0 ${
                          n.type === 'create' ? 'bg-green-100 text-green-600' :
                          n.type === 'delete' ? 'bg-red-100 text-red-600' :
                          'bg-primary-100 text-primary-600'
                        }`}>
                          <ShieldCheckIcon className="h-4 w-4" />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-sm font-bold text-surface-900 truncate">{n.title}</p>
                          <p className="text-xs text-surface-500 mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <BellIcon className="h-8 w-8 text-surface-200 mx-auto mb-2" />
                      <p className="text-sm text-surface-400 font-medium">Aucune notification</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center space-x-3 p-1.5 pr-3 rounded-2xl hover:bg-surface-50 transition-all border border-transparent hover:border-surface-200 group"
          >
            <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
              {(user?.nom || user?.name || "U")[0].toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-black text-surface-900 leading-none">{user?.nom || user?.name || "Utilisateur"}</p>
              <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">{userRole}</p>
            </div>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden z-20 animate-scaleIn origin-top-right">
                <div className="p-4 border-b border-surface-100 bg-surface-50/50">
                  <p className="text-sm font-black text-surface-900 truncate">{user?.nom || user?.name}</p>
                  <p className="text-xs text-surface-500 truncate mt-0.5">{user?.email}</p>
                </div>
                <div className="p-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 p-3 rounded-xl text-sm font-bold text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all"
                    onClick={() => setProfileOpen(false)}
                  >
                    <UserIcon className="h-5 w-5" />
                    <span>Mon Profil</span>
                  </Link>
                  {userRole === 'admin' && (
                    <Link
                      to="/admin/settings"
                      className="flex items-center space-x-3 p-3 rounded-xl text-sm font-bold text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Paramètres</span>
                    </Link>
                  )}
                  <hr className="my-2 border-surface-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
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
    </header>
  );
};

export default Navbar;

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, UserGroupIcon, KeyIcon, DocumentTextIcon, BuildingOffice2Icon, BellIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/hooks/useAuth';

const Sidebar = ({ isOpen, onClose, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Définir les menus en fonction du rôle de l'utilisateur
  const getMenuItems = () => {
    if (userRole === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Utilisateurs', href: '/admin/users', icon: UserGroupIcon },
        { name: 'Rôles & permissions', href: '/admin/roles', icon: KeyIcon },
        { name: 'Logs', href: '/admin/logs', icon: DocumentTextIcon },
        { name: 'Établissements', href: '/admin/etablissements', icon: BuildingOffice2Icon },
      ];
    } else if (userRole === 'commission') {
      return [
        { name: 'Dashboard', href: '/commission', icon: HomeIcon },
        { name: 'Demandes', href: '/commission/demandes', icon: ClipboardDocumentListIcon },
      ];
    } else if (userRole === 'formateur') {
      return [
        { name: 'Dashboard', href: '/formateur', icon: HomeIcon },
        { name: 'Mes Demandes', href: '/formateur/demandes', icon: ClipboardDocumentListIcon },
      ];
    }
    return []; // Retourne un tableau vide si le rôle n'est pas reconnu
  };

  const navigation = getMenuItems();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 shadow-2xl shadow-blue-500/10 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AdminPanel</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.href) ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Settings and Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="space-y-2">
            <Link
              to="/admin/settings"
              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              <Cog6ToothIcon className="w-5 h-5 mr-3" />
              <span>Paramètres</span>
            </Link>
            <button
              className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
              onClick={async () => {
                try {
                  await logout();
                } finally {
                  navigate('/login', { replace: true });
                }
              }}
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

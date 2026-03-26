import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  UserGroupIcon,
  KeyIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  UserCircleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../auth/hooks/useAuth";

const Sidebar = ({ isOpen, onClose, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

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
        { name: "Paramètres", href: "/admin/settings", icon: Cog6ToothIcon },
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
  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`hidden lg:flex flex-col sticky top-20 h-[calc(100vh-5rem)] bg-white border-r border-surface-100 transition-standard z-40 ${
        isOpen ? "w-72" : "w-24"
      }`}
    >
      {/* Sidebar Header/User Info */}
      <div className={`p-6 border-b border-surface-50 transition-standard ${isOpen ? "opacity-100" : "px-4"}`}>
        <div className={`flex items-center gap-4 ${!isOpen && "justify-center"}`}>
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white font-black shadow-primary">
              {(user?.nom || user?.name || "U")[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-sm font-black text-surface-900 truncate">
                {user?.nom || user?.name || "Utilisateur"}
              </span>
              <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-0.5">
                {userRole}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {isOpen && (
          <p className="px-4 text-[10px] font-black text-surface-500 uppercase tracking-widest mb-6">Menu Principal</p>
        )}
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center rounded-2xl transition-standard relative
                ${isOpen ? "px-4 py-3.5" : "p-3.5 justify-center"}
                ${active 
                  ? "bg-primary-500 text-white shadow-primary" 
                  : "text-surface-600 hover:bg-primary-50 hover:text-primary-600"
                }
              `}
              title={!isOpen ? item.name : ""}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-standard ${active ? "text-white" : "group-hover:scale-110"}`} />
              {isOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-4 text-sm font-bold truncate"
                >
                  {item.name}
                </motion.span>
              )}
              {active && isOpen && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-surface-50">
        <button
          onClick={async () => {
            try {
              await logout();
            } finally {
              navigate("/login", { replace: true });
            }
          }}
          className={`
            w-full flex items-center rounded-2xl transition-standard text-red-600 hover:bg-red-50
            ${isOpen ? "px-4 py-3.5" : "p-3.5 justify-center"}
          `}
          title={!isOpen ? "Déconnexion" : ""}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
          {isOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-4 text-sm font-bold"
            >
              Déconnexion
            </motion.span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

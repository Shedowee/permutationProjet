import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
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

const Sidebar = ({ isOpen, onClose, onToggle, userRole }) => {
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
    <>
      <aside
        className="hidden lg:flex fixed left-0 top-0 bottom-0 flex-col bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800 text-white border-r border-primary-900/40 transition-[width,transform] duration-300 ease-in-out z-[130] shadow-[0_30px_80px_-44px_rgba(0,146,69,0.30)] overflow-hidden flex-shrink-0"
        style={{ width: isOpen ? "16rem" : "5rem" }}
        aria-label="Navigation latérale"
      >
        <div className={`h-16 shrink-0 border-b border-white/10 px-3 flex items-center ${isOpen ? "justify-between" : "justify-center"}`}>
          {isOpen && (
            <span className="text-[10px] font-black text-primary-100 uppercase tracking-[0.24em]">
              Navigation
            </span>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-standard"
            aria-label={isOpen ? "Réduire la navigation" : "Ouvrir la navigation"}
            title={isOpen ? "Réduire la navigation" : "Ouvrir la navigation"}
          >
            <Bars3Icon className={`w-5 h-5 transform transition-transform duration-500 ${isOpen ? "rotate-90" : "rotate-0"}`} />
          </button>
        </div>
        {/* Sidebar Header/User Info */}
        <div className={`p-4 border-b border-white/10 transition-standard ${isOpen ? "opacity-100" : "px-3"}`}>
          <div className={`flex items-center gap-3 ${!isOpen && "justify-center"}`}>
            <div className="relative shrink-0">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-white font-black ring-1 ring-inset ring-white/15 shadow-[0_18px_34px_-20px_rgba(0,0,0,0.35)]">
                {(user?.nom || user?.name || "U")[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary-300 border-2 border-primary-950 rounded-full"></div>
            </div>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col min-w-0"
              >
                <span className="text-sm font-black text-white truncate">
                  {user?.nom || user?.name || "Utilisateur"}
                </span>
                <span className="text-[10px] font-bold text-primary-100 uppercase tracking-widest mt-0.5">
                  {userRole}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto custom-scrollbar overscroll-contain">
          {isOpen && (
            <p className="px-3 text-[10px] font-black text-primary-100 uppercase tracking-widest mb-4">Menu Principal</p>
          )}
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center rounded-xl transition-standard relative
                  ${isOpen ? "px-3 py-2.5" : "p-3 justify-center"}
                  ${active 
                    ? "bg-white/15 text-white shadow-[0_18px_34px_-20px_rgba(0,0,0,0.25)] ring-1 ring-inset ring-white/10" 
                    : "text-primary-100 hover:bg-white/10 hover:text-white"
                  }
                `}
                title={!isOpen ? item.name : ""}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-standard ${active ? "text-white" : "group-hover:scale-110"}`} />
                {isOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-3 text-sm font-bold truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
                {active && isOpen && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-100"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <button
            onClick={async () => {
              try {
                await logout();
              } finally {
                navigate("/login", { replace: true });
              }
            }}
            className={`
              w-full flex items-center rounded-xl transition-standard text-red-600 hover:bg-red-50
              ${isOpen ? "px-3 py-2.5" : "p-3 justify-center"}
            `}
            title={!isOpen ? "Déconnexion" : ""}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="ml-3 text-sm font-bold"
              >
                Déconnexion
              </motion.span>
            )}
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[115] bg-surface-900/45 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 z-[120] w-[82vw] max-w-xs bg-gradient-to-b from-primary-950 via-primary-900 to-primary-800 text-white border-r border-primary-900/40 shadow-[0_30px_80px_-44px_rgba(0,146,69,0.30)] overflow-hidden lg:hidden"
              aria-label="Navigation mobile"
            >
              <div className="h-20 shrink-0 border-b border-white/10 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-white font-black ring-1 ring-inset ring-white/15">
                    {(user?.nom || user?.name || "U")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white truncate">{user?.nom || user?.name || "Utilisateur"}</p>
                    <p className="text-[10px] font-bold text-primary-100 uppercase tracking-widest truncate">{userRole}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-standard"
                  aria-label="Fermer la navigation"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto custom-scrollbar overscroll-contain">
                <p className="px-3 text-[10px] font-black text-primary-100 uppercase tracking-widest mb-4">Menu Principal</p>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center rounded-xl transition-standard relative px-3 py-2.5
                        ${active 
                          ? "bg-white/15 text-white shadow-[0_18px_34px_-20px_rgba(0,0,0,0.25)] ring-1 ring-inset ring-white/10" 
                          : "text-primary-100 hover:bg-white/10 hover:text-white"
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 shrink-0 transition-standard ${active ? "text-white" : "group-hover:scale-110"}`} />
                      <span className="ml-3 text-sm font-bold truncate">{item.name}</span>
                      {active && (
                        <motion.div 
                          layoutId="sidebar-mobile-active"
                          className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary-100"
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-3 border-t border-white/10 bg-white/5 backdrop-blur-sm">
                <button
                  onClick={async () => {
                    try {
                      await logout();
                    } finally {
                      navigate("/login", { replace: true });
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-standard"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

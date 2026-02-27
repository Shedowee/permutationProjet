import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  KeyIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  UserCircleIcon,
  ShieldCheckIcon
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
        { name: "Dashboard", href: "/admin", icon: HomeIcon },
        { name: "Utilisateurs", href: "/admin/users", icon: UserGroupIcon },
        { name: "Rôles & permissions", href: "/admin/roles", icon: KeyIcon },
        { name: "Établissements", href: "/admin/etablissements", icon: BuildingOffice2Icon },
        ...common
      ];
    } else if (userRole === "commission") {
      return [
        { name: "Dashboard", href: "/commission", icon: HomeIcon },
        { name: "Demandes", href: "/commission/demandes", icon: ClipboardDocumentListIcon },
        ...common
      ];
    } else if (userRole === "formateur" || userRole === "employe") {
      return [
        { name: "Dashboard", href: `/${userRole}`, icon: HomeIcon },
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
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-gray-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-[70] h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] bg-white border-r border-surface-200 flex flex-col shadow-xl 
        ${isOpen ? "w-72 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"} 
        lg:static lg:inset-0`}
      >
        {/* Logo Section */}
        <div className="flex items-center h-20 px-6 border-b border-surface-100 overflow-hidden">
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 border border-white/10 shrink-0">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            {isOpen && (
              <div className="flex flex-col animate-fadeIn">
                <span className="text-lg font-black text-surface-900 tracking-tighter leading-none">OFPPT</span>
                <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">Permutations</span>
              </div>
            )}
          </div>
        </div>

        {/* User Quick Profile */}
        <div className="px-4 py-8">
          <div className={`p-3 rounded-2xl bg-surface-50 border border-surface-200 flex items-center group hover:border-primary-500/30 transition-all ${isOpen ? "space-x-3" : "justify-center"}`}>
            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary-600 font-bold border border-surface-200 shrink-0">
              {(user?.nom || user?.name || "U")[0].toUpperCase()}
            </div>
            {isOpen && (
              <div className="flex flex-col min-w-0 animate-fadeIn">
                <span className="text-sm font-bold text-surface-900 truncate">{user?.nom || user?.name || "Utilisateur"}</span>
                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">{userRole}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {isOpen && (
            <p className="px-4 text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] mb-4 mt-2 animate-fadeIn">Menu Principal</p>
          )}
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden
                  ${isOpen ? "px-4 py-3.5" : "p-3.5 justify-center"}
                  ${active 
                    ? "bg-primary-50 text-primary-600 border border-primary-100 shadow-sm" 
                    : "text-surface-500 hover:text-surface-900 hover:bg-surface-50 border border-transparent"
                  }
                `}
                title={!isOpen ? item.name : ""}
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                {active && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary-500 rounded-r-full"></div>}
                <Icon className={`w-5 h-5 transition-colors shrink-0 ${isOpen ? "mr-3" : ""} ${active ? "text-primary-600" : "group-hover:text-primary-600"}`} />
                {isOpen && <span className="animate-fadeIn truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions Section */}
        <div className="p-4 border-t border-surface-100 space-y-2">
          {userRole === "admin" && (
            <Link
              to="/admin/settings"
              className={`flex items-center rounded-xl text-sm font-bold text-surface-500 hover:text-surface-900 hover:bg-surface-50 transition-all ${isOpen ? "px-4 py-3" : "p-3 justify-center"}`}
              title={!isOpen ? "Paramètres" : ""}
            >
              <Cog6ToothIcon className={`w-5 h-5 shrink-0 ${isOpen ? "mr-3" : ""}`} />
              {isOpen && <span className="animate-fadeIn">Paramètres</span>}
            </Link>
          )}
          <button
            className={`w-full flex items-center rounded-xl text-sm font-bold text-red-500/70 hover:text-red-600 hover:bg-red-50 transition-all group ${isOpen ? "px-4 py-3" : "p-3 justify-center"}`}
            title={!isOpen ? "Déconnexion" : ""}
            onClick={async () => {
              try {
                await logout();
              } finally {
                navigate("/login", { replace: true });
              }
            }}
          >
            <ArrowRightOnRectangleIcon className={`w-5 h-5 shrink-0 transition-transform ${isOpen ? "mr-3 group-hover:-translate-x-1" : ""}`} />
            {isOpen && <span className="animate-fadeIn">Déconnexion</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

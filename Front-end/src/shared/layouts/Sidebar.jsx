import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
        { name: "Rôles & permissions", href: "/admin/roles", icon: KeyIcon },
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
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-neutral-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 z-[70] h-[calc(100vh-5rem)] transition-all duration-300 ease-in-out bg-white border-r border-neutral-200 flex flex-col shadow-sm
        ${isOpen ? "w-72 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"} 
        lg:sticky lg:top-20 lg:self-start lg:translate-x-0`}
      >
        {/* User Quick Info */}
        {isOpen && (
          <div className="px-6 py-8 border-b border-secondary-50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-secondary-50 border border-secondary-100 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold shrink-0">
                {(user?.nom || user?.name || "U")[0].toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-surface-800 truncate leading-tight">
                  {user?.nom || user?.name || "Utilisateur"}
                </span>
                <span className="text-[10px] font-bold text-secondary-600 uppercase tracking-widest mt-1">
                  {userRole}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {isOpen && (
            <p className="px-4 text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-4">Menu Principal</p>
          )}
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center rounded-lg text-sm font-semibold transition-all duration-300 relative
                  ${isOpen ? "px-4 py-3" : "p-3 justify-center"}
                  ${active 
                    ? "bg-primary-50 text-primary-600 border border-primary-100 shadow-sm" 
                    : "text-secondary-700 hover:text-primary-600 hover:bg-primary-50 border border-transparent"
                  }
                `}
                title={!isOpen ? item.name : ""}
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <Icon className={`w-5 h-5 transition-colors shrink-0 ${isOpen ? "mr-3" : ""} ${active ? "text-primary-600" : "group-hover:text-primary-600"}`} />
                {isOpen && <span className="truncate">{item.name}</span>}
                {active && isOpen && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions Section */}
        <div className="p-4 border-t border-secondary-50 bg-secondary-50/30">
          <button
            className={`w-full flex items-center rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-all ${isOpen ? "px-4 py-3" : "p-3 justify-center"}`}
            title={!isOpen ? "Déconnexion" : ""}
            onClick={async () => {
              try {
                await logout();
              } finally {
                navigate("/login", { replace: true });
              }
            }}
          >
            <ArrowRightOnRectangleIcon className={`w-5 h-5 shrink-0 transition-transform ${isOpen ? "mr-3" : ""}`} />
            {isOpen && <span className="truncate">Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

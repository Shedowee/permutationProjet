import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import TechBackground from "../components/TechBackground";
import { ExclamationTriangleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { DashboardSurfaceContext } from "../context/DashboardSurfaceContextBase";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const { role: userRole, user } = useAuth();

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const showVerificationBanner = user && !user.email_verified_at;

  const sidebarWidthClass = sidebarOpen ? "lg:[--sidebar-width:16rem]" : "lg:[--sidebar-width:5rem]";

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden bg-[var(--dashboard-shell-bg)] text-surface-900 antialiased ${sidebarWidthClass}`}
      style={{ "--dashboard-shell-bg": "radial-gradient(circle_at_top_left,rgba(24,168,116,0.13),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_24%),linear-gradient(135deg,#eef2f7_0%,#e4efe8_46%,#d4e5da_100%)" }}
    >
      <TechBackground />
      
      {/* Verification Warning Banner */}
      {showVerificationBanner && (
        <div 
          className="bg-amber-100 border-b border-amber-200 text-amber-800 py-3 px-6 flex items-center justify-center space-x-3 cursor-pointer hover:bg-amber-200 transition-colors z-[100] sticky top-0"
          onClick={() => navigate("/verify-email")}
        >
          <div className="bg-amber-500 p-1 rounded-lg text-white">
            <ExclamationTriangleIcon className="h-4 w-4 animate-pulse" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest flex items-center">
            Votre adresse email n'est pas encore vérifiée. 
            <span className="hidden sm:inline-block ml-2 px-3 py-1 bg-amber-500 text-white rounded-full text-[9px] hover:bg-amber-600 transition-colors">
              Vérifier mon compte
            </span>
          </p>
        </div>
      )}

      {/* Full-width Header */}
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole={userRole}
      />

      <DashboardSurfaceContext.Provider value={true}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          userRole={userRole}
        />

        <div className="dashboard-surface surface-page relative z-10 min-h-[calc(100vh-4rem)]">
          <div className="lg:pl-[var(--sidebar-width)] transition-[padding-left] duration-300">
            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 transition-standard bg-transparent">
              <div className="flex-1 p-3 sm:p-5 lg:p-6 xl:p-8 max-w-full overflow-x-hidden">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {children}
                </motion.div>
              </div>
            </main>

            {/* Footer Section */}
            <footer className="mt-auto bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white border-t border-primary-900/40 py-6 z-10">
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="col-span-1 md:col-span-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center ring-1 ring-inset ring-white/15 shadow-[0_18px_34px_-20px_rgba(0,0,0,0.35)]">
                        <ShieldCheckIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-lg font-black text-white tracking-tight">OFPPT</span>
                    </div>
                    <p className="text-[11px] font-bold text-primary-100 uppercase tracking-widest leading-relaxed">
                      Système de gestion des permutations professionnelles.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Navigation</h4>
                    <ul className="space-y-1.5">
                      <li><Link to="/" className="text-sm font-bold text-primary-100 hover:text-white transition-standard">Accueil</Link></li>
                      <li><Link to="/profile" className="text-sm font-bold text-primary-100 hover:text-white transition-standard">Profil</Link></li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Support</h4>
                    <ul className="space-y-1.5">
                      <li><a href="#" className="text-sm font-bold text-primary-100 hover:text-white transition-standard">Centre d'aide</a></li>
                      <li><a href="#" className="text-sm font-bold text-primary-100 hover:text-white transition-standard">Contact</a></li>
                    </ul>
                  </div>

                  <div className="space-y-3 text-left md:text-right">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Légal</h4>
                    <ul className="space-y-1.5">
                      <li><a href="#" className="text-sm font-bold text-primary-100 hover:text-white transition-standard">Confidentialité</a></li>
                      <li><a href="#" className="text-sm font-bold text-primary-100 hover:text-white transition-standard">Mentions légales</a></li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3">
                  <p className="text-[11px] font-black text-primary-100 uppercase tracking-widest">
                    © 2024 Office de la Formation Professionnelle et de la Promotion du Travail
                  </p>
                  <div className="flex gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-300"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </DashboardSurfaceContext.Provider>
    </div>
  );
};

export default Layout;

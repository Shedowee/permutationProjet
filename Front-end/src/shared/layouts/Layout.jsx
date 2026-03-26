import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import TechBackground from "../components/TechBackground";
import { ExclamationTriangleIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

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

  return (
    <div className="flex flex-col min-h-screen text-surface-900 antialiased relative">
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
        isSidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar below header */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={userRole}
        />
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 transition-standard bg-surface-50/30">
          <div className="flex-1 p-3 sm:p-6 lg:p-8 xl:p-10 max-w-full overflow-x-hidden">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
      
      {/* Footer Section */}
      <footer className="bg-white border-t border-surface-100 py-12 z-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="col-span-1 md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-primary">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black text-surface-900 tracking-tight">OFPPT</span>
              </div>
              <p className="text-xs font-bold text-surface-600 uppercase tracking-widest leading-relaxed">
                Système de gestion des permutations professionnelles.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-black text-surface-900 uppercase tracking-widest">Navigation</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-sm font-bold text-surface-600 hover:text-primary-600 transition-standard">Accueil</Link></li>
                <li><Link to="/profile" className="text-sm font-bold text-surface-600 hover:text-primary-600 transition-standard">Profil</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-surface-900 uppercase tracking-widest">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm font-bold text-surface-600 hover:text-primary-600 transition-standard">Centre d'aide</a></li>
                <li><a href="#" className="text-sm font-bold text-surface-600 hover:text-primary-600 transition-standard">Contact</a></li>
              </ul>
            </div>

            <div className="space-y-4 text-left md:text-right">
              <h4 className="text-xs font-black text-surface-900 uppercase tracking-widest">Légal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm font-bold text-surface-600 hover:text-primary-600 transition-standard">Confidentialité</a></li>
                <li><a href="#" className="text-sm font-bold text-surface-600 hover:text-primary-600 transition-standard">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-surface-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-black text-surface-500 uppercase tracking-widest">
              © 2024 Office de la Formation Professionnelle et de la Promotion du Travail
            </p>
            <div className="flex gap-6">
              <span className="w-2 h-2 rounded-full bg-primary-500"></span>
              <span className="w-2 h-2 rounded-full bg-secondary-500"></span>
              <span className="w-2 h-2 rounded-full bg-accent-500"></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

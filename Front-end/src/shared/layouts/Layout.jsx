import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import TechBackground from "../components/TechBackground";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
          className="bg-amber-500 text-white py-2 px-6 flex items-center justify-center space-x-3 cursor-pointer hover:bg-amber-600 transition-colors z-[100] shadow-md sticky top-0"
          onClick={() => navigate("/verify-email")}
        >
          <ExclamationTriangleIcon className="h-5 w-5 animate-pulse" />
          <p className="text-xs font-black uppercase tracking-widest">
            Votre adresse email n'est pas encore vérifiée. <span className="underline decoration-2 underline-offset-4 ml-2">Cliquez ici pour vérifier votre compte</span>
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
        <main className="flex-1 overflow-y-auto custom-scrollbar h-[calc(100vh-5rem)]">
          <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full animate-fadeIn relative z-10">
            {children}
          </div>
        </main>
      </div>
      
      {/* Formal Footer */}
      <footer className="bg-[#EA580C] text-white py-8 border-t border-orange-700/30 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-black tracking-tighter uppercase">OFPPT • Permutations</span>
            </div>
            <p className="text-orange-100 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
              Système de gestion des mouvements du personnel
            </p>
          </div>
          
          <p className="text-white text-xs font-black uppercase tracking-widest text-center md:text-left opacity-90">
            © 2024 Office de la Formation Professionnelle et de la Promotion du Travail
          </p>
          
          <div className="flex space-x-8 text-white text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-orange-200 transition-colors underline-offset-4 hover:underline">Aide</a>
            <a href="#" className="hover:text-orange-200 transition-colors underline-offset-4 hover:underline">Contact</a>
            <a href="#" className="hover:text-orange-200 transition-colors underline-offset-4 hover:underline">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

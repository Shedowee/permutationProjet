import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  // Persistence du statut de la barre latérale
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const { role: userRole } = useAuth();

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-surface-900 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-primary-100/30 blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-accent-100/20 blur-[120px]"></div>
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
      />

      <div className="flex flex-col flex-1 w-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] relative z-10">
        <Navbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userRole={userRole}
          isSidebarOpen={sidebarOpen}
        />

        <main className="flex-1 overflow-y-auto pt-20">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

import React, { useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role: userRole } = useAuth();

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
      />

      <div className="flex flex-col flex-1 w-full">
        <Navbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          userRole={userRole}
        />

        <main className="flex-1 overflow-y-auto pt-16 bg-gradient-to-b from-gray-900/50 to-gray-950/50">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

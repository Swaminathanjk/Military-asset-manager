import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex bg-[#1c281c] min-h-screen text-white font-[Rajdhani]">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        className="bg-[#2c3a2c] border-r border-green-700 shadow-lg"
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 bg-[#182218] min-h-screen ${
          sidebarOpen ? "ml-64" : "ml-0"
        } lg:ml-64`}
      >
        <Navbar
          onToggleSidebar={toggleSidebar}
          className="bg-[#2f422f] border-b border-green-600 shadow-md"
        />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

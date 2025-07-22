import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { colorPalette } from "../colors";
import {
  Briefcase,
  Newspaper,
  Image,
  MapPin,
  Info,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

const Sidebar = () => {
  const location = useLocation();
  const { isCollapsed, isMobile, isOpen, toggleSidebar, closeSidebar } =
    useSidebar();
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/dashboard/umkm", label: "UMKM", icon: Briefcase },
    { path: "/dashboard/news", label: "Berita", icon: Newspaper },
    { path: "/dashboard/gallery", label: "Galeri", icon: Image },
    { path: "/dashboard/general-info", label: "Info Umum", icon: Info },
  ];

  // PERBAIKAN: Logika width sidebar berdasarkan platform
  // Mobile: selalu full width (w-64) ketika terbuka, hidden ketika tertutup
  // Desktop: w-64 ketika expanded, w-16 ketika collapsed
  const getSidebarWidth = () => {
    if (isMobile) {
      return "w-64"; // Selalu full width di mobile ketika terbuka
    }
    return isCollapsed ? "w-16" : "w-64";
  };

  // PERBAIKAN: Transform berdasarkan platform
  const sidebarTransform = isMobile
    ? isOpen
      ? "translate-x-0"
      : "-translate-x-full"
    : "translate-x-0";

  // PERBAIKAN: Tentukan apakah konten sidebar harus disembunyikan
  const shouldHideContent = () => {
    if (isMobile) {
      return false; // Di mobile, selalu tampilkan konten penuh ketika terbuka
    }
    return isCollapsed; // Di desktop, sembunyikan konten ketika collapsed
  };

  const isContentHidden = shouldHideContent();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Floating Toggle Button - Mobile (mengikuti sistem desktop) */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-5 bg-emerald-600 text-white rounded-full p-2.5 shadow-lg hover:bg-emerald-700 transition-all duration-300 z-50 hover:scale-110 ${
            isOpen ? "left-[272px]" : "left-4"
          }`}
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Floating Toggle Button - Desktop */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-5 bg-emerald-600 text-white rounded-full p-2.5 shadow-lg hover:bg-emerald-700 transition-all duration-300 z-50 hover:scale-110 ${
            isCollapsed ? "left-20" : "left-[272px]"
          }`} // Changed from left-72 to left-[272px] when sidebar is open
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${getSidebarWidth()} bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl h-full fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out ${sidebarTransform}`}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-4 border-b border-emerald-500">
          <Link to="/dashboard" className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-600 font-bold text-xl">P</span>
            </div>

            {/* Title - Hidden when collapsed di desktop, selalu tampil di mobile */}
            <div
              className={`ml-3 transition-all duration-300 ${
                isContentHidden
                  ? "opacity-0 w-0 overflow-hidden"
                  : "opacity-100"
              }`}
            >
              <h2 className="text-white font-bold text-lg leading-tight whitespace-nowrap">
                Admin Panel
              </h2>
              <p className="text-emerald-100 text-xs whitespace-nowrap">
                Padukuhan Pakel
              </p>
            </div>
          </Link>
        </div>

        {/* User Profile Section */}
        <div className="px-4 py-4 border-b border-slate-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-slate-300" />
            </div>

            {/* User Info - Hidden when collapsed di desktop, selalu tampil di mobile */}
            <div
              className={`ml-3 transition-all duration-300 ${
                isContentHidden
                  ? "opacity-0 w-0 overflow-hidden"
                  : "opacity-100"
              }`}
            >
              <p className="text-white font-medium text-sm whitespace-nowrap">
                Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-2">
          {/* Section Title - Hidden when collapsed di desktop, selalu tampil di mobile */}
          {!isContentHidden && (
            <div className="mb-4">
              <p className="text-slate-400 text-xs uppercase tracking-wider px-3 mb-2">
                Main Navigation
              </p>
            </div>
          )}

          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isHovered = hoveredItem === item.path;

              return (
                <div key={item.path} className="relative">
                  <Link
                    to={item.path}
                    onClick={isMobile ? closeSidebar : undefined}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`flex items-center px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 group relative ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {/* Icon */}
                    <item.icon
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white"
                      }`}
                    />

                    {/* Label - Hidden when collapsed di desktop, selalu tampil di mobile */}
                    <span
                      className={`ml-3 transition-all duration-300 whitespace-nowrap ${
                        isContentHidden
                          ? "opacity-0 w-0 overflow-hidden"
                          : "opacity-100"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Active Indicator - Hanya tampil ketika label tampil */}
                    {isActive && !isContentHidden && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}

                    {/* Active Indicator for Collapsed State - Hanya di desktop collapsed */}
                    {isActive && isContentHidden && !isMobile && (
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </Link>

                  {/* Tooltip for Collapsed State - Hanya di desktop collapsed */}
                  {!isMobile && isContentHidden && isHovered && (
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap z-50 border border-slate-600">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-slate-800"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer - Hidden when collapsed di desktop, selalu tampil di mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <p
            className={`text-slate-500 text-xs text-center transition-all duration-300 ${
              isContentHidden ? "opacity-0" : "opacity-100"
            }`}
          >
            © 2025 Padukuhan Pakel
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

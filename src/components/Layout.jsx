// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useSidebar } from "../context/SidebarContext";

const Layout = () => {
  const { isCollapsed, isMobile } = useSidebar();

  // Dynamic classes based on sidebar state
  const getContentClasses = () => {
    let classes = "admin-content";

    if (isMobile) {
      classes += " mobile";
    } else if (isCollapsed) {
      classes += " collapsed";
    }

    return classes;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar />
      <div className={getContentClasses()}>
        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;

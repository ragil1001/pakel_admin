import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { colorPalette } from "../colors";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { logoutAdmin } from "../utils/firebaseUtils";
import { translate } from "../utils/translations";

const Navbar = () => {
  const { user, userSettings } = useAuth();
  const { isCollapsed, isMobile } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getLeftMargin = () => {
    if (isMobile) return "left-0";
    return isCollapsed ? "left-16" : "left-64";
  };

  return (
    <nav
      className={`bg-white shadow-md border-b fixed top-0 right-0 z-40 transition-all duration-300 ${getLeftMargin()}`}
    >
      <div className="flex justify-between items-center px-4 sm:px-6 py-3">
        <div className="flex items-center pl-11 sm:pl-15">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {translate("dashboard", userSettings.language)}
            </h1>
            <p className="text-sm text-gray-500 hidden sm:block">
              {translate("system_info", userSettings.language)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user && (
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {translate("administrator", userSettings.language)}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {translate("profile", userSettings.language)}
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {translate("settings", userSettings.language)}
                  </Link>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {translate("logout", userSettings.language)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

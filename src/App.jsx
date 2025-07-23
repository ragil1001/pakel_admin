import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManageUmkm from "./pages/ManageUmkm";
import ManageNews from "./pages/ManageNews";
import ManageGallery from "./pages/ManageGallery";
import ActivityLog from "./pages/ActivityLog";
import AdminProfile from "./pages/AdminProfile";
import AdminSettings from "./pages/AdminSettings";
import { colorPalette } from "./colors";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";
import { ToastContainer } from "react-toastify";
import { logoutAdmin } from "./utils/firebaseUtils";
import "react-toastify/dist/ReactToastify.css";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const { user, globalSettings } = useAuth();
  const { isCollapsed, isMobile } = useSidebar();

  const isLoginPage = location.pathname === "/";

  // Session Timeout Implementation
  useEffect(() => {
    if (!user || isLoginPage) return;

    let timeoutId;
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logoutAdmin().then(() => {
          window.location.href = "/"; // Redirect to login page
        });
      }, globalSettings.sessionTimeout * 60 * 1000); // Convert minutes to milliseconds
    };

    // Reset timeout on user activity
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimeout);
    });

    resetTimeout(); // Initialize timeout

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [user, globalSettings.sessionTimeout, isLoginPage]);

  const getMainMargin = () => {
    if (isLoginPage) return "";
    if (isMobile) return "";
    return isCollapsed ? "ml-16" : "ml-64";
  };

  const getContentPadding = () => {
    if (isLoginPage) return "";
    return "pt-24 px-6";
  };

  return (
    <div
      className="min-h-screen font-inter flex flex-col"
      style={{ backgroundColor: colorPalette.background }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {!isLoginPage && <Navbar />}
      <div className="flex flex-grow">
        {!isLoginPage && <Sidebar />}
        <main
          className={`flex-grow transition-all duration-300 ${getMainMargin()} ${getContentPadding()}`}
        >
          <div className="max-w-full">
            <ErrorBoundary>
              <Routes location={location}>
                <Route
                  path="/"
                  element={
                    user ? <Navigate to="/dashboard" replace /> : <Login />
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/profile"
                  element={
                    <ProtectedRoute>
                      <AdminProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/settings"
                  element={
                    <ProtectedRoute>
                      <AdminSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/umkm"
                  element={
                    <ProtectedRoute>
                      <ManageUmkm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/news"
                  element={
                    <ProtectedRoute>
                      <ManageNews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/gallery"
                  element={
                    <ProtectedRoute>
                      <ManageGallery />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/activities"
                  element={
                    <ProtectedRoute>
                      <ActivityLog />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </ErrorBoundary>
          </div>
        </main>
      </div>
      {!isLoginPage && <Footer />}
    </div>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </AuthProvider>
  </Router>
);

export default App;

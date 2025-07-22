// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  User,
  TrendingUp,
  Newspaper,
  Camera,
  Building,
  Activity,
  Clock,
  Plus,
  Edit,
  MapPin,
  Info,
  LogIn,
  LogOut,
  Trash2,
  RefreshCw,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  getUmkms,
  getNews,
  getGallery,
  getActivities,
} from "../utils/firebaseUtils";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    umkm: 0,
    news: 0,
    gallery: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [umkmData, newsData, galleryData] = await Promise.all([
          getUmkms(),
          getNews(),
          getGallery(),
        ]);

        setStats({
          umkm: umkmData.length,
          news: newsData.length,
          gallery: galleryData.length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      setActivitiesLoading(true);
      try {
        const activities = await getActivities(15); // Get last 15 activities
        setRecentActivities(activities);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Activity refresh handler
  const refreshActivities = async () => {
    setActivitiesLoading(true);
    try {
      const activities = await getActivities(15);
      setRecentActivities(activities);
    } catch (error) {
      console.error("Failed to refresh activities:", error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Get activity icon based on action and type
  const getActivityIcon = (action, type) => {
    if (action === "login") return LogIn;
    if (action === "logout") return LogOut;
    if (action === "delete") return Trash2;
    if (action === "create") {
      switch (type) {
        case "umkm":
          return Building;
        case "news":
          return Newspaper;
        case "gallery":
          return Camera;
        case "location":
          return MapPin;
        case "generalInfo":
          return Info;
        default:
          return Plus;
      }
    }
    if (action === "update") return Edit;
    return Activity;
  };

  // Get activity color based on action
  const getActivityColor = (action) => {
    switch (action) {
      case "create":
        return "text-green-600 bg-green-100";
      case "update":
        return "text-blue-600 bg-blue-100";
      case "delete":
        return "text-red-600 bg-red-100";
      case "login":
        return "text-emerald-600 bg-emerald-100";
      case "logout":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-purple-600 bg-purple-100";
    }
  };

  // Get action text in Indonesian
  const getActionText = (action) => {
    switch (action) {
      case "create":
        return "Membuat";
      case "update":
        return "Memperbarui";
      case "delete":
        return "Menghapus";
      case "login":
        return "Masuk";
      case "logout":
        return "Keluar";
      default:
        return "Melakukan";
    }
  };

  // Get type text in Indonesian
  const getTypeText = (type) => {
    switch (type) {
      case "umkm":
        return "UMKM";
      case "news":
        return "Berita";
      case "gallery":
        return "Galeri";
      case "location":
        return "Lokasi";
      case "generalInfo":
        return "Informasi";
      case "auth":
        return "Sistem";
      default:
        return type;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Baru saja";

    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const quickActions = [
    {
      title: "Tambah UMKM",
      description: "Daftarkan UMKM baru",
      icon: Plus,
      href: "/dashboard/umkm",
      color: "from-emerald-600 to-emerald-700",
    },
    {
      title: "Tulis Berita",
      description: "Buat berita terbaru",
      icon: Edit,
      href: "/dashboard/news",
      color: "from-blue-600 to-blue-700",
    },
    {
      title: "Upload Galeri",
      description: "Tambah foto kegiatan",
      icon: Camera,
      href: "/dashboard/gallery",
      color: "from-purple-600 to-purple-700",
    },
  ];

  const statCards = [
    {
      title: "Total UMKM",
      value: stats.umkm,
      icon: Building,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      title: "Total Berita",
      value: stats.news,
      icon: Newspaper,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Total Galeri",
      value: stats.gallery,
      icon: Camera,
      color: "text-purple-600 bg-purple-100",
    },
  ];

  if (loading) {
    return (
      <div className="admin-content">
        <div className="admin-main">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-2 text-gray-600">Memuat dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Welcome Header */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Selamat Datang, Admin!
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Panel admin Padukuhan Pakel - {user?.email}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {currentTime.toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="flex items-center justify-end mt-1">
                <Clock className="w-4 h-4 text-emerald-500 mr-1" />
                <span className="text-sm text-emerald-600 font-medium font-mono">
                  {currentTime.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}
                  >
                    <card.icon className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Aksi Cepat
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    to={action.href}
                    className="block p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 group"
                  >
                    <div
                      className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-emerald-700">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {action.description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Log Aktivitas Terbaru
                </h2>
              </div>
              <button
                onClick={refreshActivities}
                disabled={activitiesLoading}
                className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1 ${
                    activitiesLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Memuat aktivitas...
                  </span>
                </div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(
                    activity.action,
                    activity.type
                  );
                  const colorClass = getActivityColor(activity.action);

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <div
                        className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        <ActivityIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {getActionText(activity.action)}{" "}
                              {getTypeText(activity.type)}
                            </p>
                            <p className="text-sm text-gray-600 mt-0.5 truncate">
                              {activity.itemName}
                            </p>
                            {activity.additionalInfo &&
                              Object.keys(activity.additionalInfo).length >
                                0 && (
                                <div className="mt-1">
                                  {activity.additionalInfo.description && (
                                    <p className="text-xs text-gray-500 truncate">
                                      {activity.additionalInfo.description}
                                    </p>
                                  )}
                                  {activity.additionalInfo.category && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded-full">
                                      {activity.additionalInfo.category}
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                          <div className="text-right ml-2 flex-shrink-0">
                            <p className="text-xs text-gray-400">
                              {formatTimestamp(activity.timestamp)}
                            </p>
                            {activity.userEmail && (
                              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-24">
                                {activity.userEmail.split("@")[0]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">
                    Belum ada aktivitas yang tercatat
                  </p>
                  <p className="text-xs text-gray-400">
                    Aktivitas akan muncul saat Anda mulai mengelola konten
                  </p>
                </div>
              )}
            </div>

            {recentActivities.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Menampilkan {recentActivities.length} aktivitas terbaru
                  </span>
                  <Link
                    to="/dashboard/activities"
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Lihat Semua
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

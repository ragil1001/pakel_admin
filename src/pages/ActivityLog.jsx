import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  User,
  Filter,
  Search,
  RefreshCw,
  Building,
  Newspaper,
  Camera,
  MapPin,
  Info,
  LogIn,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getActivities } from "../utils/firebaseUtils";
import { Link } from "react-router-dom";

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activitiesPerPage] = useState(20);

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const activityData = await getActivities(100); // Get more activities for full log
        setActivities(activityData);
        setFilteredActivities(activityData);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Filter and search activities
  useEffect(() => {
    let filtered = activities;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((activity) => activity.type === filterType);
    }

    // Filter by action
    if (filterAction !== "all") {
      filtered = filtered.filter(
        (activity) => activity.action === filterAction
      );
    }

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [activities, filterType, filterAction, searchTerm]);

  // Refresh activities
  const refreshActivities = async () => {
    setLoading(true);
    try {
      const activityData = await getActivities(100);
      setActivities(activityData);
    } catch (error) {
      console.error("Failed to refresh activities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get activity icon
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

  // Get activity color
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
    if (!timestamp) return "Tidak diketahui";

    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination
  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = filteredActivities.slice(
    indexOfFirstActivity,
    indexOfLastActivity
  );
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="admin-content">
        <div className="admin-main">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Memuat log aktivitas...</span>
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-blue-600" />
                  Log Aktivitas
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Riwayat semua aktivitas admin di sistem
                </p>
              </div>
            </div>
            <button
              onClick={refreshActivities}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              {
                title: "Total Aktivitas",
                value: activities.length,
                icon: Activity,
                color: "text-blue-600",
              },
              {
                title: "Hari Ini",
                value: activities.filter((activity) => {
                  if (!activity.timestamp) return false;
                  let date;
                  if (activity.timestamp.toDate) {
                    date = activity.timestamp.toDate();
                  } else if (activity.timestamp.seconds) {
                    date = new Date(activity.timestamp.seconds * 1000);
                  } else {
                    date = new Date(activity.timestamp);
                  }
                  const today = new Date();
                  return date.toDateString() === today.toDateString();
                }).length,
                icon: Calendar,
                color: "text-green-600",
              },
              {
                title: "Dibuat",
                value: activities.filter((a) => a.action === "create").length,
                icon: Plus,
                color: "text-emerald-600",
              },
              {
                title: "Diperbarui",
                value: activities.filter((a) => a.action === "update").length,
                icon: Edit,
                color: "text-blue-600",
              },
              {
                title: "Dihapus",
                value: activities.filter((a) => a.action === "delete").length,
                icon: Trash2,
                color: "text-red-600",
              },
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-white p-3 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">{card.title}</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {card.value}
                    </p>
                  </div>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama item atau email admin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Tipe</option>
                <option value="umkm">UMKM</option>
                <option value="news">Berita</option>
                <option value="gallery">Galeri</option>
                <option value="location">Lokasi</option>
                <option value="generalInfo">Informasi</option>
                <option value="auth">Sistem</option>
              </select>

              {/* Action Filter */}
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Aksi</option>
                <option value="create">Membuat</option>
                <option value="update">Memperbarui</option>
                <option value="delete">Menghapus</option>
                <option value="login">Masuk</option>
                <option value="logout">Keluar</option>
              </select>
            </div>
          </div>

          {/* Activities List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Daftar Aktivitas
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredActivities.length} dari {activities.length} aktivitas
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {currentActivities.length > 0 ? (
                currentActivities.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(
                    activity.action,
                    activity.type
                  );
                  const colorClass = getActivityColor(activity.action);

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}
                        >
                          <ActivityIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900">
                                {getActionText(activity.action)}{" "}
                                {getTypeText(activity.type)}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {activity.itemName}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                                <div className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  {activity.userEmail}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTimestamp(activity.timestamp)}
                                </div>
                              </div>
                            </div>
                            {activity.itemId && (
                              <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                                ID: {activity.itemId.substring(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">
                    Tidak ada aktivitas ditemukan
                  </p>
                  <p className="text-sm text-gray-400">
                    Coba ubah filter atau kata kunci pencarian
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Menampilkan {indexOfFirstActivity + 1}-
                    {Math.min(indexOfLastActivity, filteredActivities.length)}{" "}
                    dari {filteredActivities.length} aktivitas
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`px-3 py-1 border rounded-md ${
                              currentPage === pageNumber
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        (pageNumber === currentPage - 2 && pageNumber > 1) ||
                        (pageNumber === currentPage + 2 &&
                          pageNumber < totalPages)
                      ) {
                        return (
                          <span
                            key={pageNumber}
                            className="px-3 py-1 text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityLog;

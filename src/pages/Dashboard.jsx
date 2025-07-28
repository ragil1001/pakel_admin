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
import { translate } from "../utils/translations";

const Dashboard = () => {
  const { user, userSettings } = useAuth();
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
        const activities = await getActivities(userSettings.itemsPerPage || 15);
        setRecentActivities(activities);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, [userSettings.itemsPerPage]);

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
      const activities = await getActivities(userSettings.itemsPerPage || 15);
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

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return translate("just_now", userSettings.language);

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

    if (diffMins < 1) return translate("just_now", userSettings.language);
    if (diffMins < 60)
      return translate("minutes_ago", userSettings.language, {
        count: diffMins,
      });
    if (diffHours < 24)
      return translate("hours_ago", userSettings.language, {
        count: diffHours,
      });
    if (diffDays < 7)
      return translate("days_ago", userSettings.language, { count: diffDays });

    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    const dateFormat = userSettings.dateFormat || "dd/mm/yyyy";
    if (dateFormat === "mm/dd/yyyy") {
      options.month = "numeric";
      return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
        date.getDate()
      ).padStart(2, "0")}/${date.getFullYear()}`;
    } else if (dateFormat === "yyyy-mm-dd") {
      options.month = "numeric";
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    }
    return date.toLocaleDateString(
      userSettings.language === "id" ? "id-ID" : "en-US",
      options
    );
  };

  // Format current time
  const formatCurrentTime = () => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: userSettings.timeFormat === "12h",
    };
    return currentTime.toLocaleTimeString(
      userSettings.language === "id" ? "id-ID" : "en-US",
      options
    );
  };

  // Format current date
  const formatCurrentDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const dateFormat = userSettings.dateFormat || "dd/mm/yyyy";
    if (dateFormat === "mm/dd/yyyy") {
      options.month = "numeric";
      return `${String(currentTime.getMonth() + 1).padStart(2, "0")}/${String(
        currentTime.getDate()
      ).padStart(2, "0")}/${currentTime.getFullYear()}`;
    } else if (dateFormat === "yyyy-mm-dd") {
      options.month = "numeric";
      return `${currentTime.getFullYear()}-${String(
        currentTime.getMonth() + 1
      ).padStart(2, "0")}-${String(currentTime.getDate()).padStart(2, "0")}`;
    }
    return currentTime.toLocaleDateString(
      userSettings.language === "id" ? "id-ID" : "en-US",
      options
    );
  };

  const quickActions = [
    {
      title: translate("add_umkm", userSettings.language),
      description: translate("add_umkm_description", userSettings.language),
      icon: Plus,
      href: "/dashboard/umkm",
      color: "from-emerald-600 to-emerald-700",
    },
    {
      title: translate("write_news", userSettings.language),
      description: translate("write_news_description", userSettings.language),
      icon: Edit,
      href: "/dashboard/news",
      color: "from-blue-600 to-blue-700",
    },
    {
      title: translate("upload_gallery", userSettings.language),
      description: translate(
        "upload_gallery_description",
        userSettings.language
      ),
      icon: Camera,
      href: "/dashboard/gallery",
      color: "from-purple-600 to-purple-700",
    },
  ];

  const statCards = [
    {
      title: translate("total_umkm", userSettings.language),
      value: stats.umkm,
      icon: Building,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      title: translate("total_news", userSettings.language),
      value: stats.news,
      icon: Newspaper,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: translate("total_gallery", userSettings.language),
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
            <span className="ml-2 text-gray-600">
              {translate("loading_dashboard", userSettings.language)}
            </span>
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
          className="space-y-3 sm:space-y-4 md:space-y-6"
        >
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 md:pb-6 border-b border-gray-200 space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {translate("welcome_admin", userSettings.language)}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">
                  {translate("admin_panel_description", userSettings.language, {
                    email: user?.email,
                  })}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                {formatCurrentDate()}
              </p>
              <div className="flex items-center sm:justify-end mt-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 mr-1" />
                <span className="text-xs sm:text-sm text-emerald-600 font-medium font-mono">
                  {formatCurrentTime()}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {statCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                      {card.title}
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${card.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 md:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 mr-2 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {translate("quick_actions", userSettings.language)}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    to={action.href}
                    className="block p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 group"
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform flex-shrink-0`}
                    >
                      <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-emerald-700 text-sm sm:text-base truncate">
                      {action.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                      {action.description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
              <div className="flex items-center min-w-0 flex-1">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {translate("recent_activity_log", userSettings.language)}
                </h2>
              </div>
              <button
                onClick={refreshActivities}
                disabled={activitiesLoading}
                className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <RefreshCw
                  className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${
                    activitiesLoading ? "animate-spin" : ""
                  }`}
                />
                <span className="hidden sm:inline">
                  {translate("refresh", userSettings.language)}
                </span>
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm sm:text-base text-gray-600">
                    {translate("loading_activities", userSettings.language)}
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
                      className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <div
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        <ActivityIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between space-x-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">
                              {translate(
                                `action_${activity.action}`,
                                userSettings.language
                              )}{" "}
                              {translate(
                                `type_${activity.type}`,
                                userSettings.language
                              )}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">
                              {activity.itemName}
                            </p>
                            {activity.additionalInfo &&
                              Object.keys(activity.additionalInfo).length >
                                0 && (
                                <div className="mt-1">
                                  {activity.additionalInfo.description && (
                                    <p className="text-xs text-gray-500 line-clamp-1">
                                      {activity.additionalInfo.description}
                                    </p>
                                  )}
                                  {activity.additionalInfo.category && (
                                    <span className="inline-block mt-1 px-1.5 sm:px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded-full truncate max-w-20 sm:max-w-none">
                                      {activity.additionalInfo.category}
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-xs text-gray-400 whitespace-nowrap">
                              {formatTimestamp(activity.timestamp)}
                            </p>
                            {activity.userEmail && (
                              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-16 sm:max-w-24">
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
                <div className="text-center py-6 sm:py-8">
                  <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                  <p className="text-sm sm:text-base text-gray-500 mb-1 sm:mb-2">
                    {translate("no_activities", userSettings.language)}
                  </p>
                  <p className="text-xs text-gray-400 px-4">
                    {translate("no_activities_message", userSettings.language)}
                  </p>
                </div>
              )}
            </div>

            {recentActivities.length > 0 && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm space-y-2 sm:space-y-0">
                  <span className="text-gray-500">
                    {translate("showing_activities", userSettings.language, {
                      count: recentActivities.length,
                    })}
                  </span>
                  <Link
                    to="/dashboard/activities"
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center self-start sm:self-auto"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {translate("view_all", userSettings.language)}
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

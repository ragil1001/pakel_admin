import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { colorPalette } from "../colors";
import { Plus } from "lucide-react";
import NewsForm from "../components/NewsForm";
import SearchBar from "../components/SearchBar";
import Notification from "../components/Notification";
import { getNews } from "../utils/firebaseUtils";
import { useAuth } from "../context/AuthContext";
import { translate } from "../utils/translations";

const NewsTable = React.lazy(() => import("../components/NewsTable"));

const ManageNews = () => {
  const { userSettings } = useAuth();
  const [newsItems, setNewsItems] = useState([]);
  const [filteredNewsItems, setFilteredNewsItems] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNews();
        setNewsItems(data);
        setFilteredNewsItems(data);
      } catch (error) {
        console.error("Failed to fetch News:", error);
        // showNotification(
        //   translate("error_load_news", userSettings.language),
        //   "error"
        // );
      }
    };
    fetchNews();
  }, [userSettings.language]);

  const handleAdd = () => {
    setSelectedNews(null);
    setIsFormOpen(true);
  };

  const handleEdit = (news) => {
    setSelectedNews(news);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedNews(null);
  };

  const handleSave = () => {
    getNews()
      .then((data) => {
        setNewsItems(data);
        setFilteredNewsItems(data);
        // showNotification(
        //   translate("news_saved_success", userSettings.language),
        //   "success"
        // );
      })
      .catch((error) => {
        console.error("Failed to refresh News:", error);
        // showNotification(
        //   translate("error_refresh_news", userSettings.language),
        //   "error"
        // );
      });
    handleCloseForm();
  };

  const handleSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    setFilteredNewsItems(
      newsItems.filter(
        (news) =>
          news.title.toLowerCase().includes(lowerQuery) ||
          news.type.toLowerCase().includes(lowerQuery)
      )
    );
  };

  // const showNotification = (message, type) => {
  //   setNotification({ message, type });
  //   setTimeout(() => setNotification(null), 3000);
  // };

  return (
    <div className="admin-content">
      <div className="admin-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Fixed Notification */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 right-6 z-50"
            >
              <Notification
                message={notification.message}
                type={notification.type}
              />
            </motion.div>
          )}

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {translate("manage_news", userSettings.language)}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {translate("manage_news_description", userSettings.language)}
              </p>
            </div>
            <motion.button
              onClick={handleAdd}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {translate("add_news", userSettings.language)}
            </motion.button>
          </div>

          {/* Search Bar and Additional Add Button (when data exists) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="max-w-md">
              <SearchBar
                onSearch={handleSearch}
                placeholder={translate("search_news", userSettings.language)}
              />
            </div>
          </div>

          {/* Table Section */}
          {filteredNewsItems.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    <span className="ml-2 text-gray-600">
                      {translate("loading_data", userSettings.language)}
                    </span>
                  </div>
                }
              >
                <NewsTable
                  newsItems={filteredNewsItems}
                  onEdit={handleEdit}
                  onDelete={handleSave}
                />
              </Suspense>
            </div>
          )}

          {/* Additional Add Button at Bottom of Table */}
          {filteredNewsItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex justify-center pt-4"
            >
              <motion.button
                onClick={handleAdd}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5 mr-2" />
                {translate("add_new_news", userSettings.language)}
              </motion.button>
            </motion.div>
          )}

          {/* Empty State */}
          {filteredNewsItems.length === 0 && newsItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-lg border border-gray-200"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {translate("no_news_data", userSettings.language)}
              </h3>
              <p className="text-gray-500 mb-4">
                {translate("no_news_data_message", userSettings.language)}
              </p>
              <motion.button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {translate("add_news", userSettings.language)}
              </motion.button>
            </motion.div>
          )}

          {/* No Search Results */}
          {filteredNewsItems.length === 0 && newsItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-lg border border-gray-200"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {translate("no_search_results", userSettings.language)}
              </h3>
              <p className="text-gray-500 mb-4">
                {translate("no_search_results_message", userSettings.language)}
              </p>
              <motion.button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {translate("add_new_news", userSettings.language)}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <NewsForm
          news={selectedNews}
          onSave={handleSave}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default ManageNews;

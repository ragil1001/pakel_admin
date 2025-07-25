import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { colorPalette } from "../colors";
import { Plus, X } from "lucide-react";
import NewsForm from "../components/NewsForm";
import SearchBar from "../components/SearchBar";
import Notification from "../components/Notification";
import { getNews } from "../utils/firebaseUtils";
import { useAuth } from "../context/AuthContext";
import { translate } from "../utils/translations";

const NewsTable = React.lazy(() => import("../components/NewsTable"));

const NewsDetailModal = ({ news, onClose, userSettings }) => (
  <motion.div
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    onClick={onClose}
  >
    <motion.div
      className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6 relative flex-shrink-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <h3 className="text-2xl font-bold text-white">
          {translate("news_details", userSettings.language)}
        </h3>
        <p className="text-emerald-100 mt-1">
          {translate("news_details_description", userSettings.language)}
        </p>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              {translate("title", userSettings.language)}
            </h4>
            <p className="text-gray-900 break-words">{news.title || "-"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              {translate("type", userSettings.language)}
            </h4>
            <p className="text-gray-900">
              {translate(news.type.toLowerCase(), userSettings.language) ||
                news.type}
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">
            {translate("content", userSettings.language)}
          </h4>
          <div
            className="text-gray-900 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content || "-" }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              {translate("date", userSettings.language)}
            </h4>
            <p className="text-gray-900">{news.date || "-"}</p>
          </div>
        </div>

        {news.image && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              {translate("news_image", userSettings.language)}
            </h4>
            <img
              src={news.image}
              alt={news.title || translate("no_title", userSettings.language)}
              className="w-48 h-48 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex-shrink-0">
        <div className="flex justify-end">
          <motion.button
            onClick={onClose}
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {translate("close", userSettings.language)}
          </motion.button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const ManageNews = () => {
  const { userSettings } = useAuth();
  const [newsItems, setNewsItems] = useState([]);
  const [filteredNewsItems, setFilteredNewsItems] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedDetailNews, setSelectedDetailNews] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNews();
        setNewsItems(data);
        setFilteredNewsItems(data);
      } catch (error) {
        console.error("Failed to fetch News:", error);
        setNotification({
          message: translate("error_load_news", userSettings.language),
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
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

  const handleShowDetails = (news) => {
    setSelectedDetailNews(news);
  };

  const handleCloseDetails = () => {
    setSelectedDetailNews(null);
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
        setNotification({
          message: translate("news_saved_success", userSettings.language),
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      })
      .catch((error) => {
        console.error("Failed to refresh News:", error);
        setNotification({
          message: translate("error_refresh_news", userSettings.language),
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
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

          {/* Responsive Page Header */}
          <div className="flex flex-col space-y-4 pb-4 border-b border-gray-200 md:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {translate("manage_news", userSettings.language)}
                </h1>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {translate("manage_news_description", userSettings.language)}
                </p>
              </div>
              <div className="flex-shrinkSubjects: 0">
                <motion.button
                  onClick={handleAdd}
                  className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-sm text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {translate("add_news", userSettings.language)}
                  </span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Search Bar Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <SearchBar
                onSearch={handleSearch}
                placeholder={translate("search_news", userSettings.language)}
              />
            </div>
          </div>

          {/* Table Section */}
          {filteredNewsItems.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
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
                  onShowDetails={handleShowDetails}
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
              <p className="text-gray-500 mb-4 px-4">
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
              <p className="text-gray-500 mb-4 px-4">
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

      {/* Detail Modal */}
      {selectedDetailNews && (
        <NewsDetailModal
          news={selectedDetailNews}
          onClose={handleCloseDetails}
          userSettings={userSettings}
        />
      )}
    </div>
  );
};

export default ManageNews;

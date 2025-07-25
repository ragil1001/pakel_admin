import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { colorPalette } from "../colors";
import { Plus, X } from "lucide-react";
import UmkmForm from "../components/UmkmForm";
import SearchBar from "../components/SearchBar";
import Notification from "../components/Notification";
import { getUmkms } from "../utils/firebaseUtils";
import { useAuth } from "../context/AuthContext";
import { translate } from "../utils/translations";

const UmkmTable = React.lazy(() => import("../components/UmkmTable"));

const UmkmDetailModal = ({ umkm, onClose, userSettings }) => (
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
          {translate("umkm_details", userSettings.language)}
        </h3>
        <p className="text-emerald-100 mt-1">
          {translate("umkm_details_description", userSettings.language)}
        </p>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              {translate("product_name", userSettings.language)}
            </h4>
            <p className="text-gray-900">{umkm.name || "-"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              {translate("owner", userSettings.language)}
            </h4>
            <p className="text-gray-900">{umkm.owner || "-"}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">
            {translate("product_description", userSettings.language)}
          </h4>
          <p className="text-gray-900">{umkm.description || "-"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              {translate("whatsapp", userSettings.language)}
            </h4>
            <p className="text-gray-900">{umkm.whatsapp || "-"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              {translate("location", userSettings.language)}
            </h4>
            <p className="text-gray-900">{umkm.location || "-"}</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">
            {translate("owner_bio", userSettings.language)}
          </h4>
          <p className="text-gray-900">{umkm.bio || "-"}</p>
        </div>

        {umkm.image && (
          <div>
            <h4 className="text-sm font-medium text-gray-700">
              {translate("product_image", userSettings.language)}
            </h4>
            <img
              src={umkm.image}
              alt={umkm.name || translate("no_title", userSettings.language)}
              className="w-48 h-48 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}

        {umkm.variants && umkm.variants.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              {translate("product_variants", userSettings.language)}
            </h4>
            <div className="space-y-4">
              {umkm.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={variant.image}
                      alt={variant.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                    />
                    <div className="flex-1">
                      <h6 className="font-medium text-gray-900">
                        {variant.name}
                      </h6>
                      <p className="text-sm text-gray-600 mt-1">
                        {variant.description}
                      </p>
                      <p className="text-sm font-medium text-emerald-600 mt-2">
                        Rp {variant.price}/{variant.unit || "pcs"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

const ManageUmkm = () => {
  const { userSettings } = useAuth();
  const [umkms, setUmkms] = useState([]);
  const [filteredUmkms, setFilteredUmkms] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUmkm, setSelectedUmkm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [selectedDetailUmkm, setSelectedDetailUmkm] = useState(null);

  useEffect(() => {
    const fetchUmkms = async () => {
      try {
        const data = await getUmkms();
        setUmkms(data);
        setFilteredUmkms(data);
      } catch (error) {
        console.error("Failed to fetch UMKM:", error);
        setNotification({
          message: translate("error_load_umkm", userSettings.language),
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    };
    fetchUmkms();
  }, [userSettings.language]);

  const handleAdd = () => {
    setSelectedUmkm(null);
    setIsFormOpen(true);
  };

  const handleEdit = (umkm) => {
    setSelectedUmkm(umkm);
    setIsFormOpen(true);
  };

  const handleShowDetails = (umkm) => {
    setSelectedDetailUmkm(umkm);
  };

  const handleCloseDetails = () => {
    setSelectedDetailUmkm(null);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUmkm(null);
  };

  const handleSave = () => {
    getUmkms()
      .then((data) => {
        setUmkms(data);
        setFilteredUmkms(data);
        setNotification({
          message: translate("umkm_saved_success", userSettings.language),
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      })
      .catch((error) => {
        console.error("Failed to refresh UMKM:", error);
        setNotification({
          message: translate("error_refresh_umkm", userSettings.language),
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
      });
    handleCloseForm();
  };

  const handleSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    setFilteredUmkms(
      umkms.filter(
        (umkm) =>
          umkm.name.toLowerCase().includes(lowerQuery) ||
          umkm.owner.toLowerCase().includes(lowerQuery)
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
            {/* Title and Button Row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              {/* Title Section */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {translate("manage_umkm", userSettings.language)}
                </h1>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {translate("manage_umkm_description", userSettings.language)}
                </p>
              </div>

              {/* Add Button - Always positioned at top right */}
              <div className="flex-shrink-0">
                <motion.button
                  onClick={handleAdd}
                  className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-sm text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {translate("add_umkm", userSettings.language)}
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
                placeholder={translate("search_umkm", userSettings.language)}
              />
            </div>

            {/* Mobile Add Button - Only show on very small screens if needed */}
            {/* <div className="sm:hidden">
              <motion.button
                onClick={handleAdd}
                className="flex items-center justify-center w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-sm text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {translate("add_umkm", userSettings.language)}
              </motion.button>
            </div> */}
          </div>

          {/* Table Section */}
          {filteredUmkms.length > 0 && (
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
                <UmkmTable
                  umkms={filteredUmkms}
                  onEdit={handleEdit}
                  onDelete={handleSave}
                  onShowDetails={handleShowDetails}
                />
              </Suspense>
            </div>
          )}

          {/* Additional Add Button at Bottom of Table */}
          {filteredUmkms.length > 0 && (
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
                {translate("add_new_umkm", userSettings.language)}
              </motion.button>
            </motion.div>
          )}

          {/* Empty State */}
          {filteredUmkms.length === 0 && umkms.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-lg border border-gray-200"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {translate("no_umkm_data", userSettings.language)}
              </h3>
              <p className="text-gray-500 mb-4 px-4">
                {translate("no_umkm_data_message", userSettings.language)}
              </p>
              <motion.button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {translate("add_umkm", userSettings.language)}
              </motion.button>
            </motion.div>
          )}

          {/* No Search Results */}
          {filteredUmkms.length === 0 && umkms.length > 0 && (
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
                {translate("add_new_umkm", userSettings.language)}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <UmkmForm
          umkm={selectedUmkm}
          onSave={handleSave}
          onCancel={handleCloseForm}
        />
      )}

      {/* Detail Modal */}
      {selectedDetailUmkm && (
        <UmkmDetailModal
          umkm={selectedDetailUmkm}
          onClose={handleCloseDetails}
          userSettings={userSettings}
        />
      )}
    </div>
  );
};

export default ManageUmkm;

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { colorPalette } from "../colors";
import { Plus } from "lucide-react";
import UmkmForm from "../components/UmkmForm";
import SearchBar from "../components/SearchBar";
import Notification from "../components/Notification";
import { getUmkms } from "../utils/firebaseUtils";

const UmkmTable = React.lazy(() => import("../components/UmkmTable"));

const ManageUmkm = () => {
  const [umkms, setUmkms] = useState([]);
  const [filteredUmkms, setFilteredUmkms] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUmkm, setSelectedUmkm] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchUmkms = async () => {
      try {
        const data = await getUmkms();
        setUmkms(data);
        setFilteredUmkms(data);
      } catch (error) {
        console.error("Failed to fetch UMKM:", error);
        showNotification("Gagal memuat UMKM.", "error");
      }
    };
    fetchUmkms();
  }, []);

  const handleAdd = () => {
    setSelectedUmkm(null);
    setIsFormOpen(true);
  };

  const handleEdit = (umkm) => {
    setSelectedUmkm(umkm);
    setIsFormOpen(true);
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
        showNotification("UMKM berhasil disimpan.", "success");
      })
      .catch((error) => {
        console.error("Failed to refresh UMKM:", error);
        showNotification("Gagal menyegarkan UMKM.", "error");
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

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kelola UMKM</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manajemen data UMKM Padukuhan Pakel
              </p>
            </div>
            <motion.button
              onClick={handleAdd}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah UMKM
            </motion.button>
          </div>

          {/* Search Bar and Additional Add Button (when data exists) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="max-w-md">
              <SearchBar onSearch={handleSearch} placeholder="Cari UMKM..." />
            </div>
          </div>

          {/* Table Section */}
          {filteredUmkms.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    <span className="ml-2 text-gray-600">Memuat data...</span>
                  </div>
                }
              >
                <UmkmTable
                  umkms={filteredUmkms}
                  onEdit={handleEdit}
                  onDelete={handleSave}
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
                Tambah UMKM Baru
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
                Belum ada data UMKM
              </h3>
              <p className="text-gray-500 mb-4">
                Mulai dengan menambahkan UMKM pertama Anda
              </p>
              <motion.button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah UMKM
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
                Tidak ada hasil pencarian
              </h3>
              <p className="text-gray-500 mb-4">
                Coba ubah kata kunci pencarian Anda
              </p>
              <motion.button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah UMKM Baru
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
    </div>
  );
};

export default ManageUmkm;

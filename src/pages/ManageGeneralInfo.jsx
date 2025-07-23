import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { colorPalette } from "../colors";
import { Plus } from "lucide-react";
import GeneralInfoForm from "../components/GeneralInfoForm";
import SearchBar from "../components/SearchBar";
import Notification from "../components/Notification";
import { getGeneralInfo } from "../utils/firebaseUtils";

const GeneralInfoTable = React.lazy(() =>
  import("../components/GeneralInfoTable")
);

const ManageGeneralInfo = () => {
  const [generalInfo, setGeneralInfo] = useState([]);
  const [filteredGeneralInfo, setFilteredGeneralInfo] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchGeneralInfo = async () => {
      try {
        const data = await getGeneralInfo();
        setGeneralInfo(data);
        setFilteredGeneralInfo(data);
      } catch (error) {
        console.error("Failed to fetch General Info:", error);
        // showNotification("Gagal memuat info umum.", "error");
      }
    };
    fetchGeneralInfo();
  }, []);

  const handleAdd = () => {
    setSelectedInfo(null);
    setIsFormOpen(true);
  };

  const handleEdit = (info) => {
    setSelectedInfo(info);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedInfo(null);
  };

  const handleSave = () => {
    getGeneralInfo()
      .then((data) => {
        setGeneralInfo(data);
        setFilteredGeneralInfo(data);
        // showNotification("Info umum berhasil disimpan.", "success");
      })
      .catch((error) => {
        console.error("Failed to refresh General Info:", error);
        // showNotification("Gagal menyegarkan info umum.", "error");
      });
    handleCloseForm();
  };

  const handleSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    setFilteredGeneralInfo(
      generalInfo.filter((info) =>
        info.category.toLowerCase().includes(lowerQuery)
      )
    );
  };

  // const showNotification = (message, type) => {
  //   setNotification({ message, type });
  //   setTimeout(() => setNotification(null), 3000);
  // };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-[1400px] mx-auto py-12 px-4 sm:px-6 lg:px-8"
    >
      {notification && (
        <Notification message={notification.message} type={notification.type} />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-3xl font-merriweather font-bold"
          style={{ color: colorPalette.text }}
        >
          Kelola Info Umum
        </h2>
        <motion.button
          onClick={handleAdd}
          className="flex items-center px-6 py-3 rounded-full font-inter font-semibold text-white"
          style={{ backgroundColor: colorPalette.primary }}
          whileHover={{ scale: 1.05, backgroundColor: colorPalette.secondary }}
          transition={{ duration: 0.3 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Info
        </motion.button>
      </div>
      <SearchBar onSearch={handleSearch} placeholder="Cari kategori info..." />
      <Suspense
        fallback={<div className="text-center py-4">Memuat tabel...</div>}
      >
        <GeneralInfoTable
          generalInfo={filteredGeneralInfo}
          onEdit={handleEdit}
          onDelete={handleSave}
        />
      </Suspense>
      {isFormOpen && (
        <GeneralInfoForm
          info={selectedInfo}
          onSave={handleSave}
          onCancel={handleCloseForm}
        />
      )}
    </motion.div>
  );
};

export default ManageGeneralInfo;

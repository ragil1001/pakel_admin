import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colorPalette } from "../colors";
import { X, Upload, AlertCircle } from "lucide-react";
import { createNews, updateNews } from "../utils/firebaseUtils";
import { convertImageToBase64 } from "../utils/imageUtils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const NewsForm = ({ news, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: "Pengumuman",
    title: "",
    content: "",
    date: "",
    image: "",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (news) {
      setFormData({
        type: news.type || "Pengumuman",
        title: news.title || "",
        content: news.content || "",
        date: news.date || "",
        image: news.image || "",
      });
      if (news.date) {
        const [day, month, year] = news.date.split(" ");
        const monthMap = {
          Januari: 0,
          Februari: 1,
          Maret: 2,
          April: 3,
          Mei: 4,
          Juni: 5,
          Juli: 6,
          Agustus: 7,
          September: 8,
          Oktober: 9,
          November: 10,
          Desember: 11,
        };
        setSelectedDate(
          new Date(parseInt(year), monthMap[month], parseInt(day))
        );
      }
    }
  }, [news]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.type) newErrors.type = "Tipe wajib diisi.";
    if (!formData.title) newErrors.title = "Judul wajib diisi.";
    if (!formData.content) newErrors.content = "Konten wajib diisi.";
    if (!formData.date) newErrors.date = "Tanggal wajib diisi.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    },
    [errors]
  );

  const handleImageChange = useCallback(async (e) => {
    try {
      const file = e.target.files[0];
      const base64 = await convertImageToBase64(file);
      setFormData((prev) => ({ ...prev, image: base64 }));
      setErrors((prev) => ({ ...prev, image: "" }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, image: error.message }));
    }
  }, []);

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
    if (date) {
      const day = String(date.getDate()).padStart(2, "0");
      const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      setFormData((prev) => ({ ...prev, date: `${day} ${month} ${year}` }));
      setErrors((prev) => ({ ...prev, date: "" }));
    } else {
      setFormData((prev) => ({ ...prev, date: "" }));
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const action = news ? "memperbarui" : "menyimpan";
      const confirmResult = await Swal.fire({
        title: `Konfirmasi ${news ? "Perbarui" : "Simpan"} Berita`,
        text: `Apakah Anda yakin ingin ${action} berita "${formData.title}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: colorPalette.primary,
        cancelButtonColor: colorPalette.error,
        confirmButtonText: news ? "Perbarui" : "Simpan",
        cancelButtonText: "Batal",
        reverseButtons: true,
        customClass: {
          popup: "rounded-2xl shadow-xl",
          title: "text-xl font-bold text-gray-900",
          content: "text-gray-600",
          confirmButton: "px-6 py-3 rounded-lg font-medium transition-all",
          cancelButton: "px-6 py-3 rounded-lg font-medium transition-all",
        },
      });

      if (!confirmResult.isConfirmed) return;

      setLoading(true);
      try {
        console.log("Data to be saved:", formData);
        if (news) {
          await updateNews(news.id, formData);
        } else {
          await createNews(formData);
        }
        onSave();
        toast.success(`Berita berhasil ${news ? "diperbarui" : "disimpan"}!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          style: {
            background: colorPalette.background,
            color: colorPalette.text,
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
          progressStyle: {
            background: colorPalette.primary,
          },
        });
      } catch (error) {
        console.error("Failed to save News:", error);
        setErrors({ general: `Gagal menyimpan data: ${error.message}` });
        Swal.fire({
          title: "Gagal!",
          text: `Terjadi kesalahan saat ${action} berita: ${error.message}`,
          icon: "error",
          confirmButtonColor: colorPalette.primary,
          customClass: {
            popup: "rounded-2xl shadow-xl",
            title: "text-xl font-bold text-gray-900",
            content: "text-gray-600",
            confirmButton: "px-6 py-3 rounded-lg font-medium transition-all",
          },
        });
      } finally {
        setLoading(false);
      }
    },
    [formData, news, onSave, validateForm]
  );

  const tabs = [
    { id: "basic", label: "Informasi Dasar" },
    // Add more tabs if needed in the future
  ];

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onCancel}
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
            onClick={onCancel}
            className="absolute top-4 right-4 p  p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h3 className="text-2xl font-bold text-white">
            {news ? "Edit Berita" : "Tambah Berita Baru"}
          </h3>
          <p className="text-emerald-100 mt-1">
            {news
              ? "Perbarui informasi berita"
              : "Lengkapi informasi berita baru"}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <nav className="flex px-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 font-medium text-sm transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? "text-emerald-600 border-b-2 border-emerald-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 font-medium">
                    {errors.general}
                  </span>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === "basic" && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipe<span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 form-input ${
                          errors.type
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <option value="Pengumuman">Pengumuman</option>
                        <option value="Berita">Berita</option>
                        <option value="Kegiatan">Kegiatan</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      {errors.type && (
                        <div className="flex items-center text-red-600 text-sm mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.type}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Judul<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Judul berita"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 form-input ${
                          errors.title
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {errors.title && (
                        <div className="flex items-center text-red-600 text-sm mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.title}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Konten<span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Konten berita..."
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 form-input resize-none ${
                        errors.content
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                    {errors.content && (
                      <div className="flex items-center text-red-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.content}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tanggal<span className="text-red-500 ml-1">*</span>
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="dd MMMM yyyy"
                      placeholderText="Pilih tanggal"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 form-input ${
                        errors.date
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      locale="id"
                      required
                    />
                    {errors.date && (
                      <div className="flex items-center text-red-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.date}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Gambar Berita<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <label className="relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-emerald-400 transition-colors ${
                              errors.image
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              Klik untuk upload gambar
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPEG, PNG, JPG (Max 5MB)
                            </p>
                          </div>
                        </label>
                      </div>
                      {formData.image && (
                        <div className="flex-shrink-0">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}
                    </div>
                    {errors.image && (
                      <div className="flex items-center text-red-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.image}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <motion.button
              onClick={onCancel}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex-1 sm:flex-none sm:min-w-[120px] text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Batal
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-8 py-3 bg-emerald-600 text-white rounded-lg font-medium transition-all duration-200 flex-1 sm:flex-none sm:min-w-[120px] text-center ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-emerald-700"
              }`}
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Menyimpan...
                </div>
              ) : (
                `${news ? "Perbarui" : "Simpan"} Berita`
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewsForm;

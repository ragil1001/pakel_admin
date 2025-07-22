import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colorPalette } from "../colors";
import { X } from "lucide-react";
import { createGeneralInfo, updateGeneralInfo } from "../utils/firebaseUtils";

const GeneralInfoForm = ({ info, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    category: "",
    content: {
      description: "",
    },
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (info) {
      setFormData({
        category: info.category || "",
        content: {
          description: info.content?.description || "",
        },
      });
    }
  }, [info]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = "Kategori wajib diisi.";
    if (!formData.content.description)
      newErrors.description = "Deskripsi wajib diisi.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "description") {
      setFormData((prev) => ({
        ...prev,
        content: { ...prev.content, description: value },
      }));
      setErrors((prev) => ({ ...prev, description: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log("Data to be saved:", formData);
      if (info) {
        await updateGeneralInfo(info.id, formData);
      } else {
        await createGeneralInfo(formData);
      }
      onSave();
    } catch (error) {
      console.error("Failed to save General Info:", error);
      setErrors({ general: `Gagal menyimpan data: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onCancel}
    >
      <motion.div
        className="bg-white rounded-3xl max-w-2xl w-full overflow-y-auto max-h-[90vh] relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
        <div className="p-6">
          <h3
            className="text-xl font-merriweather font-bold mb-4"
            style={{ color: colorPalette.text }}
          >
            {info ? "Edit Info Umum" : "Tambah Info Umum"}
          </h3>
          {errors.general && (
            <div className="bg-red-100 text-red-700 font-inter text-sm p-3 rounded-lg mb-4">
              {errors.general}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-inter text-gray-600">
                Kategori
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-inter"
              >
                <option value="">Pilih Kategori</option>
                <option value="Profil">Profil</option>
                <option value="Geografis">Geografis</option>
                <option value="Demografi">Demografi</option>
                <option value="Sejarah">Sejarah</option>
              </select>
              {errors.category && (
                <p className="text-red-600 text-xs mt-1">{errors.category}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-inter text-gray-600">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.content.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-inter"
                placeholder="Deskripsi info..."
                rows="6"
              />
              {errors.description && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <motion.button
                onClick={onCancel}
                className="px-6 py-2 rounded-full font-inter font-semibold text-gray-600 border border-gray-300"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                Batal
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-6 py-2 rounded-full font-inter font-semibold text-white ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{ backgroundColor: colorPalette.primary }}
                whileHover={{
                  scale: loading ? 1 : 1.05,
                  backgroundColor: loading
                    ? colorPalette.primary
                    : colorPalette.secondary,
                }}
                transition={{ duration: 0.3 }}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GeneralInfoForm;

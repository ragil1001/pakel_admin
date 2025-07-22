import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colorPalette } from "../colors";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { createUmkm, updateUmkm } from "../utils/firebaseUtils";
import { convertImageToBase64 } from "../utils/imageUtils";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// Komponen InputField yang dioptimalkan
const InputField = React.memo(
  ({
    label,
    name,
    value,
    onChange,
    error,
    type = "text",
    placeholder,
    rows,
    required = true,
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
            error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
            error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        />
      )}
      {error && (
        <div className="flex items-center text-red-600 text-sm mt-1">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.error === nextProps.error &&
      prevProps.name === nextProps.name &&
      prevProps.label === nextProps.label &&
      prevProps.type === nextProps.type &&
      prevProps.placeholder === nextProps.placeholder &&
      prevProps.rows === nextProps.rows &&
      prevProps.required === nextProps.required
    );
  }
);

// Komponen ImageUpload yang dioptimalkan
const ImageUpload = React.memo(
  ({ label, onChange, currentImage, error }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <label className="relative cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={onChange}
              className="hidden"
            />
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-emerald-400 transition-colors ${
                error
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Klik untuk upload gambar</p>
              <p className="text-xs text-gray-500 mt-1">
                JPEG, PNG, JPG (Max 5MB)
              </p>
            </div>
          </label>
        </div>
        {currentImage && (
          <div className="flex-shrink-0">
            <img
              src={currentImage}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center text-red-600 text-sm mt-1">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.currentImage === nextProps.currentImage &&
      prevProps.error === nextProps.error &&
      prevProps.label === nextProps.label
    );
  }
);

const UmkmForm = ({ umkm, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    description: "",
    price: "",
    image: "",
    whatsapp: "",
    location: "",
    bio: "",
    variants: [],
  });
  const [variantForm, setVariantForm] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    image: "",
  });
  const [errors, setErrors] = useState({});
  const [variantErrors, setVariantErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (umkm) {
      setFormData({
        name: umkm.name || "",
        owner: umkm.owner || "",
        description: umkm.description || "",
        price: umkm.price || "",
        image: umkm.image || "",
        whatsapp: umkm.whatsapp || "",
        location: umkm.location || "",
        bio: umkm.bio || "",
        variants: Array.isArray(umkm.variants) ? umkm.variants : [],
      });
    }
  }, [umkm]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Nama produk wajib diisi.";
    if (!formData.owner) newErrors.owner = "Pemilik wajib diisi.";
    if (!formData.description) newErrors.description = "Deskripsi wajib diisi.";
    if (!formData.price) newErrors.price = "Harga wajib diisi.";
    if (!formData.whatsapp) {
      newErrors.whatsapp = "Nomor WhatsApp wajib diisi.";
    } else if (!/^\+62\d{9,12}$/.test(formData.whatsapp)) {
      newErrors.whatsapp =
        "Nomor WhatsApp harus dimulai dengan +62 dan berisi 9-12 digit.";
    }
    if (!formData.location) newErrors.location = "Lokasi wajib diisi.";
    if (!formData.bio) newErrors.bio = "Bio pemilik wajib diisi.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateVariant = useCallback(() => {
    const newErrors = {};
    if (!variantForm.name) newErrors.name = "Nama varian wajib diisi.";
    if (!variantForm.description)
      newErrors.description = "Deskripsi varian wajib diisi.";
    if (!variantForm.price) newErrors.price = "Harga varian wajib diisi.";
    if (!variantForm.image) newErrors.image = "Gambar varian wajib diisi.";
    setVariantErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [variantForm]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleImageChange = useCallback(async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const base64 = await convertImageToBase64(file);
      setFormData((prev) => ({ ...prev, image: base64 }));
      setErrors((prev) => ({ ...prev, image: "" }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, image: error.message }));
    }
  }, []);

  const handleVariantChange = useCallback((e) => {
    const { name, value } = e.target;
    setVariantForm((prev) => ({ ...prev, [name]: value }));
    setVariantErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleVariantImageChange = useCallback(async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const base64 = await convertImageToBase64(file);
      setVariantForm((prev) => ({ ...prev, image: base64 }));
      setVariantErrors((prev) => ({ ...prev, image: "" }));
    } catch (error) {
      setVariantErrors((prev) => ({ ...prev, image: error.message }));
    }
  }, []);

  const addVariant = useCallback(() => {
    if (!validateVariant()) return;
    if (formData.variants.length >= 3) {
      setVariantErrors({ general: "Maksimum 3 varian diperbolehkan." });
      return;
    }

    const newVariant = {
      id: `var-${Date.now()}`,
      name: variantForm.name,
      description: variantForm.description,
      price: variantForm.price,
      image: variantForm.image,
    };

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
    setVariantForm({ id: "", name: "", description: "", price: "", image: "" });
    setVariantErrors({});
  }, [formData.variants, variantForm, validateVariant]);

  const removeVariant = useCallback((id) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== id),
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const action = umkm ? "memperbarui" : "menyimpan";
      const confirmResult = await Swal.fire({
        title: `Konfirmasi ${umkm ? "Perbarui" : "Simpan"} UMKM`,
        text: `Apakah Anda yakin ingin ${action} UMKM "${formData.name}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: colorPalette.primary,
        cancelButtonColor: colorPalette.error,
        confirmButtonText: umkm ? "Perbarui" : "Simpan",
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
        if (umkm) {
          await updateUmkm(umkm.id, formData);
        } else {
          await createUmkm(formData);
        }
        onSave();
        toast.success(`UMKM berhasil ${umkm ? "diperbarui" : "disimpan"}!`, {
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
        console.error("Failed to save UMKM:", error);
        setErrors({ general: `Gagal menyimpan data: ${error.message}` });
        Swal.fire({
          title: "Gagal!",
          text: `Terjadi kesalahan saat ${action} UMKM: ${error.message}`,
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
    [formData, umkm, onSave, validateForm]
  );

  const tabs = [
    { id: "basic", label: "Informasi Dasar" },
    { id: "variants", label: "Varian Produk" },
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
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h3 className="text-2xl font-bold text-white">
            {umkm ? "Edit UMKM" : "Tambah UMKM Baru"}
          </h3>
          <p className="text-emerald-100 mt-1">
            {umkm ? "Perbarui informasi UMKM" : "Lengkapi informasi UMKM baru"}
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
                    <InputField
                      label="Nama Produk"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      placeholder="Keripik Singkong Renyah"
                    />
                    <InputField
                      label="Pemilik"
                      name="owner"
                      value={formData.owner}
                      onChange={handleChange}
                      error={errors.owner}
                      placeholder="Ibu Siti"
                    />
                  </div>

                  <InputField
                    label="Deskripsi Produk"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    type="textarea"
                    rows={4}
                    placeholder="Jelaskan produk Anda secara detail..."
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Harga"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      error={errors.price}
                      placeholder="Rp 25.000/pack"
                    />
                    <InputField
                      label="Nomor WhatsApp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      error={errors.whatsapp}
                      placeholder="+6281234567890"
                    />
                  </div>

                  <InputField
                    label="Lokasi (URL Google Maps)"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    error={errors.location}
                    placeholder="https://www.google.com/maps/place/Pakel"
                  />

                  <InputField
                    label="Bio Pemilik"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    error={errors.bio}
                    type="textarea"
                    rows={3}
                    placeholder="Ceritakan tentang pemilik UMKM..."
                  />

                  <ImageUpload
                    label="Gambar Produk"
                    onChange={handleImageChange}
                    currentImage={formData.image}
                    error={errors.image}
                  />
                </motion.div>
              )}

              {activeTab === "variants" && (
                <motion.div
                  key="variants"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Varian Produk
                    </h4>
                    <p className="text-sm text-blue-700">
                      Tambahkan hingga 3 varian produk untuk memberikan pilihan
                      lebih kepada pelanggan.
                    </p>
                  </div>

                  {/* Existing Variants */}
                  {formData.variants.length > 0 && (
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900">
                        Varian Tersimpan
                      </h5>
                      {formData.variants.map((variant) => (
                        <motion.div
                          key={variant.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
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
                                {variant.price}
                              </p>
                            </div>
                            <button
                              onClick={() => removeVariant(variant.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Add New Variant */}
                  {formData.variants.length < 3 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h5 className="font-medium text-gray-900 mb-4">
                        Tambah Varian Baru
                      </h5>

                      {variantErrors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <span className="text-red-700 font-medium">
                              {variantErrors.general}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField
                            label="Nama Varian"
                            name="name"
                            value={variantForm.name}
                            onChange={handleVariantChange}
                            error={variantErrors.name}
                            placeholder="Rasa Pedas"
                          />
                          <InputField
                            label="Harga Varian"
                            name="price"
                            value={variantForm.price}
                            onChange={handleVariantChange}
                            error={variantErrors.price}
                            placeholder="Rp 30.000/pack"
                          />
                        </div>

                        <InputField
                          label="Deskripsi Varian"
                          name="description"
                          value={variantForm.description}
                          onChange={handleVariantChange}
                          error={variantErrors.description}
                          type="textarea"
                          rows={2}
                          placeholder="Deskripsi varian..."
                        />

                        <ImageUpload
                          label="Gambar Varian"
                          onChange={handleVariantImageChange}
                          currentImage={variantForm.image}
                          error={variantErrors.image}
                        />

                        <div className="flex justify-end">
                          <motion.button
                            onClick={addVariant}
                            className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Varian
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  )}
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
                `${umkm ? "Perbarui" : "Simpan"} UMKM`
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UmkmForm;

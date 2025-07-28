import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, AlertCircle, Image as ImageIcon } from "lucide-react";
import { createGallery, updateGallery } from "../utils/firebaseUtils";
import {
  compressImageToBase64,
  convertImageToBase64,
} from "../utils/imageUtils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { colorPalette } from "../colors";
import { useAuth } from "../context/AuthContext";
import { translate } from "../utils/translations";

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
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 form-input resize-none ${
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
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 form-input ${
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

const ImageUpload = React.memo(
  ({ label, onChange, currentImage, error, language, imageProcessing }) => (
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
              disabled={imageProcessing}
            />
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                imageProcessing
                  ? "border-blue-300 bg-blue-50 cursor-not-allowed"
                  : error
                  ? "border-red-300 bg-red-50 hover:border-red-400"
                  : "border-gray-300 hover:bg-gray-50 hover:border-emerald-400"
              }`}
            >
              {imageProcessing ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-sm text-blue-600">
                    {translate("processing_image", language) ||
                      "Processing image..."}
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {translate("upload_image", language)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, JPG (Max 5MB, will be compressed to ~1MB when
                    saving)
                  </p>
                </>
              )}
            </div>
          </label>
        </div>
        {currentImage && (
          <div className="flex-shrink-0 relative">
            <img
              src={currentImage}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg border border-gray-300"
            />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <ImageIcon className="w-3 h-3 text-white" />
            </div>
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
      prevProps.label === nextProps.label &&
      prevProps.language === nextProps.language &&
      prevProps.imageProcessing === nextProps.imageProcessing
    );
  }
);

const GalleryForm = ({ gallery, onSave, onCancel }) => {
  const { userSettings } = useAuth();
  const [formData, setFormData] = useState({
    type: "Kegiatan",
    name: "",
    date: "",
    description: "",
    image: "",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [originalImage, setOriginalImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageProcessing, setImageProcessing] = useState(false);

  useEffect(() => {
    if (gallery) {
      setFormData({
        type: gallery.type || "Kegiatan",
        name: gallery.name || "",
        date: gallery.date || "",
        description: gallery.description || "",
        image: gallery.image || "",
      });
      setOriginalImage(gallery.image || "");
      if (gallery.date) {
        let dateObj;
        if (gallery.date.includes("/")) {
          const [day, month, year] = gallery.date.split("/");
          dateObj = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );
        } else {
          const [day, month, year] = gallery.date.split(" ");
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
          dateObj = new Date(
            parseInt(year),
            monthMap[month] || parseInt(month) - 1,
            parseInt(day)
          );
        }
        if (!isNaN(dateObj.getTime())) {
          setSelectedDate(dateObj);
        } else {
          setErrors((prev) => ({
            ...prev,
            date: translate("date_invalid", userSettings.language),
          }));
        }
      }
    }
  }, [gallery, userSettings.language]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.type)
      newErrors.type = translate("type_required", userSettings.language);
    if (!formData.name)
      newErrors.name = translate("name_required", userSettings.language);
    if (!formData.date)
      newErrors.date = translate("date_required", userSettings.language);
    if (!formData.description)
      newErrors.description = translate(
        "description_required",
        userSettings.language
      );
    if (!originalImage && !imageFile)
      newErrors.image = translate("image_required", userSettings.language);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, originalImage, imageFile, userSettings.language]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleImageChange = useCallback(
    async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;

        setImageProcessing(true);
        const previewBase64 = await convertImageToBase64(file);
        setOriginalImage(previewBase64);
        setImageFile(file);
        setErrors((prev) => ({ ...prev, image: "" }));
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          image: translate("image_error", userSettings.language, {
            error: error.message,
          }),
        }));
      } finally {
        setImageProcessing(false);
      }
    },
    [userSettings.language]
  );

  const handleDateChange = useCallback(
    (date) => {
      setSelectedDate(date);
      if (date) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        let formattedDate;
        switch (userSettings.dateFormat) {
          case "mm/dd/yyyy":
            formattedDate = `${month}/${day}/${year}`;
            break;
          case "yyyy-mm-dd":
            formattedDate = `${year}-${month}-${day}`;
            break;
          case "dd/mm/yyyy":
          default:
            formattedDate = `${day}/${month}/${year}`;
            break;
        }
        setFormData((prev) => ({ ...prev, date: formattedDate }));
        setErrors((prev) => ({ ...prev, date: "" }));
      } else {
        setFormData((prev) => ({ ...prev, date: "" }));
      }
    },
    [userSettings.dateFormat]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const action = gallery
        ? translate("update", userSettings.language)
        : translate("save", userSettings.language);
      const confirmResult = await Swal.fire({
        title: translate(
          gallery ? "confirm_update_gallery" : "confirm_save_gallery",
          userSettings.language
        ),
        text: translate("confirm_gallery_action_text", userSettings.language, {
          action,
          name: formData.name,
        }),
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: colorPalette.primary,
        cancelButtonColor: colorPalette.error,
        confirmButtonText: gallery
          ? translate("update", userSettings.language)
          : translate("save", userSettings.language),
        cancelButtonText: translate("cancel", userSettings.language),
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
        let finalFormData = { ...formData };

        if (imageFile) {
          const compressedBase64 = await compressImageToBase64(imageFile);
          finalFormData.image = compressedBase64;
        } else if (originalImage) {
          finalFormData.image = originalImage;
        }

        console.log("Data to be saved:", finalFormData);

        if (gallery) {
          await updateGallery(gallery.id, finalFormData);
        } else {
          await createGallery(finalFormData);
        }
        onSave();
        toast.success(
          translate(
            gallery ? "gallery_updated_success" : "gallery_saved_success",
            userSettings.language
          ),
          {
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
          }
        );
      } catch (error) {
        console.error("Failed to save Gallery:", error);
        setErrors({
          general: translate("error_save_gallery", userSettings.language, {
            error: error.message,
          }),
        });
        Swal.fire({
          title: translate("error", userSettings.language),
          text: translate("error_save_gallery", userSettings.language, {
            error: error.message,
          }),
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
    [
      formData,
      gallery,
      onSave,
      validateForm,
      userSettings.language,
      imageFile,
      originalImage,
    ]
  );

  const tabs = [
    {
      id: "basic",
      label: translate("basic_info", userSettings.language),
    },
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
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6 relative flex-shrink-0">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h3 className="text-2xl font-bold text-white">
            {gallery
              ? translate("edit_gallery", userSettings.language)
              : translate("add_new_gallery", userSettings.language)}
          </h3>
          <p className="text-emerald-100 mt-1">
            {gallery
              ? translate("update_gallery_info", userSettings.language)
              : translate("complete_gallery_info", userSettings.language)}
          </p>
        </div>
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
                        {translate("type", userSettings.language)}
                        <span className="text-red-500 ml-1">*</span>
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
                        <option value="Kegiatan">
                          {translate("activity", userSettings.language)}
                        </option>
                        <option value="Rapat">
                          {translate("meeting", userSettings.language)}
                        </option>
                        <option value="Festival">
                          {translate("festival", userSettings.language)}
                        </option>
                        <option value="Pelatihan">
                          {translate("training", userSettings.language)}
                        </option>
                      </select>
                      {errors.type && (
                        <div className="flex items-center text-red-600 text-sm mt-1">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.type}
                        </div>
                      )}
                    </div>
                    <InputField
                      label={translate("activity_name", userSettings.language)}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      placeholder={translate(
                        "activity_name_placeholder",
                        userSettings.language
                      )}
                    />
                  </div>
                  <InputField
                    label={translate("description", userSettings.language)}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    type="textarea"
                    rows={4}
                    placeholder={translate(
                      "description_placeholder",
                      userSettings.language
                    )}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {translate("date", userSettings.language)}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat={
                        userSettings.dateFormat === "yyyy-mm-dd"
                          ? "yyyy-MM-dd"
                          : userSettings.dateFormat === "mm/dd/yyyy"
                          ? "MM/dd/yyyy"
                          : "dd/MM/yyyy"
                      }
                      placeholderText={translate(
                        "select_date",
                        userSettings.language
                      )}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 form-input ${
                        errors.date
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      locale={userSettings.language}
                      required
                    />
                    {errors.date && (
                      <div className="flex items-center text-red-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.date}
                      </div>
                    )}
                  </div>
                  <ImageUpload
                    label={translate("image", userSettings.language)}
                    onChange={handleImageChange}
                    currentImage={originalImage}
                    error={errors.image}
                    language={userSettings.language}
                    imageProcessing={imageProcessing}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <motion.button
              onClick={onCancel}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex-1 sm:flex-none sm:min-w-[120px] text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {translate("cancel", userSettings.language)}
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={loading || imageProcessing}
              className={`px-8 py-3 bg-emerald-600 text-white rounded-lg font-medium transition-all duration-200 flex-1 sm:flex-none sm:min-w-[120px] text-center ${
                loading || imageProcessing
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-emerald-700"
              }`}
              whileHover={loading || imageProcessing ? {} : { scale: 1.02 }}
              whileTap={loading || imageProcessing ? {} : { scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {translate("saving", userSettings.language)}
                </div>
              ) : (
                translate(
                  gallery ? "update_gallery" : "save_gallery",
                  userSettings.language
                )
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GalleryForm;

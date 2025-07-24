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
import {
  compressImageToBase64,
  convertImageToBase64,
} from "../utils/imageUtils";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { translate } from "../utils/translations";

// Optimized InputField component
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
    min,
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
          min={min}
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
      prevProps.required === nextProps.required &&
      prevProps.min === nextProps.min
    );
  }
);

// Optimized ImageUpload component
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

const UmkmForm = ({ umkm, onSave, onCancel }) => {
  const { userSettings } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    description: "",
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
    unit: "pcs", // Default ke pcs
  });
  const [errors, setErrors] = useState({});
  const [variantErrors, setVariantErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [originalImage, setOriginalImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [variantImageProcessing, setVariantImageProcessing] = useState(false);

  useEffect(() => {
    if (umkm) {
      setFormData({
        name: umkm.name || "",
        owner: umkm.owner || "",
        description: umkm.description || "",
        image: umkm.image || "",
        whatsapp: umkm.whatsapp || "",
        location: umkm.location || "",
        bio: umkm.bio || "",
        variants: Array.isArray(umkm.variants)
          ? umkm.variants.map((v) => ({ ...v, unit: v.unit || "pcs" }))
          : [], // Default unit jika data lama
      });
      setOriginalImage(umkm.image || "");
    }
  }, [umkm]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name)
      newErrors.name = translate("name_required", userSettings.language);
    if (!formData.owner)
      newErrors.owner = translate("owner_required", userSettings.language);
    if (!formData.description)
      newErrors.description = translate(
        "description_required",
        userSettings.language
      );
    if (!originalImage && !imageFile)
      newErrors.image = translate("image_required", userSettings.language);
    if (!formData.whatsapp) {
      newErrors.whatsapp = translate(
        "whatsapp_required",
        userSettings.language
      );
    } else if (!/^\+62\d{9,12}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = translate("whatsapp_invalid", userSettings.language);
    }
    if (!formData.location)
      newErrors.location = translate(
        "location_required",
        userSettings.language
      );
    if (!formData.bio)
      newErrors.bio = translate("bio_required", userSettings.language);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, originalImage, imageFile, userSettings.language]);

  const validateVariant = useCallback(() => {
    const newErrors = {};
    if (!variantForm.name)
      newErrors.name = translate(
        "variant_name_required",
        userSettings.language
      );
    if (!variantForm.description)
      newErrors.description = translate(
        "variant_description_required",
        userSettings.language
      );
    if (!variantForm.price)
      newErrors.price = translate(
        "variant_price_required",
        userSettings.language
      );
    else if (isNaN(variantForm.price) || variantForm.price <= 0)
      newErrors.price = translate(
        "variant_price_invalid",
        userSettings.language
      );
    if (!variantForm.image)
      newErrors.image = translate(
        "variant_image_required",
        userSettings.language
      );
    if (!variantForm.unit)
      newErrors.unit = translate(
        "variant_unit_required",
        userSettings.language
      );
    setVariantErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [variantForm, userSettings.language]);

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

  const handleVariantChange = useCallback((e) => {
    const { name, value, type } = e.target;
    const newValue = type === "radio" ? value : value; // Handle radio
    setVariantForm((prev) => ({ ...prev, [name]: newValue }));
    setVariantErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleVariantImageChange = useCallback(
    async (e) => {
      try {
        const file = e.target.files[0];
        if (!file) return;

        setVariantImageProcessing(true);
        const compressedBase64 = await compressImageToBase64(file);
        setVariantForm((prev) => ({ ...prev, image: compressedBase64 }));
        setVariantErrors((prev) => ({ ...prev, image: "" }));
      } catch (error) {
        setVariantErrors((prev) => ({
          ...prev,
          image: translate("image_error", userSettings.language, {
            error: error.message,
          }),
        }));
      } finally {
        setVariantImageProcessing(false);
      }
    },
    [userSettings.language]
  );

  const addVariant = useCallback(() => {
    if (!validateVariant()) return;
    if (formData.variants.length >= 3) {
      setVariantErrors({
        general: translate("max_variants", userSettings.language),
      });
      return;
    }

    const newVariant = {
      id: `var-${Date.now()}`,
      name: variantForm.name,
      description: variantForm.description,
      price: variantForm.price,
      image: variantForm.image,
      unit: variantForm.unit,
    };

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
    setVariantForm({
      id: "",
      name: "",
      description: "",
      price: "",
      image: "",
      unit: "pcs",
    });
    setVariantErrors({});
  }, [formData.variants, variantForm, validateVariant, userSettings.language]);

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

      const action = umkm
        ? translate("update", userSettings.language)
        : translate("save", userSettings.language);
      const confirmResult = await Swal.fire({
        title: translate(
          umkm ? "confirm_update_umkm" : "confirm_save_umkm",
          userSettings.language
        ),
        text: translate("confirm_umkm_action_text", userSettings.language, {
          action,
          name: formData.name,
        }),
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: colorPalette.primary,
        cancelButtonColor: colorPalette.error,
        confirmButtonText: umkm
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

        // Compress main image if a new file was uploaded
        if (imageFile) {
          const compressedBase64 = await compressImageToBase64(imageFile);
          finalFormData.image = compressedBase64;
        } else if (originalImage) {
          finalFormData.image = originalImage;
        }

        // Ensure variants only contain serializable data
        finalFormData.variants = finalFormData.variants.map((variant) => ({
          id: variant.id,
          name: variant.name,
          description: variant.description,
          price: variant.price,
          image: variant.image,
          unit: variant.unit || "pcs", // Default jika data lama
        }));

        console.log("Data to be saved:", finalFormData);
        if (umkm) {
          await updateUmkm(umkm.id, finalFormData);
        } else {
          await createUmkm(finalFormData);
        }
        onSave();
        toast.success(
          translate(
            umkm ? "umkm_updated_success" : "umkm_saved_success",
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
        console.error("Failed to save UMKM:", error);
        setErrors({
          general: translate("error_save_umkm", userSettings.language, {
            error: error.message,
          }),
        });
        Swal.fire({
          title: translate("error", userSettings.language),
          text: translate("error_save_umkm", userSettings.language, {
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
      umkm,
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
    {
      id: "variants",
      label: translate("product_variants", userSettings.language),
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
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6 relative flex-shrink-0">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h3 className="text-2xl font-bold text-white">
            {umkm
              ? translate("edit_umkm", userSettings.language)
              : translate("add_new_umkm", userSettings.language)}
          </h3>
          <p className="text-emerald-100 mt-1">
            {umkm
              ? translate("update_umkm_info", userSettings.language)
              : translate("complete_umkm_info", userSettings.language)}
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
                      label={translate("product_name", userSettings.language)}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      placeholder={translate(
                        "product_name_placeholder",
                        userSettings.language
                      )}
                    />
                    <InputField
                      label={translate("owner", userSettings.language)}
                      name="owner"
                      value={formData.owner}
                      onChange={handleChange}
                      error={errors.owner}
                      placeholder={translate(
                        "owner_placeholder",
                        userSettings.language
                      )}
                    />
                  </div>

                  <InputField
                    label={translate(
                      "product_description",
                      userSettings.language
                    )}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    type="textarea"
                    rows={4}
                    placeholder={translate(
                      "product_description_placeholder",
                      userSettings.language
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label={translate("whatsapp", userSettings.language)}
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      error={errors.whatsapp}
                      placeholder={translate(
                        "whatsapp_placeholder",
                        userSettings.language
                      )}
                    />
                    <InputField
                      label={translate("location", userSettings.language)}
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      error={errors.location}
                      placeholder={translate(
                        "location_placeholder",
                        userSettings.language
                      )}
                    />
                  </div>

                  <InputField
                    label={translate("owner_bio", userSettings.language)}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    error={errors.bio}
                    type="textarea"
                    rows={3}
                    placeholder={translate(
                      "owner_bio_placeholder",
                      userSettings.language
                    )}
                  />

                  <ImageUpload
                    label={translate("product_image", userSettings.language)}
                    onChange={handleImageChange}
                    currentImage={originalImage}
                    error={errors.image}
                    language={userSettings.language}
                    imageProcessing={imageProcessing}
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
                      {translate("product_variants", userSettings.language)}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {translate("variants_description", userSettings.language)}
                    </p>
                  </div>

                  {/* Existing Variants */}
                  {formData.variants.length > 0 && (
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900">
                        {translate("saved_variants", userSettings.language)}
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
                                Rp {variant.price}/{variant.unit || "pcs"}
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
                        {translate("add_new_variant", userSettings.language)}
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
                            label={translate(
                              "variant_name",
                              userSettings.language
                            )}
                            name="name"
                            value={variantForm.name}
                            onChange={handleVariantChange}
                            error={variantErrors.name}
                            placeholder={translate(
                              "variant_name_placeholder",
                              userSettings.language
                            )}
                          />
                          <InputField
                            label={translate(
                              "variant_price",
                              userSettings.language
                            )}
                            name="price"
                            value={variantForm.price}
                            onChange={handleVariantChange}
                            error={variantErrors.price}
                            type="number"
                            min="0"
                            placeholder={translate(
                              "variant_price_placeholder",
                              userSettings.language
                            )}
                          />
                        </div>

                        <InputField
                          label={translate(
                            "variant_description",
                            userSettings.language
                          )}
                          name="description"
                          value={variantForm.description}
                          onChange={handleVariantChange}
                          error={variantErrors.description}
                          type="textarea"
                          rows={2}
                          placeholder={translate(
                            "variant_description_placeholder",
                            userSettings.language
                          )}
                        />

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {translate("variant_unit", userSettings.language)}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="unit"
                                value="pcs"
                                checked={variantForm.unit === "pcs"}
                                onChange={handleVariantChange}
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                /{translate("pcs", userSettings.language)}
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="unit"
                                value="kg"
                                checked={variantForm.unit === "kg"}
                                onChange={handleVariantChange}
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                /{translate("kg", userSettings.language)}
                              </span>
                            </label>
                          </div>
                          {variantErrors.unit && (
                            <div className="flex items-center text-red-600 text-sm mt-1">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {variantErrors.unit}
                            </div>
                          )}
                        </div>

                        <ImageUpload
                          label={translate(
                            "variant_image",
                            userSettings.language
                          )}
                          onChange={handleVariantImageChange}
                          currentImage={variantForm.image}
                          error={variantErrors.image}
                          language={userSettings.language}
                          imageProcessing={variantImageProcessing}
                        />

                        <div className="flex justify-end">
                          <motion.button
                            onClick={addVariant}
                            className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {translate("add_variant", userSettings.language)}
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
              {translate("cancel", userSettings.language)}
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={loading || imageProcessing || variantImageProcessing}
              className={`px-8 py-3 bg-emerald-600 text-white rounded-lg font-medium transition-all duration-200 flex-1 sm:flex-none sm:min-w-[120px] text-center ${
                loading || imageProcessing || variantImageProcessing
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-emerald-700"
              }`}
              whileHover={
                loading || imageProcessing || variantImageProcessing
                  ? {}
                  : { scale: 1.02 }
              }
              whileTap={
                loading || imageProcessing || variantImageProcessing
                  ? {}
                  : { scale: 0.98 }
              }
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {translate("saving", userSettings.language)}
                </div>
              ) : (
                translate(
                  umkm ? "update_umkm" : "save_umkm",
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

export default UmkmForm;

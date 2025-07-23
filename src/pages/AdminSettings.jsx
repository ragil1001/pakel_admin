import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  ChevronLeft,
  Save,
  Globe,
  Clock,
  Lock,
  Layout,
  Shield,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { db } from "../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { translate } from "../utils/translations";
import { colorPalette } from "../colors";

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const AdminSettings = () => {
  const {
    user,
    userSettings,
    setUserSettings,
    globalSettings,
    setGlobalSettings,
  } = useAuth();
  const [pendingSettings, setPendingSettings] = useState(userSettings);
  const [pendingGlobalSettings, setPendingGlobalSettings] =
    useState(globalSettings);
  const [loading, setLoading] = useState(false);
  const [itemsPerPageInput, setItemsPerPageInput] = useState(
    userSettings.itemsPerPage
  );
  const [sessionTimeoutInput, setSessionTimeoutInput] = useState(
    globalSettings.sessionTimeout
  );

  // Debounced values for smooth input
  const debouncedItemsPerPage = useDebounce(itemsPerPageInput, 300);
  const debouncedSessionTimeout = useDebounce(sessionTimeoutInput, 300);

  // Sync debounced values with pending settings
  useEffect(() => {
    const parsedValue = Number(debouncedItemsPerPage);
    if (!isNaN(parsedValue) && parsedValue >= 10 && parsedValue <= 100) {
      setPendingSettings((prev) => ({
        ...prev,
        itemsPerPage: parsedValue,
      }));
    }
  }, [debouncedItemsPerPage]);

  useEffect(() => {
    const parsedValue = Number(debouncedSessionTimeout);
    if (!isNaN(parsedValue) && parsedValue >= 15 && parsedValue <= 480) {
      setPendingGlobalSettings((prev) => ({
        ...prev,
        sessionTimeout: parsedValue,
      }));
    }
  }, [debouncedSessionTimeout]);

  // Load global settings from Firestore
  useEffect(() => {
    const loadGlobalSettings = async () => {
      try {
        const globalSettingsDoc = doc(db, "globalSettings", "security");
        const globalSettingsSnap = await getDoc(globalSettingsDoc);
        if (globalSettingsSnap.exists()) {
          const data = globalSettingsSnap.data();
          setPendingGlobalSettings((prev) => ({
            ...prev,
            ...data,
          }));
          setGlobalSettings((prev) => ({
            ...prev,
            ...data,
          }));
          setSessionTimeoutInput(
            data.sessionTimeout || globalSettings.sessionTimeout
          );
        }
      } catch (error) {
        console.error("Failed to load global settings:", error);
        toast.error(
          translate("settings_load_failed", pendingSettings.language)
        );
      }
    };

    loadGlobalSettings();
  }, [
    pendingSettings.language,
    setGlobalSettings,
    globalSettings.sessionTimeout,
  ]);

  // Handle user-specific setting change
  const handleUserSettingChange = (key, value) => {
    console.log(`Changing ${key} to ${value}`);
    setPendingSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle global setting change
  const handleGlobalSettingChange = (key, value) => {
    console.log(`Changing global ${key} to ${value}`);
    setPendingGlobalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      if (user) {
        console.log("Saving user settings to Firestore:", pendingSettings);
        const userSettingsDoc = doc(db, "userSettings", user.uid);
        await setDoc(userSettingsDoc, pendingSettings, { merge: true });

        // Update global AuthContext user settings
        setUserSettings(pendingSettings);
        console.log("Updated global userSettings:", pendingSettings);

        // Save global security settings
        console.log(
          "Saving global settings to Firestore:",
          pendingGlobalSettings
        );
        const globalSettingsDoc = doc(db, "globalSettings", "security");
        await setDoc(globalSettingsDoc, pendingGlobalSettings, { merge: true });

        // Update global AuthContext global settings
        setGlobalSettings(pendingGlobalSettings);
        console.log("Updated global globalSettings:", pendingGlobalSettings);

        toast.success(translate("settings_saved", pendingSettings.language));
      } else {
        throw new Error("No authenticated user found");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error(translate("settings_save_failed", pendingSettings.language));
    } finally {
      setLoading(false);
    }
  };

  // Reset settings
  const handleResetSettings = async () => {
    const confirmResult = await Swal.fire({
      title: translate("confirm_reset", pendingSettings.language),
      text: translate("confirm_reset_settings_text", pendingSettings.language),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colorPalette.error,
      cancelButtonColor: colorPalette.secondary,
      confirmButtonText: translate("reset", pendingSettings.language),
      cancelButtonText: translate("cancel", pendingSettings.language),
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

    const defaultUserSettings = {
      language: "id",
      dateFormat: "dd/mm/yyyy",
      timeFormat: "24h",
      itemsPerPage: 20,
    };

    const defaultGlobalSettings = {
      sessionTimeout: 120,
      autoLogout: true,
    };

    console.log(
      "Resetting settings to default:",
      defaultUserSettings,
      defaultGlobalSettings
    );
    setPendingSettings(defaultUserSettings);
    setPendingGlobalSettings(defaultGlobalSettings);
    setItemsPerPageInput(20);
    setSessionTimeoutInput(120);

    // Save to Firestore and update global settings
    if (user) {
      await setDoc(doc(db, "userSettings", user.uid), defaultUserSettings, {
        merge: true,
      });
      setUserSettings(defaultUserSettings);
    }
    await setDoc(doc(db, "globalSettings", "security"), defaultGlobalSettings, {
      merge: true,
    });
    setGlobalSettings(defaultGlobalSettings);

    toast.info(translate("settings_reset", pendingSettings.language));
  };

  // Setting components
  const ToggleSwitch = ({
    label,
    description,
    checked,
    onChange,
    icon: Icon,
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start space-x-3">
        {Icon && <Icon className="w-5 h-5 text-gray-600 mt-0.5" />}
        <div>
          <label className="text-sm font-medium text-gray-900">
            {translate(label, pendingSettings.language)}
          </label>
          {description && (
            <p className="text-xs text-gray-500 mt-1">
              {translate(description, pendingSettings.language)}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  const SelectOption = ({
    label,
    description,
    value,
    onChange,
    options,
    icon: Icon,
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start space-x-3 flex-1">
        {Icon && <Icon className="w-5 h-5 text-gray-600 mt-0.5" />}
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-900">
            {translate(label, pendingSettings.language)}
          </label>
          {description && (
            <p className="text-xs text-gray-500 mt-1">
              {translate(description, pendingSettings.language)}
            </p>
          )}
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ml-4 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {translate(option.labelKey, pendingSettings.language)}
          </option>
        ))}
      </select>
    </div>
  );

  const NumberInput = ({
    label,
    description,
    value,
    onChange,
    min,
    max,
    suffix,
    icon: Icon,
  }) => {
    const [inputValue, setInputValue] = useState(value);
    const [error, setError] = useState("");

    // Sync input value with prop value when it changes externally (e.g., on reset)
    useEffect(() => {
      setInputValue(value);
    }, [value]);

    const handleChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      const parsedValue = Number(newValue);
      if (newValue === "") {
        setError(translate("value_required", pendingSettings.language));
      } else if (isNaN(parsedValue)) {
        setError(translate("invalid_number", pendingSettings.language));
      } else if (parsedValue < min || parsedValue > max) {
        setError(
          translate("value_out_of_range", pendingSettings.language, {
            min,
            max,
          })
        );
      } else {
        setError("");
        onChange(parsedValue);
      }
    };

    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-3 flex-1">
          {Icon && <Icon className="w-5 h-5 text-gray-600 mt-0.5" />}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-900">
              {translate(label, pendingSettings.language)}
            </label>
            {description && (
              <p className="text-xs text-gray-500 mt-1">
                {translate(description, pendingSettings.language)}
              </p>
            )}
            {error && (
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={inputValue}
            onChange={handleChange}
            min={min}
            max={max}
            className={`w-20 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-center ${
              error ? "border-red-300 bg-red-50" : "border-gray-300"
            }`}
          />
          {suffix && (
            <span className="text-sm text-gray-500">
              {translate(suffix, pendingSettings.language)}
            </span>
          )}
        </div>
      </div>
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
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-blue-600" />
                  {translate("settings_title", pendingSettings.language)}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {translate("settings_description", pendingSettings.language)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleResetSettings}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {translate("reset", pendingSettings.language)}
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                {loading
                  ? translate("saving", pendingSettings.language)
                  : translate("save", pendingSettings.language)}
              </button>
            </div>
          </div>

          {/* Tampilan & Interface */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {translate("display_interface", pendingSettings.language)}
              </h2>
            </div>
            <div className="space-y-4">
              <SelectOption
                label="language"
                description="language_description"
                value={pendingSettings.language}
                onChange={(value) => handleUserSettingChange("language", value)}
                options={[
                  { value: "id", labelKey: "language_id" },
                  { value: "en", labelKey: "language_en" },
                ]}
                icon={Globe}
              />

              <SelectOption
                label="date_format"
                description="date_format_description"
                value={pendingSettings.dateFormat}
                onChange={(value) =>
                  handleUserSettingChange("dateFormat", value)
                }
                options={[
                  { value: "dd/mm/yyyy", labelKey: "dd/mm/yyyy" },
                  { value: "mm/dd/yyyy", labelKey: "mm/dd/yyyy" },
                  { value: "yyyy-mm-dd", labelKey: "yyyy-mm-dd" },
                ]}
                icon={Clock}
              />

              <SelectOption
                label="time_format"
                description="time_format_description"
                value={pendingSettings.timeFormat}
                onChange={(value) =>
                  handleUserSettingChange("timeFormat", value)
                }
                options={[
                  { value: "24h", labelKey: "time_24h" },
                  { value: "12h", labelKey: "time_12h" },
                ]}
                icon={Clock}
              />

              <NumberInput
                label="items_per_page"
                description="items_per_page_description"
                value={itemsPerPageInput}
                onChange={(value) => setItemsPerPageInput(value)}
                min={10}
                max={100}
                suffix="items"
                icon={Layout}
              />
            </div>
          </div>

          {/* Keamanan & Privasi */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                {translate("security_privacy", pendingSettings.language)}
              </h2>
            </div>
            <div className="space-y-4">
              <NumberInput
                label="session_timeout"
                description="session_timeout_description"
                value={sessionTimeoutInput}
                onChange={(value) => setSessionTimeoutInput(value)}
                min={15}
                max={480}
                suffix="minutes"
                icon={Clock}
              />

              <ToggleSwitch
                label="auto_logout"
                description="auto_logout_description"
                checked={pendingGlobalSettings.autoLogout}
                onChange={(value) =>
                  handleGlobalSettingChange("autoLogout", value)
                }
                icon={Lock}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  {translate("about_settings", pendingSettings.language)}
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    {translate(
                      "about_settings_description",
                      pendingSettings.language
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;

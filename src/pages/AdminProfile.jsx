import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  ChevronLeft,
  Shield,
  Calendar,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { toast } from "react-toastify";
import { translate } from "../utils/translations";

const AdminProfile = () => {
  const { user, userSettings } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Validate password requirements
  useEffect(() => {
    if (passwordForm.newPassword) {
      setPasswordValidation({
        length: passwordForm.newPassword.length >= 8,
        uppercase: /[A-Z]/.test(passwordForm.newPassword),
        lowercase: /[a-z]/.test(passwordForm.newPassword),
        number: /\d/.test(passwordForm.newPassword),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword),
      });
    }
  }, [passwordForm.newPassword]);

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isPasswordValid = () => {
    return (
      Object.values(passwordValidation).every((valid) => valid) &&
      passwordForm.newPassword === passwordForm.confirmPassword &&
      passwordForm.currentPassword.length > 0
    );
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!isPasswordValid()) {
      toast.error(
        translate("password_requirements_not_met", userSettings.language)
      );
      return;
    }

    setLoading(true);
    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordForm.newPassword);

      toast.success(
        translate("password_updated_success", userSettings.language)
      );
      setIsEditing(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === "auth/wrong-password") {
        toast.error(translate("wrong_current_password", userSettings.language));
      } else if (error.code === "auth/weak-password") {
        toast.error(translate("weak_password", userSettings.language));
      } else {
        toast.error(
          translate("password_update_failed", userSettings.language, {
            error: error.message,
          })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return translate("unknown_time", userSettings.language);
    const date = new Date(timestamp);
    const dayName = date.toLocaleDateString(
      userSettings.language === "id" ? "id-ID" : "en-US",
      { weekday: "long" }
    );
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleDateString(
      userSettings.language === "id" ? "id-ID" : "en-US",
      { month: "long" }
    );
    const year = date.getFullYear();
    const hours = String(
      userSettings.timeFormat === "12h"
        ? date.getHours() % 12 || 12
        : date.getHours()
    ).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm =
      userSettings.timeFormat === "12h"
        ? date.getHours() >= 12
          ? "PM"
          : "AM"
        : "";

    const formattedDate =
      userSettings.language === "id"
        ? `${dayName}, ${day} ${month} ${year}`
        : `${dayName}, ${day} ${month} ${year}`;
    const timeString =
      userSettings.timeFormat === "12h"
        ? `${hours}:${minutes} ${ampm}`
        : `${hours}:${minutes}`;

    return userSettings.language === "id"
      ? `${formattedDate}, ${timeString}`
      : `${formattedDate} ${timeString}`;
  };

  const ValidationIcon = ({ isValid }) =>
    isValid ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );

  return (
    <div className="admin-content">
      <div className="admin-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-6"
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
                  <User className="w-6 h-6 mr-3 text-emerald-600" />
                  {translate("admin_profile", userSettings.language)}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {translate(
                    "admin_profile_description",
                    userSettings.language
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6">
              <div className="flex items-center">
                <div className="w-20h-20 bg-white rounded-full flex items-center justify-center mr-6">
                  <User className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">
                    {translate("administrator", userSettings.language)}
                  </h2>
                  <p className="text-emerald-100 flex items-center mt-1">
                    <Mail className="w-4 h-4 mr-2" />
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-gray-600" />
                    {translate("account_info", userSettings.language)}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-500 mr-3" />
                        <span className="text-sm font-medium text-gray-700">
                          {translate("email", userSettings.language)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {user?.email}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                        <span className="text-sm font-medium text-gray-700">
                          {translate("joined", userSettings.language)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatDate(user?.metadata?.creationTime)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                        <span className="text-sm font-medium text-gray-700">
                          {translate("last_login", userSettings.language)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatDate(user?.metadata?.lastSignInTime)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Lock className="w-5 h-5 mr-2 text-gray-600" />
                      {translate("security", userSettings.language)}
                    </h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      {isEditing
                        ? translate("cancel", userSettings.language)
                        : translate("change_password", userSettings.language)}
                    </button>
                  </div>

                  {!isEditing ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 text-emerald-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800">
                            {translate(
                              "password_secure",
                              userSettings.language
                            )}
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            {translate(
                              "password_secure_description",
                              userSettings.language
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleUpdatePassword}
                      className="space-y-4"
                    >
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translate("current_password", userSettings.language)}{" "}
                          *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "currentPassword",
                                e.target.value
                              )
                            }
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder={translate(
                              "current_password_placeholder",
                              userSettings.language
                            )}
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translate("new_password", userSettings.language)} *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "newPassword",
                                e.target.value
                              )
                            }
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder={translate(
                              "new_password_placeholder",
                              userSettings.language
                            )}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Password Requirements */}
                        {passwordForm.newPassword && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              {translate(
                                "password_requirements",
                                userSettings.language
                              )}
                            </p>
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <ValidationIcon
                                  isValid={passwordValidation.length}
                                />
                                <span
                                  className={`text-xs ml-2 ${
                                    passwordValidation.length
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {translate(
                                    "password_length",
                                    userSettings.language
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <ValidationIcon
                                  isValid={passwordValidation.uppercase}
                                />
                                <span
                                  className={`text-xs ml-2 ${
                                    passwordValidation.uppercase
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {translate(
                                    "password_uppercase",
                                    userSettings.language
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <ValidationIcon
                                  isValid={passwordValidation.lowercase}
                                />
                                <span
                                  className={`text-xs ml-2 ${
                                    passwordValidation.lowercase
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {translate(
                                    "password_lowercase",
                                    userSettings.language
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <ValidationIcon
                                  isValid={passwordValidation.number}
                                />
                                <span
                                  className={`text-xs ml-2 ${
                                    passwordValidation.number
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {translate(
                                    "password_number",
                                    userSettings.language
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <ValidationIcon
                                  isValid={passwordValidation.special}
                                />
                                <span
                                  className={`text-xs ml-2 ${
                                    passwordValidation.special
                                      ? "text-green-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {translate(
                                    "password_special",
                                    userSettings.language
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {translate(
                            "confirm_new_password",
                            userSettings.language
                          )}{" "}
                          *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              handlePasswordChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                              passwordForm.confirmPassword &&
                              passwordForm.newPassword !==
                                passwordForm.confirmPassword
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                            placeholder={translate(
                              "confirm_new_password_placeholder",
                              userSettings.language
                            )}
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {passwordForm.confirmPassword &&
                          passwordForm.newPassword !==
                            passwordForm.confirmPassword && (
                            <p className="mt-1 text-xs text-red-600 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {translate(
                                "password_mismatch",
                                userSettings.language
                              )}
                            </p>
                          )}
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {translate("cancel", userSettings.language)}
                        </button>
                        <button
                          type="submit"
                          disabled={!isPasswordValid() || loading}
                          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center ${
                            isPasswordValid() && !loading
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {translate("saving", userSettings.language)}
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              {translate(
                                "save_password",
                                userSettings.language
                              )}
                            </>
                          )}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Tips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6"
          >
            <div className="flex items-start">
              <Shield className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {translate("security_tips", userSettings.language)}
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {translate(
                      "security_tip_strong_password",
                      userSettings.language
                    )}
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {translate(
                      "security_tip_unique_password",
                      userSettings.language
                    )}
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {translate(
                      "security_tip_regular_update",
                      userSettings.language
                    )}
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {translate("security_tip_logout", userSettings.language)}
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminProfile;

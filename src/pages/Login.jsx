import React, { useState } from "react";
import { motion } from "framer-motion";
import { colorPalette } from "../colors";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { loginAdmin } from "../utils/firebaseUtils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { translate } from "../utils/translations";
import logo from "../assets/logo.png";

const Login = () => {
  const { userSettings } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginAdmin(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        translate(
          err.code === "auth/wrong-password"
            ? "wrong_password"
            : err.code === "auth/user-not-found"
            ? "user_not_found"
            : "login_error",
          userSettings.language
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: colorPalette.background }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
              className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-medium"
            >
              <img
                src={logo}
                alt={"logo"}
                className={`h-15 w-auto object-contain rounded-lg`}
              />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 font-merriweather mb-2">
              {translate("admin_login", userSettings.language)}
            </h2>
            <p className="text-sm text-gray-600 font-inter">
              {translate("admin_login_description", userSettings.language)}
            </p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-8">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 font-inter text-sm p-4 rounded-lg mb-6 flex items-center"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 font-inter mb-2"
                >
                  {translate("email", userSettings.language)}
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-inter text-gray-900 placeholder-gray-400 transition-all duration-200"
                    placeholder={translate(
                      "email_placeholder",
                      userSettings.language
                    )}
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 font-inter mb-2"
                >
                  {translate("password", userSettings.language)}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-inter text-gray-900 placeholder-gray-400 transition-all duration-200"
                    placeholder={translate(
                      "password_placeholder",
                      userSettings.language
                    )}
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-inter font-semibold text-white shadow-medium transition-all duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "btn-hover focus-ring"
                }`}
                style={{
                  backgroundColor: loading ? "#9ca3af" : colorPalette.primary,
                }}
                whileHover={loading ? {} : { scale: 1.02 }}
                whileTap={loading ? {} : { scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {translate("processing", userSettings.language)}
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    {translate("login", userSettings.language)}
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Footer Section */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center font-inter">
              {translate("copyright", userSettings.language)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

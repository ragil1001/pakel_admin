import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { colorPalette } from "../colors";
import {
  Edit,
  Trash2,
  MapPin,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { deleteUmkm } from "../utils/firebaseUtils";
import Pagination from "./Pagination";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { translate } from "../utils/translations";

const UmkmTable = ({ umkms, onEdit, onDelete, onShowDetails }) => {
  const { userSettings } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const itemsPerPage = userSettings.itemsPerPage || 10;

  const formatDate = (dateInput) => {
    if (!dateInput) return translate("unknown_time", userSettings.language);

    let date;
    // Handle Firestore Timestamp
    if (typeof dateInput === "object" && dateInput.toDate) {
      date = dateInput.toDate();
    } else if (typeof dateInput === "string") {
      let day, month, year;
      if (dateInput.includes("/")) {
        [day, month, year] = dateInput.split("/");
      } else {
        [day, month, year] = dateInput.split(" ");
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
        month = monthMap[month] || parseInt(month);
      }
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      return translate("unknown_time", userSettings.language);
    }

    if (isNaN(date.getTime()))
      return translate("unknown_time", userSettings.language);

    const dayName = translate(`day_${date.getDay()}`, userSettings.language);
    const monthName = translate(
      `month_${date.getMonth()}`,
      userSettings.language
    );
    const formattedDay = String(date.getDate()).padStart(2, "0");
    return `${dayName}, ${formattedDay} ${monthName} ${date.getFullYear()}`;
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleRowExpansion = (umkmId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(umkmId)) {
      newExpanded.delete(umkmId);
    } else {
      newExpanded.add(umkmId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedUmkms = useMemo(() => {
    const sorted = [...umkms];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key] || "";
        let bValue = b[sortConfig.key] || "";

        if (sortConfig.key === "createdAt") {
          let aDate, bDate;
          if (!aValue) return sortConfig.direction === "asc" ? -1 : 1;
          if (!bValue) return sortConfig.direction === "asc" ? 1 : -1;

          if (typeof aValue === "object" && aValue.toDate) {
            aDate = aValue.toDate();
          } else if (typeof aValue === "string") {
            if (aValue.includes("/")) {
              const [aDay, aMonth, aYear] = aValue.split("/");
              aDate = new Date(aYear, aMonth - 1, aDay);
            } else {
              const [aDay, aMonth, aYear] = aValue.split(" ");
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
              aDate = new Date(aYear, monthMap[aMonth] || aMonth - 1, aDay);
            }
          } else {
            aDate = new Date(0);
          }

          if (typeof bValue === "object" && bValue.toDate) {
            bDate = bValue.toDate();
          } else if (typeof bValue === "string") {
            if (bValue.includes("/")) {
              const [bDay, bMonth, bYear] = bValue.split("/");
              bDate = new Date(bYear, bMonth - 1, bDay);
            } else {
              const [bDay, bMonth, bYear] = bValue.split(" ");
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
              bDate = new Date(bYear, monthMap[bMonth] || bMonth - 1, bDay);
            }
          } else {
            bDate = new Date(0);
          }

          if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }

          return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
        } else {
          aValue = aValue ? aValue.toLowerCase() : "";
          bValue = bValue ? bValue.toLowerCase() : "";
          if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }
      });
    }
    return sorted;
  }, [umkms, sortConfig]);

  const handleDelete = async (id, name) => {
    const confirmResult = await Swal.fire({
      title: translate("confirm_delete_umkm", userSettings.language),
      text: translate("confirm_delete_umkm_text", userSettings.language, {
        name,
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colorPalette.error,
      cancelButtonColor: colorPalette.secondary,
      confirmButtonText: translate("delete", userSettings.language),
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

    try {
      await deleteUmkm(id);
      onDelete();
      toast.success(translate("umkm_deleted_success", userSettings.language), {
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
      console.error("Failed to delete UMKM:", error);
      Swal.fire({
        title: translate("error", userSettings.language),
        text: translate("error_delete_umkm", userSettings.language, {
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
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUmkms = sortedUmkms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedUmkms.length / itemsPerPage);

  if (sortedUmkms.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden">
      {/* Table Header */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {translate("umkm_list", userSettings.language)} ({sortedUmkms.length})
        </h3>
      </div>

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  {translate("product", userSettings.language)}
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 ml-1" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("owner")}
              >
                <div className="flex items-center">
                  {translate("owner", userSettings.language)}
                  {sortConfig.key === "owner" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 ml-1" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translate("variants", userSettings.language)}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  {translate("date", userSettings.language)}
                  {sortConfig.key === "createdAt" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 ml-1" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translate("contact", userSettings.language)}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translate("actions", userSettings.language)}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUmkms.map((umkm, index) => (
              <motion.tr
                key={umkm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {umkm.image && (
                      <div className="flex-shrink-0 h-12 w-12 mr-3">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={umkm.image}
                          alt={
                            umkm.name ||
                            translate("no_title", userSettings.language)
                          }
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/48?text=Image+Not+Found";
                            toast.error(
                              translate("image_error", userSettings.language, {
                                error: "Image failed to load",
                              })
                            );
                          }}
                        />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {umkm.name ||
                          translate("no_title", userSettings.language)}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {umkm.description ||
                          translate("no_content", userSettings.language)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{umkm.owner}</div>
                  <div className="text-sm text-gray-500">{umkm.bio}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {umkm.variants && umkm.variants.length > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {translate("variants_count", userSettings.language, {
                          count: umkm.variants.length,
                        })}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {translate("no_variants", userSettings.language)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(umkm.createdAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {umkm.whatsapp && (
                      <a
                        href={`https://wa.me/${umkm.whatsapp.replace("+", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title={translate("whatsapp", userSettings.language)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    {umkm.location && (
                      <a
                        href={umkm.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title={translate("location", userSettings.language)}
                      >
                        <MapPin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <motion.button
                      onClick={() => onEdit(umkm)}
                      className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-full transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={translate("edit", userSettings.language)}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => onShowDetails(umkm)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={translate("details", userSettings.language)}
                    >
                      <Info className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() =>
                        handleDelete(
                          umkm.id,
                          umkm.name ||
                            translate("no_title", userSettings.language)
                        )
                      }
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={translate("delete", userSettings.language)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout - Visible only on mobile */}
      <div className="lg:hidden divide-y divide-gray-200 bg-white">
        {currentUmkms.map((umkm, index) => (
          <motion.div
            key={umkm.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-4 hover:bg-gray-50 transition-colors duration-200"
          >
            {/* Main Card Content */}
            <div className="flex items-start space-x-3">
              {/* Product Image */}
              {umkm.image && (
                <div className="flex-shrink-0">
                  <img
                    className="h-16 w-16 rounded-lg object-cover"
                    src={umkm.image}
                    alt={
                      umkm.name || translate("no_title", userSettings.language)
                    }
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/64?text=Image+Not+Found";
                    }}
                  />
                </div>
              )}

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {umkm.name ||
                        translate("no_title", userSettings.language)}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {translate("owner", userSettings.language)}: {umkm.owner}
                    </p>
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleRowExpansion(umkm.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {expandedRows.has(umkm.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Basic Info - Always Visible */}
                <div className="mt-2 flex items-center space-x-4">
                  {/* Variants Badge */}
                  <div>
                    {umkm.variants && umkm.variants.length > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {translate("variants_count", userSettings.language, {
                          count: umkm.variants.length,
                        })}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {translate("no_variants", userSettings.language)}
                      </span>
                    )}
                  </div>

                  {/* Contact Icons */}
                  <div className="flex items-center space-x-2">
                    {umkm.whatsapp && (
                      <a
                        href={`https://wa.me/${umkm.whatsapp.replace("+", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title={translate("whatsapp", userSettings.language)}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    {umkm.location && (
                      <a
                        href={umkm.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title={translate("location", userSettings.language)}
                      >
                        <MapPin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Always Visible */}
                <div className="mt-3 flex items-center space-x-2">
                  <motion.button
                    onClick={() => onEdit(umkm)}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    {translate("edit", userSettings.language)}
                  </motion.button>
                  <motion.button
                    onClick={() => onShowDetails(umkm)}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Info className="w-3 h-3 mr-1" />
                    {translate("details", userSettings.language)}
                  </motion.button>
                  <motion.button
                    onClick={() =>
                      handleDelete(
                        umkm.id,
                        umkm.name ||
                          translate("no_title", userSettings.language)
                      )
                    }
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    {translate("delete", userSettings.language)}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Expanded Details - Only visible when expanded */}
            {expandedRows.has(umkm.id) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="space-y-3">
                  {/* Description */}
                  {umkm.description && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translate(
                          "product_description",
                          userSettings.language
                        )}
                      </dt>
                      <dd className="text-sm text-gray-900 mt-1">
                        {umkm.description}
                      </dd>
                    </div>
                  )}

                  {/* Owner Bio */}
                  {umkm.bio && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translate("owner_bio", userSettings.language)}
                      </dt>
                      <dd className="text-sm text-gray-900 mt-1">{umkm.bio}</dd>
                    </div>
                  )}

                  {/* Date */}
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {translate("date", userSettings.language)}
                    </dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {formatDate(umkm.createdAt)}
                    </dd>
                  </div>

                  {/* Contact Details */}
                  {(umkm.whatsapp || umkm.location) && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translate("contact", userSettings.language)}
                      </dt>
                      <dd className="text-sm text-gray-900 mt-1 space-y-1">
                        {umkm.whatsapp && (
                          <div className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                            <span>{umkm.whatsapp}</span>
                          </div>
                        )}
                        {umkm.location && (
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="truncate">{umkm.location}</span>
                          </div>
                        )}
                      </dd>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-700 text-center sm:text-left">
              {translate("showing", userSettings.language, {
                start: indexOfFirstItem + 1,
                end: Math.min(indexOfLastItem, sortedUmkms.length),
                total: sortedUmkms.length,
              })}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(UmkmTable);

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { deleteNews } from "../utils/firebaseUtils";
import Pagination from "./Pagination";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { colorPalette } from "../colors";
import { useAuth } from "../context/AuthContext";
import { translate } from "../utils/translations";

const NewsTable = ({ newsItems, onEdit, onDelete, onShowDetails }) => {
  const { userSettings } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [expandedRows, setExpandedRows] = useState(new Set());
  const itemsPerPage = userSettings.itemsPerPage || 10;

  const formatDate = (dateStr) => {
    if (!dateStr) return translate("unknown_time", userSettings.language);

    let day, month, year;
    if (dateStr.includes("/")) {
      [day, month, year] = dateStr.split("/");
    } else {
      [day, month, year] = dateStr.split(" ");
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
      month = monthMap[month] || parseInt(month) - 1;
    }
    const date = new Date(parseInt(year), parseInt(month), parseInt(day));
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

  const toggleRowExpansion = (newsId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(newsId)) {
      newExpanded.delete(newsId);
    } else {
      newExpanded.add(newsId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedNews = useMemo(() => {
    const sorted = [...newsItems];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "date") {
          let aDate, bDate;
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
  }, [newsItems, sortConfig]);

  const handleDelete = async (id, title) => {
    const confirmResult = await Swal.fire({
      title: translate("confirm_delete_news", userSettings.language),
      text: translate("confirm_delete_news_text", userSettings.language, {
        title,
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
      await deleteNews(id);
      onDelete();
      toast.success(translate("news_deleted_success", userSettings.language), {
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
      console.error("Failed to delete News:", error);
      Swal.fire({
        title: translate("error", userSettings.language),
        text: translate("error_delete_news", userSettings.language, {
          error: error.message,
        }),
        icon: "error",
        confirmButtonColor: colorPalette.primary,
        customClass: {
          popup: "rounded-2xl shadow-xl",
          title: "text-xl font-bold text-gray-900",
          content: "text-gray-600",
          confirmButton: "px-6 py-3 rounded- lg font-medium transition-all",
        },
      });
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNews = sortedNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedNews.length / itemsPerPage);

  if (sortedNews.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden">
      {/* Table Header */}
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {translate("news_list", userSettings.language)} ({sortedNews.length})
        </h3>
      </div>

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center">
                  {translate("title", userSettings.language)}
                  {sortConfig.key === "title" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 ml-1" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("type")}
              >
                <div className="flex items-center">
                  {translate("type", userSettings.language)}
                  {sortConfig.key === "type" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 ml-1" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  {translate("date", userSettings.language)}
                  {sortConfig.key === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ArrowUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 ml-1" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translate("image", userSettings.language)}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {translate("actions", userSettings.language)}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentNews.map((news, index) => (
              <motion.tr
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 break-words">
                    {news.title || translate("no_title", userSettings.language)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {translate(
                      news.type.toLowerCase(),
                      userSettings.language
                    ) || news.type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(news.date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {news.image ? (
                    <div className="flex-shrink-0 h-12 w-12">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={news.image}
                        alt={
                          news.title ||
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
                  ) : (
                    <div className="text-sm text-gray-500">
                      {translate("no_image", userSettings.language)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <motion.button
                      onClick={() => onEdit(news)}
                      className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-full transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={translate("edit", userSettings.language)}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => onShowDetails(news)}
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
                          news.id,
                          news.title ||
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
        {currentNews.map((news, index) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-4 hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-start space-x-3">
              {news.image && (
                <div className="flex-shrink-0">
                  <img
                    className="h-16 w-16 rounded-lg object-cover"
                    src={news.image}
                    alt={
                      news.title || translate("no_title", userSettings.language)
                    }
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/64?text=Image+Not+Found";
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 break-words">
                      {news.title ||
                        translate("no_title", userSettings.language)}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {translate("type", userSettings.language)}:{" "}
                      {translate(
                        news.type.toLowerCase(),
                        userSettings.language
                      ) || news.type}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleRowExpansion(news.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {expandedRows.has(news.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="text-sm text-gray-900">
                    {formatDate(news.date)}
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <motion.button
                    onClick={() => onEdit(news)}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    {translate("edit", userSettings.language)}
                  </motion.button>
                  <motion.button
                    onClick={() => onShowDetails(news)}
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
                        news.id,
                        news.title ||
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
            {expandedRows.has(news.id) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="space-y-3">
                  {!news.image && (
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translate("image", userSettings.language)}
                      </dt>
                      <dd className="text-sm text-gray-500 mt-1">
                        {translate("no_image", userSettings.language)}
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
                end: Math.min(indexOfLastItem, sortedNews.length),
                total: sortedNews.length,
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

export default React.memo(NewsTable);

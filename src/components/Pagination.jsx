import React from "react";
import { motion } from "framer-motion";
import { colorPalette } from "../colors";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, current page range, and last page with ellipsis
      if (currentPage <= 3) {
        // Show first 5 pages + ellipsis + last page
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show first page + ellipsis + last 5 pages
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page + ellipsis + current range + ellipsis + last page
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-1 py-4">
      {/* Previous Button */}
      <motion.button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
          currentPage === 1
            ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
            : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-emerald-300 shadow-sm"
        }`}
        whileHover={currentPage === 1 ? {} : { scale: 1.02 }}
        whileTap={currentPage === 1 ? {} : { scale: 0.98 }}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Previous</span>
      </motion.button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page, index) => {
          if (page === "ellipsis") {
            return (
              <div key={`ellipsis-${index}`} className="px-2 py-2">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </div>
            );
          }

          const isActive = page === currentPage;

          return (
            <motion.button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-emerald-300 shadow-sm"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={false}
              animate={{
                backgroundColor: isActive ? "#059669" : "#ffffff",
                color: isActive ? "#ffffff" : "#374151",
              }}
            >
              {page}
            </motion.button>
          );
        })}
      </div>

      {/* Next Button */}
      <motion.button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
          currentPage === totalPages
            ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
            : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-emerald-300 shadow-sm"
        }`}
        whileHover={currentPage === totalPages ? {} : { scale: 1.02 }}
        whileTap={currentPage === totalPages ? {} : { scale: 0.98 }}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </motion.button>
    </div>
  );
};

export default Pagination;

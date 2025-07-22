import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import { deleteNews } from "../utils/firebaseUtils";
import Pagination from "./Pagination";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { colorPalette } from "../colors";

const NewsTable = ({ newsItems, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const handleDelete = async (id, title) => {
    const confirmResult = await Swal.fire({
      title: "Konfirmasi Hapus Berita",
      text: `Apakah Anda yakin ingin menghapus berita "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colorPalette.error,
      cancelButtonColor: colorPalette.secondary,
      confirmButtonText: "Hapus",
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

    try {
      await deleteNews(id);
      onDelete();
      toast.success("Berita berhasil dihapus!", {
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
        title: "Gagal!",
        text: `Terjadi kesalahan saat menghapus berita: ${error.message}`,
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
  const currentNews = newsItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(newsItems.length / itemsPerPage);

  if (newsItems.length === 0) {
    return null; // Let parent component handle empty state
  }

  return (
    <div className="overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Daftar Berita ({newsItems.length})
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Judul
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gambar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {news.title}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {news.content}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{news.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{news.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {news.image && (
                    <div className="flex-shrink-0 h-12 w-12">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={news.image}
                        alt={news.title}
                      />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => onEdit(news)}
                      className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-full transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(news.id, news.title)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Hapus"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan {indexOfFirstItem + 1} sampai{" "}
              {Math.min(indexOfLastItem, newsItems.length)} dari{" "}
              {newsItems.length} entri
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

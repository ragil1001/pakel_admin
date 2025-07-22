import React from "react";
import { motion } from "framer-motion";
import { colorPalette } from "../colors";
import { Edit, Trash2 } from "lucide-react";
import { deleteGeneralInfo } from "../utils/firebaseUtils";
import Pagination from "./Pagination";

const GeneralInfoTable = ({ generalInfo, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus info ini?")) {
      try {
        await deleteGeneralInfo(id);
        onDelete();
      } catch (error) {
        console.error("Failed to delete General Info:", error);
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGeneralInfo = generalInfo.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(generalInfo.length / itemsPerPage);

  return (
    <div>
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th
                className="px-6 py-3 text-left font-inter font-semibold text-sm"
                style={{ color: colorPalette.text }}
              >
                Kategori
              </th>
              <th
                className="px-6 py-3 text-left font-inter font-semibold text-sm"
                style={{ color: colorPalette.text }}
              >
                Konten
              </th>
              <th
                className="px-6 py-3 text-left font-inter font-semibold text-sm"
                style={{ color: colorPalette.text }}
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {currentGeneralInfo.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-4 text-center font-inter text-gray-600"
                >
                  Tidak ada data info umum.
                </td>
              </tr>
            ) : (
              currentGeneralInfo.map((info, index) => (
                <motion.tr
                  key={info.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-t"
                >
                  <td
                    className="px-6 py-4 font-inter text-sm"
                    style={{ color: colorPalette.text }}
                  >
                    {info.category}
                  </td>
                  <td
                    className="px-6 py-4 font-inter text-sm"
                    style={{ color: colorPalette.text }}
                  >
                    {info.content?.description?.substring(0, 50) || "N/A"}...
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <motion.button
                      onClick={() => onEdit(info)}
                      className="p-2 rounded-full"
                      style={{ backgroundColor: colorPalette.secondary }}
                      whileHover={{
                        scale: 1.1,
                        backgroundColor: colorPalette.primary,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(info.id)}
                      className="p-2 rounded-full"
                      style={{ backgroundColor: colorPalette.accent }}
                      whileHover={{ scale: 1.1, backgroundColor: "#EF4444" }}
                      transition={{ duration: 0.3 }}
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default React.memo(GeneralInfoTable);

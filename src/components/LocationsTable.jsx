import React from "react";
import { motion } from "framer-motion";
import { colorPalette } from "../colors";
import { Edit, Trash2 } from "lucide-react";
import { deleteLocation } from "../utils/firebaseUtils";
import Pagination from "./Pagination";

const LocationsTable = ({ locations, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus lokasi ini?")) {
      try {
        await deleteLocation(id);
        onDelete();
      } catch (error) {
        console.error("Failed to delete Location:", error);
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLocations = locations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(locations.length / itemsPerPage);

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
                Nama
              </th>
              <th
                className="px-6 py-3 text-left font-inter font-semibold text-sm"
                style={{ color: colorPalette.text }}
              >
                Alamat
              </th>
              <th
                className="px-6 py-3 text-left font-inter font-semibold text-sm"
                style={{ color: colorPalette.text }}
              >
                Tipe
              </th>
              <th
                className="px-6 py-3 text-left font-inter font-semibold text-sm"
                style={{ color: colorPalette.text }}
              >
                Koordinat
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
            {currentLocations.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center font-inter text-gray-600"
                >
                  Tidak ada data lokasi.
                </td>
              </tr>
            ) : (
              currentLocations.map((loc, index) => (
                <motion.tr
                  key={loc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border-t"
                >
                  <td
                    className="px-6 py-4 font-inter text-sm"
                    style={{ color: colorPalette.text }}
                  >
                    {loc.name}
                  </td>
                  <td
                    className="px-6 py-4 font-inter text-sm"
                    style={{ color: colorPalette.text }}
                  >
                    {loc.address}
                  </td>
                  <td
                    className="px-6 py-4 font-inter text-sm"
                    style={{ color: colorPalette.text }}
                  >
                    {loc.placeType}
                  </td>
                  <td
                    className="px-6 py-4 font-inter text-sm"
                    style={{ color: colorPalette.text }}
                  >
                    {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                  </td>
                  <td className="px-6 py-4 flex space-x-2">
                    <motion.button
                      onClick={() => onEdit(loc)}
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
                      onClick={() => handleDelete(loc.id)}
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

export default React.memo(LocationsTable);

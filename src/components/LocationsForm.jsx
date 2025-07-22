import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colorPalette } from "../colors";
import { X } from "lucide-react";
import { createLocation, updateLocation } from "../utils/firebaseUtils";
import { addPlaceToGoogleMaps } from "../utils/googleMapsUtils";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = {
  lat: -7.797068,
  lng: 110.370529,
};

const LocationsForm = ({ location, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: -7.797068,
    longitude: 110.370529,
    placeType: "",
    description: "",
  });
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || "",
        address: location.address || "",
        latitude: location.latitude || -7.797068,
        longitude: location.longitude || 110.370529,
        placeType: location.placeType || "",
        description: location.description || "",
      });
      setMarkerPosition({
        lat: location.latitude || -7.797068,
        lng: location.longitude || 110.370529,
      });
    }
  }, [location]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Nama wajib diisi.";
    if (!formData.address) newErrors.address = "Alamat wajib diisi.";
    if (!formData.placeType) newErrors.placeType = "Tipe tempat wajib diisi.";
    if (!formData.latitude || !formData.longitude)
      newErrors.coordinates = "Koordinat wajib dipilih.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setMarkerPosition({ lat, lng });
    setErrors((prev) => ({ ...prev, coordinates: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let savedLocation;
      if (location) {
        savedLocation = await updateLocation(location.id, formData);
      } else {
        savedLocation = await createLocation(formData);
        // Submit to Google Maps Places API
        await addPlaceToGoogleMaps({
          name: formData.name,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          placeType: formData.placeType,
        });
      }
      onSave();
    } catch (error) {
      console.error("Failed to save Location:", error);
      setErrors({ general: `Gagal menyimpan data: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onCancel}
    >
      <motion.div
        className="bg-white rounded-3xl max-w-lg w-full overflow-y-auto max-h-[90vh] relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
        <div className="p-6">
          <h3
            className="text-xl font-merriweather font-bold mb-4"
            style={{ color: colorPalette.text }}
          >
            {location ? "Edit Lokasi" : "Tambah Lokasi"}
          </h3>
          {errors.general && (
            <div className="bg-red-100 text-red-700 font-inter text-sm p-3 rounded-lg mb-4">
              {errors.general}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-inter text-gray-600">
                Nama
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-inter"
                placeholder="Nama Usaha"
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-inter text-gray-600">
                Alamat
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-inter"
                placeholder="Jalan Contoh No. 123"
              />
              {errors.address && (
                <p className="text-red-600 text-xs mt-1">{errors.address}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-inter text-gray-600">
                Tipe Tempat
              </label>
              <select
                name="placeType"
                value={formData.placeType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-inter"
              >
                <option value="">Pilih Tipe</option>
                <option value="store">Toko</option>
                <option value="restaurant">Restoran</option>
                <option value="cafe">Kafe</option>
                <option value="other">Lainnya</option>
              </select>
              {errors.placeType && (
                <p className="text-red-600 text-xs mt-1">{errors.placeType}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-inter text-gray-600">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-inter"
                placeholder="Deskripsi singkat tentang lokasi"
              />
            </div>
            <div>
              <label className="block text-sm font-inter text-gray-600">
                Pilih Lokasi di Peta
              </label>
              <LoadScript
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={markerPosition}
                  zoom={15}
                  onClick={handleMapClick}
                >
                  {markerPosition && <Marker position={markerPosition} />}
                </GoogleMap>
              </LoadScript>
              {errors.coordinates && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.coordinates}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <motion.button
                onClick={onCancel}
                className="px-6 py-2 rounded-full font-inter font-semibold text-gray-600 border border-gray-300"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                Batal
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-6 py-2 rounded-full font-inter font-semibold text-white ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{ backgroundColor: colorPalette.primary }}
                whileHover={{
                  scale: loading ? 1 : 1.05,
                  backgroundColor: loading
                    ? colorPalette.primary
                    : colorPalette.secondary,
                }}
                transition={{ duration: 0.3 }}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LocationsForm;

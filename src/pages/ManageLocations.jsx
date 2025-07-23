import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { colorPalette } from "../colors";
import { Plus } from "lucide-react";
import LocationsForm from "../components/LocationsForm";
import SearchBar from "../components/SearchBar";
import Notification from "../components/Notification";
import { getLocations } from "../utils/firebaseUtils";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const LocationsTable = React.lazy(() => import("../components/LocationsTable"));

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: -7.797068, // Default center (Yogyakarta, adjust as needed)
  lng: 110.370529,
};

const ManageLocations = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        setLocations(data);
        setFilteredLocations(data);
      } catch (error) {
        console.error("Failed to fetch Locations:", error);
        // showNotification("Gagal memuat lokasi.", "error");
      }
    };
    fetchLocations();
  }, []);

  const handleAdd = () => {
    setSelectedLocation(null);
    setIsFormOpen(true);
  };

  const handleEdit = (location) => {
    setSelectedLocation(location);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedLocation(null);
  };

  const handleSave = () => {
    getLocations()
      .then((data) => {
        setLocations(data);
        setFilteredLocations(data);
        // showNotification("Lokasi berhasil disimpan.", "success");
      })
      .catch((error) => {
        console.error("Failed to refresh Locations:", error);
        // showNotification("Gagal menyegarkan lokasi.", "error");
      });
    handleCloseForm();
  };

  const handleSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    setFilteredLocations(
      locations.filter((loc) => loc.name.toLowerCase().includes(lowerQuery))
    );
  };

  // const showNotification = (message, type) => {
  //   setNotification({ message, type });
  //   setTimeout(() => setNotification(null), 3000);
  // };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-[1400px] mx-auto py-12 px-4 sm:px-6 lg:px-8"
    >
      {notification && (
        <Notification message={notification.message} type={notification.type} />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-3xl font-merriweather font-bold"
          style={{ color: colorPalette.text }}
        >
          Kelola Lokasi
        </h2>
        <motion.button
          onClick={handleAdd}
          className="flex items-center px-6 py-3 rounded-full font-inter font-semibold text-white"
          style={{ backgroundColor: colorPalette.primary }}
          whileHover={{ scale: 1.05, backgroundColor: colorPalette.secondary }}
          transition={{ duration: 0.3 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Lokasi
        </motion.button>
      </div>
      <SearchBar onSearch={handleSearch} placeholder="Cari lokasi..." />
      <div className="mb-6">
        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
          >
            {filteredLocations.map((loc) => (
              <Marker
                key={loc.id}
                position={{ lat: loc.latitude, lng: loc.longitude }}
                title={loc.name}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
      <Suspense
        fallback={<div className="text-center py-4">Memuat tabel...</div>}
      >
        <LocationsTable
          locations={filteredLocations}
          onEdit={handleEdit}
          onDelete={handleSave}
        />
      </Suspense>
      {isFormOpen && (
        <LocationsForm
          location={selectedLocation}
          onSave={handleSave}
          onCancel={handleCloseForm}
        />
      )}
    </motion.div>
  );
};

export default ManageLocations;

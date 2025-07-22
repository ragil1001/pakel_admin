import React from "react";
import { motion } from "framer-motion";

const Notification = ({ message, type }) => {
  const bgColor =
    type === "success"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 p-4 rounded-lg font-inter text-sm ${bgColor}`}
    >
      {message}
    </motion.div>
  );
};

export default Notification;

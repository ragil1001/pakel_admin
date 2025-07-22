// src/components/Footer.jsx
import React from "react";
import { colorPalette } from "../colors";

const Footer = () => {
  return (
    <footer
      className="bg-white py-6 mt-auto"
      style={{ color: colorPalette.text }}
    >
      <div className="max-w-[1400px] mx-auto px-6 text-center">
        <p className="text-sm font-inter">
          &copy; 2025 Padukuhan Pakel Admin. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { colorPalette } from "../colors";

const SearchBar = ({ onSearch, placeholder = "Cari..." }) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="relative">
      <div
        className={`relative flex items-center transition-all duration-200 ${
          isFocused
            ? "ring-2 ring-emerald-500 ring-opacity-50"
            : "ring-1 ring-gray-300"
        } rounded-lg bg-white`}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search
            className={`h-5 w-5 transition-colors duration-200 ${
              isFocused ? "text-emerald-600" : "text-gray-400"
            }`}
          />
        </div>

        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border-0 bg-transparent placeholder-gray-500 focus:outline-none focus:ring-0 text-sm"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search suggestions or quick filters can be added here */}
      {isFocused && query && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          <div className="p-3 text-sm text-gray-600">
            Tekan Enter untuk mencari: "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

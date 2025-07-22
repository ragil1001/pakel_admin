import React from "react";
import { colorPalette } from "../colors";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-[1400px] mx-auto py-12 px-4 text-center">
          <h2
            className="text-2xl font-merriweather font-bold mb-4"
            style={{ color: colorPalette.text }}
          >
            Terjadi Kesalahan
          </h2>
          <p className="font-inter text-gray-600">
            {this.state.error?.message || "Silakan coba lagi nanti."}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

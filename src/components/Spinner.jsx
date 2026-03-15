import React from "react";

const Spinner = ({ darkMode }) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
        {/* Matn */}
        <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Spinner;
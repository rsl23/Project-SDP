import React from "react";
import { Settings } from "lucide-react";

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Konfigurasi aplikasi</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Settings className="mx-auto text-gray-400 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
        <p className="text-gray-600">
          Fitur settings sedang dalam pengembangan
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;

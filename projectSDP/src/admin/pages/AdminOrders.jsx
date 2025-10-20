import React from "react";
import { ShoppingCart } from "lucide-react";

const AdminOrders = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Kelola Orders</h1>
        <p className="text-gray-600 mt-1">Lihat dan kelola pesanan pelanggan</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
        <p className="text-gray-600">
          Fitur manajemen orders sedang dalam pengembangan
        </p>
      </div>
    </div>
  );
};

export default AdminOrders;

import React, { useState, useEffect } from "react";
import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products count
        const productsSnapshot = await getDocs(collection(db, "products"));
        const totalProducts = productsSnapshot.size;

        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, "users"));
        const totalUsers = usersSnapshot.size;

        // Fetch orders count (jika ada)
        // const ordersSnapshot = await getDocs(collection(db, "orders"));
        // const totalOrders = ordersSnapshot.size;

        setStats({
          totalProducts,
          totalUsers,
          totalOrders: 0, // Placeholder
          revenue: 0, // Placeholder
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Produk",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgLight: "bg-blue-50",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgLight: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgLight: "bg-purple-50",
    },
    {
      title: "Revenue",
      value: `Rp ${stats.revenue.toLocaleString("id-ID")}`,
      icon: TrendingUp,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgLight: "bg-orange-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Selamat datang di Admin Panel BJM Parts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgLight} p-3 rounded-lg`}>
                  <Icon className={stat.textColor} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-center">
            <Package className="mx-auto mb-2 text-indigo-600" size={32} />
            <span className="text-gray-700 font-medium">Tambah Produk</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center">
            <Users className="mx-auto mb-2 text-green-600" size={32} />
            <span className="text-gray-700 font-medium">Kelola Users</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center">
            <ShoppingCart className="mx-auto mb-2 text-purple-600" size={32} />
            <span className="text-gray-700 font-medium">Lihat Orders</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {/* <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 font-medium">
                User baru terdaftar
              </p>
              <p className="text-xs text-gray-500">2 menit yang lalu</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 font-medium">
                Produk baru ditambahkan
              </p>
              <p className="text-xs text-gray-500">15 menit yang lalu</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 font-medium">
                Order baru diterima
              </p>
              <p className="text-xs text-gray-500">1 jam yang lalu</p>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default AdminDashboard;

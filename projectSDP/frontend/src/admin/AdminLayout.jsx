// AdminLayout Component - Layout wrapper untuk admin panel dengan sidebar navigation
// Features: Collapsible sidebar, active route highlighting, logout, responsive

import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Images, // Icon untuk gallery management
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar collapse state

  // Handle logout - sign out dari Firebase dan redirect ke login
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logout:", error);
    }
  };

  // Menu items untuk sidebar navigation
  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/products", icon: Package, label: "Produk" },
    { path: "/admin/gallery", icon: Images, label: "Gallery" },
    { path: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { path: "/admin/reviews", icon: Star, label: "Reviews" },
    { path: "/admin/users", icon: Users, label: "Users" },
  ];

  // Helper: Check apakah route sedang aktif
  // Exact match untuk /admin, startsWith untuk sub-routes
  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Collapsible dengan transition */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-indigo-900 to-purple-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Header dengan toggle button */}
        <div className="p-4 flex items-center justify-between border-b border-indigo-700">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-indigo-800 rounded-lg transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items dengan active state highlighting */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  active
                    ? "bg-indigo-700 text-white" // Active state styling
                    : "hover:bg-indigo-800 text-gray-300"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-indigo-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-red-600 transition text-gray-300 hover:text-white"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">
            BJM Parts - Admin Dashboard
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {auth.currentUser?.email}
            </span>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {auth.currentUser?.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

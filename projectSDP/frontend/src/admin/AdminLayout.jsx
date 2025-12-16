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
  Images,
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logout:", error);
    }
  };

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/products", icon: Package, label: "Produk" },
    { path: "/admin/gallery", icon: Images, label: "Gallery" },
    { path: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { path: "/admin/reviews", icon: Star, label: "Reviews" },
    { path: "/admin/users", icon: Users, label: "Users" },
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-40 h-full
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${sidebarOpen ? "md:w-64" : "md:w-20"}
          w-64
          bg-gradient-to-b from-indigo-900 to-purple-900
          text-white transition-all duration-300 flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-indigo-700">
          {sidebarOpen && (
            <h1 className="text-lg md:text-xl font-bold truncate">
              Admin Panel
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-indigo-800 rounded-lg transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition
                  ${active
                    ? "bg-indigo-700 text-white"
                    : "hover:bg-indigo-800 text-gray-300"}
                `}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <span className="text-sm md:text-base">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
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

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg md:text-2xl font-semibold text-gray-800 truncate">
              BJM Parts - Admin
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:block text-sm text-gray-600 truncate max-w-[180px]">
              {auth.currentUser?.email}
            </span>
            <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {auth.currentUser?.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

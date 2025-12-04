// AdminUsers Component - Halaman admin untuk kelola users
// Features: View users list, change user role, delete user account

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  Search,
  UserCheck,
  UserX,
  Shield,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

// Confirmation Modal Component
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle
            className={type === "danger" ? "text-red-500" : "text-yellow-500"}
            size={24}
          />
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-800 transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition-all ${
              type === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch semua users dari Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat data users");
    } finally {
      setLoading(false);
    }
  };

  // Toggle user role antara 'user' dan 'admin'
  const handleToggleRole = async (userId, currentRole, userName) => {
    const newRole = currentRole === "admin" ? "user" : "admin";

    setConfirmModal({
      isOpen: true,
      title: `Ubah Role ${userName}`,
      message: `Apakah Anda yakin ingin mengubah role ${userName} dari "${
        currentRole || "user"
      }" menjadi "${newRole}"?`,
      type: "warning",
      onConfirm: async () => {
        try {
          const userRef = doc(db, "users", userId);
          await updateDoc(userRef, {
            role: newRole,
          });

          // Update local state
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === userId ? { ...user, role: newRole } : user
            )
          );

          toast.success(`Role ${userName} berhasil diubah menjadi ${newRole}`);
        } catch (error) {
          console.error("Error updating user role:", error);
          toast.error("Gagal mengubah role user");
        }
      },
    });
  };

  // Delete user account
  const handleDeleteUser = async (userId, userName, userEmail) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus User",
      message: `Apakah Anda yakin ingin menghapus akun ${userName} (${userEmail})? Tindakan ini tidak dapat dibatalkan!`,
      type: "danger",
      onConfirm: async () => {
        try {
          const userRef = doc(db, "users", userId);
          await deleteDoc(userRef);

          // Update local state
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== userId)
          );

          toast.success(`Akun ${userName} berhasil dihapus`);
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Gagal menghapus user");
        }
      },
    });
  };

  // Filter users berdasarkan search term
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Kelola Users</h1>
        <p className="text-gray-600 mt-1">Daftar semua user yang terdaftar</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auth Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terdaftar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.auth_provider || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email_verified ? (
                        <UserCheck className="text-green-500" size={20} />
                      ) : (
                        <UserX className="text-red-500" size={20} />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt
                        ? new Date(
                            user.createdAt.seconds * 1000
                          ).toLocaleDateString("id-ID")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {/* Toggle Role Button */}
                        <button
                          onClick={() =>
                            handleToggleRole(user.id, user.role, user.name)
                          }
                          className={`p-2 rounded-lg transition-all ${
                            user.role === "admin"
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              : "bg-purple-100 hover:bg-purple-200 text-purple-700"
                          }`}
                          title={
                            user.role === "admin"
                              ? "Ubah ke User"
                              : "Jadikan Admin"
                          }
                        >
                          <Shield size={18} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() =>
                            handleDeleteUser(user.id, user.name, user.email)
                          }
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all"
                          title="Hapus User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Tidak ada user ditemukan
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
};

export default AdminUsers;

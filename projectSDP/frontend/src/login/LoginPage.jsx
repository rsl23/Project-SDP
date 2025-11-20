import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  sendEmailVerification,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import ResetPassword from "./ResetPassword/ResetPassword";
import {
  Mail,
  AlertCircle,
  X,
  Shield,
  RefreshCw,
  CheckCircle
} from "lucide-react";

// Fungsi untuk cek dan sync email verification
async function checkAndSyncEmailVerification(user) {
  // Refresh data user dari Firebase Auth
  await user.reload();

  // Kalau sudah verifikasi, update Firestore
  if (user.emailVerified) {
    await updateDoc(doc(db, "users", user.uid), {
      email_verified: true,
    });
    console.log("Firestore updated: email_verified = true");
    return true;
  } else {
    console.log("User belum verifikasi email");
    return false;
  }
}

// Fungsi untuk kirim ulang email verifikasi
async function resendVerificationEmail(user) {
  try {
    await sendEmailVerification(user);
    return true;
  } catch (error) {
    console.error("Gagal mengirim ulang email verifikasi:", error);
    return false;
  }
}

function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
}) {
  return (
    <div>
      <label className="text-sm text-slate-700 font-semibold">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900"
      />
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      // Dapatkan data user di Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const role = userDoc.exists() ? userDoc.data().role : "user";

      // === ADMIN SKIP EMAIL VERIFICATION ===
      if (role === "admin") {
        navigate("/admin");
        return;
      }

      // === USER BIASA WAJIB VERIFIKASI EMAIL ===
      const isVerified = await checkAndSyncEmailVerification(user);

      if (!isVerified) {
        // Tampilkan modal verifikasi & logout
        setCurrentUser(user);
        setShowVerificationModal(true);
        await auth.signOut();
        return;
      }

      // Jika user biasa sudah terverifikasi → lanjut login
      navigate("/");

    } catch (err) {
      console.error("Error login:", err);
      const errorCode = err.code;

      if (errorCode === "auth/invalid-credential") {
        setError("Email atau password salah.");
      } else if (errorCode === "auth/too-many-requests") {
        setError("Terlalu banyak percobaan login. Coba lagi nanti.");
      } else if (errorCode === "auth/user-not-found") {
        setError("Email tidak terdaftar.");
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleResendVerification = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const success = await resendVerificationEmail(currentUser);
      if (success) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        setError("Gagal mengirim ulang email verifikasi. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error resend verification:", error);
      setError("Terjadi kesalahan saat mengirim ulang email verifikasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const { isNewUser } = getAdditionalUserInfo(result);

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (isNewUser || !userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          firebase_uid: user.uid,
          auth_provider: "google",
          email_verified: user.emailVerified,
          createdAt: serverTimestamp(),
        });
      }

      // Google tidak perlu verifikasi email tambahan
      const updatedUserDoc = await getDoc(userDocRef);
      if (updatedUserDoc.exists() && updatedUserDoc.data().role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Error login dengan Google:", err);
      setError("Gagal login dengan Google. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold shadow-sm transition hover:bg-gray-50 disabled:opacity-70 disabled:cursor-wait"
      >
        <svg
          className="w-5 h-5 mr-3"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M47.52 24.54C47.52 22.86 47.34 21.24 47.04 19.68H24V28.8H37.44C36.84 31.86 35.22 34.38 32.82 36.06V42.6H41.52C45.42 38.82 47.52 32.28 47.52 24.54Z"
            fill="#4285F4"
          ></path>
          <path
            d="M24 48C30.48 48 35.94 45.72 39.96 42.6L32.82 36.06C30.66 37.5 27.6 38.46 24 38.46C17.28 38.46 11.46 34.14 9.24 28.02H0.48V34.8C4.5 42.78 13.56 48 24 48Z"
            fill="#34A853"
          ></path>
          <path
            d="M9.24 28.02C8.76 26.58 8.52 25.02 8.52 23.4C8.52 21.78 8.76 20.22 9.24 18.78V12H0.48C-1.68 16.14 -1.68 20.94 0.48 24.18C2.52 27.42 5.46 30.06 9.24 28.02Z"
            fill="#FBBC05"
          ></path>
          <path
            d="M24 8.34C27.9 8.34 31.02 9.54 33.42 11.7L40.08 5.04C35.88 1.14 30.42 0 24 0C13.56 0 4.5 5.22 0.48 13.2L9.24 19.8C11.46 13.68 17.28 8.34 24 8.34Z"
            fill="#EA4335"
          ></path>
        </svg>
        {loading ? "Memproses..." : "Lanjutkan dengan Google"}
      </button>

      <div className="flex items-center my-4">
        <hr className="w-full border-gray-300" />
        <span className="px-2 text-gray-500 text-sm">ATAU</span>
        <hr className="w-full border-gray-300" />
      </div>

      <form onSubmit={handleEmailLogin}>
        <div className="space-y-4">
          <InputField
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold shadow-md mt-6 transition disabled:opacity-70 disabled:cursor-wait"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
      <p
        className="text-blue-600 text-sm text-center mt-4 cursor-pointer hover:underline"
        onClick={() => setShowResetModal(true)}
      >
        Lupa Password?
      </p>
      <p className="text-center text-sm text-gray-600 mt-4">
        Belum punya akun?{" "}
        <Link
          to="/register"
          className="text-indigo-600 font-semibold hover:underline"
        >
          Daftar di sini
        </Link>
      </p>

      {/* Modal Verifikasi Email */}
      <AnimatePresence>
        {showVerificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            {/* Backdrop dengan blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowVerificationModal(false)}
            />

            {/* Popup Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-200"
            >
              {/* Header dengan gradient */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <AlertCircle size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Verifikasi Diperlukan</h2>
                      <p className="text-amber-100 text-sm">Lengkapi verifikasi email Anda</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Success Message untuk resend */}
                <AnimatePresence>
                  {resendSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                        <span className="text-green-800 text-sm font-medium">
                          Email verifikasi telah dikirim ulang!
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Message */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Periksa Email Anda
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Kami telah mengirimkan link verifikasi ke email Anda.
                    Klik link tersebut untuk mengaktifkan akun dan melanjutkan login.
                  </p>
                </div>

                {/* Tips Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 font-medium text-sm mb-1">
                        💡 Tidak menemukan email?
                      </p>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• Cek folder <strong>Spam</strong> atau <strong>Promosi</strong></li>
                        <li>• Pastikan email sudah benar: <strong>{currentUser?.email}</strong></li>
                        <li>• Tunggu beberapa menit jika belum menerima</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 border border-gray-200"
                  >
                    Nanti Saja
                  </button>
                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        Kirim Ulang
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/10 rounded-full translate-y-12 -translate-x-12"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Reset Password */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-20">
          <ResetPassword
            setReset={setShowResetModal}
            onClose={() => setShowResetModal(false)}
          />
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
      <div className="mb-8 text-center">
        <div className="flex justify-center items-center">
          <div className="">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">
              Selamat Datang
            </h1>
          </div>
          <div className="mt-5 ml-4">
            <Link to="/">
              <button
                style={{ width: "40px", height: "40px", fontSize: "24px" }}
                className="text-white hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="48px"
                  viewBox="0 -960 960 960"
                  width="48px"
                  fill="#ffffffff"
                >
                  <path d="m249-207-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
        <p className="text-lg text-gray-200 mt-2">
          Masuk ke akunmu untuk melanjutkan pengalaman belanja terbaik!
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative p-1 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 shadow-xl w-full max-w-md"
      >
        <div className="bg-white/95 rounded-2xl px-8 py-10 shadow-inner border border-white/30">
          <LoginForm />
        </div>
      </motion.div>
    </div>
  );
}
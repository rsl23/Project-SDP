import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
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

// Fungsi untuk cek dan sync email verification
async function checkAndSyncEmailVerification() {
  const user = auth.currentUser;
  if (!user) return;

  // Refresh data user dari Firebase Auth
  await user.reload();

  // Kalau sudah verifikasi, update Firestore
  if (user.emailVerified) {
    await updateDoc(doc(db, "users", user.uid), {
      email_verified: true,
    });
    console.log("Firestore updated: email_verified = true");
  } else {
    console.log("User belum verifikasi email");
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
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

      // Cek dan sync email verification setelah login
      await checkAndSyncEmailVerification();

      // Check if user is admin
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        // Redirect to admin panel
        navigate("/admin");
      } else {
        // Redirect to home page
        navigate("/");
      }
    } catch (err) {
      console.error("Error login dengan email:", err);
      setError("Email atau password salah. Silakan coba lagi.");
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

      // Cek dan sync email verification setelah Google sign-in
      await checkAndSyncEmailVerification();

      // Check if user is admin after Google sign-in
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] p-6">
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

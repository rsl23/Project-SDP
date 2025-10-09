// src/login/LoginPage.jsx

import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";

// --- SALIN FUNGSI DARI LANGKAH 2 KE SINI ---
// (atau impor jika Anda membuatnya di file terpisah)
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const handleGoogleSignIn = async (navigate) => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const { isNewUser } = getAdditionalUserInfo(result);

    // Cek apakah data user sudah ada di firestore
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
    navigate("/");
  } catch (error) {
    console.error("Error saat login dengan Google:", error);
  }
};


function LoginForm() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Logika login email/password Anda akan ada di sini
    navigate("/");
  };

  return (
    // Hapus <form> yang membungkus semuanya jika tidak diperlukan lagi untuk tombol Google
    <div className="space-y-4">
      {/* Tombol Login Google */}
      <button
        type="button"
        onClick={() => handleGoogleSignIn(navigate)}
        className="w-full flex items-center justify-center py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold shadow-sm hover:bg-gray-50"
      >
        <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="Google icon" className="w-6 h-6 mr-3"/>
        Lanjutkan dengan Google
      </button>

      <div className="flex items-center my-4">
        <hr className="w-full border-gray-300"/>
        <span className="px-2 text-gray-500 text-sm">ATAU</span>
        <hr className="w-full border-gray-300"/>
      </div>
    
      {/* Form email/password yang sudah ada */}
      <form onSubmit={handleLogin}>
        <InputField label="Email" type="email" placeholder="you@example.com" />
        <div className="mt-4">
          <InputField label="Password" type="password" placeholder="••••••••" />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold shadow-md mt-6"
        >
          Login
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Belum punya akun?{" "}
        <Link
          to="/register"
          className="text-indigo-600 font-semibold hover:underline"
        >
          Daftar di sini
        </Link>
      </p>
    </div>
  );
}

// ... sisa kode LoginPage.jsx tidak perlu diubah
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          Selamat Datang
        </h1>
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
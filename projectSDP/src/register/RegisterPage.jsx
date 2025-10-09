import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Joi from "joi";

// Import Firebase services dari config
import { auth, db } from "../firebase/config";

// Import Firebase Auth functions
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo
} from "firebase/auth";

// Import Firestore functions
import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-gray-300 shadow-sm p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}

function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
      "string.empty": "Nama wajib diisi.",
      "string.min": "Nama minimal 3 karakter.",
      "string.max": "Nama maksimal 50 karakter.",
    }),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.empty": "Email wajib diisi.",
        "string.email": "Format email tidak valid.",
      }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Password wajib diisi.",
      "string.min": "Password minimal 6 karakter.",
    }),
    confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
      "any.only": "Konfirmasi password tidak cocok.",
      "any.required": "Konfirmasi password wajib diisi.",
    }),
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }
  
  // Fungsi untuk menangani login/register dengan Google
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError("");
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
      setError("Gagal mendaftar dengan Google. Silakan coba lagi.");
    } finally {
        setLoading(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const { name, email, password, confirmPassword } = form;
    const { error: validationError } = schema.validate(
      { name, email, password, confirmPassword },
      { abortEarly: false }
    );
    if (validationError) {
      setError(validationError.details[0].message);
      return;
    }

    setLoading(true);

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setError("Email ini sudah terdaftar.");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      // Simpan data user ke Firestore dengan UID sebagai document ID
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        firebase_uid: user.uid,
        auth_provider: "email/password",
        email_verified: user.emailVerified,
        createdAt: serverTimestamp(),
      });

      await sendEmailVerification(user);

      setSuccess(true);
    } catch (err) {
      console.error("Error saat registrasi:", err);
      const code = err?.code || "";
      let message = "Terjadi kesalahan. Silakan coba lagi.";
      if (code === "auth/invalid-email") message = "Format email tidak valid.";
      else if (code === "auth/weak-password")
        message = "Password terlalu lemah (min. 6 karakter).";
      else if (code === "auth/email-already-in-use")
        message = "Email ini sudah terdaftar.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full flex items-center justify-center py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold shadow-sm transition ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-gray-50'}`}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.52 24.54C47.52 22.86 47.34 21.24 47.04 19.68H24V28.8H37.44C36.84 31.86 35.22 34.38 32.82 36.06V42.6H41.52C45.42 38.82 47.52 32.28 47.52 24.54Z" fill="#4285F4"></path><path d="M24 48C30.48 48 35.94 45.72 39.96 42.6L32.82 36.06C30.66 37.5 27.6 38.46 24 38.46C17.28 38.46 11.46 34.14 9.24 28.02H0.48V34.8C4.5 42.78 13.56 48 24 48Z" fill="#34A853"></path><path d="M9.24 28.02C8.76 26.58 8.52 25.02 8.52 23.4C8.52 21.78 8.76 20.22 9.24 18.78V12H0.48C-1.68 16.14 -1.68 20.94 0.48 24.18C2.52 27.42 5.46 30.06 9.24 28.02Z" fill="#FBBC05"></path><path d="M24 8.34C27.9 8.34 31.02 9.54 33.42 11.7L40.08 5.04C35.88 1.14 30.42 0 24 0C13.56 0 4.5 5.22 0.48 13.2L9.24 19.8C11.46 13.68 17.28 8.34 24 8.34Z" fill="#EA4335"></path></svg>
          Daftar dengan Google
        </button>
        <div className="flex items-center my-4">
            <hr className="w-full border-gray-300"/>
            <span className="px-2 text-gray-500 text-sm">ATAU</span>
            <hr className="w-full border-gray-300"/>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
            <InputField
                name="name"
                value={form.name}
                onChange={handleChange}
                label="Nama Lengkap"
                placeholder="Contoh: John Doe"
            />
            <InputField
                name="email"
                value={form.email}
                onChange={handleChange}
                label="Email"
                type="email"
                placeholder="you@example.com"
            />
            <InputField
                name="password"
                value={form.password}
                onChange={handleChange}
                label="Password"
                type="password"
                placeholder="••••••••"
            />
            <InputField
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                label="Konfirmasi Password"
                type="password"
                placeholder="••••••••"
            />
            </div>

            {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

            <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold shadow-md mt-6 transition ${
                loading ? "opacity-70 cursor-wait" : "hover:opacity-90"
            }`}
            >
            {loading ? "Mendaftar..." : "Register dengan Email"}
            </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Login di sini
          </Link>
        </p>
      </div>

      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm">
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Registrasi Berhasil!
            </h2>
            <p className="text-gray-700 mb-6">
              Akun kamu berhasil dibuat. Silakan cek email untuk verifikasi
              sebelum login.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setForm({
                  name: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                }); 
                navigate("/login"); 
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          Selamat Datang di BJM Parts
        </h1>
        <p className="text-lg text-gray-200 mt-2">
          Daftar sekarang untuk mendapatkan pengalaman belanja terbaik!
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative p-1 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 shadow-xl w-full max-w-md"
      >
        <div className="bg-white/95 rounded-2xl px-8 py-10 shadow-inner border border-white/30">
          <RegisterForm />
        </div>
      </motion.div>
    </div>
  );
}
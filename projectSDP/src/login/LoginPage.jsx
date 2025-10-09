import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import { auth } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";

function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password } = form;

    // Validasi input
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      // Login dengan Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Cek apakah email sudah diverifikasi (opsional)
      if (!user.emailVerified) {
        console.warn("Email belum diverifikasi, tapi tetap bisa login");
        // Uncomment baris berikut jika ingin memaksa verifikasi email:
        // setError("Silakan verifikasi email terlebih dahulu.");
        // await auth.signOut();
        // setLoading(false);
        // return;
      }

      console.log("Login berhasil!", user);

      // Redirect ke home page
      navigate("/");
    } catch (err) {
      console.error("Error saat login:", err);
      const code = err?.code || "";
      let message = "Terjadi kesalahan. Silakan coba lagi.";

      if (code === "auth/invalid-email") {
        message = "Format email tidak valid.";
      } else if (code === "auth/user-not-found") {
        message = "Email tidak terdaftar.";
      } else if (code === "auth/wrong-password") {
        message = "Password salah.";
      } else if (code === "auth/invalid-credential") {
        message = "Email atau password salah.";
      } else if (code === "auth/too-many-requests") {
        message = "Terlalu banyak percobaan. Coba lagi nanti.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleLogin}>
      <InputField
        label="Email"
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="you@example.com"
      />
      <InputField
        label="Password"
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="••••••••"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold shadow-md mt-6 transition ${
          loading ? "opacity-70 cursor-wait" : "hover:opacity-90"
        }`}
      >
        {loading ? "Masuk..." : "Login"}
      </button>

      <p className="text-center text-sm text-gray-600 mt-4">
        Belum punya akun?{" "}
        <Link
          to="/register"
          className="text-indigo-600 font-semibold hover:underline"
        >
          Daftar di sini
        </Link>
      </p>
    </form>
  );
}

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

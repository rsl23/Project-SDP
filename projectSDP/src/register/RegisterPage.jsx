import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import InputField from "../components/InputField";

function RegisterForm() {
    return (
        <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Nama Lengkap" placeholder="Contoh: Budi Santoso" />
                <InputField label="No. Telepon" placeholder="0812xxxx" />
            </div>

            <InputField label="Email" type="email" placeholder="you@example.com" />
            <InputField label="Password" type="password" placeholder="••••••••" />
            <InputField
                label="Konfirmasi Password"
                type="password"
                placeholder="••••••••"
            />

            <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold shadow-md mt-6"
            >
                Register
            </button>

            {/* Link ke login */}
            <p className="text-center text-sm text-gray-600 mt-4">
                Sudah punya akun?{" "}
                <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                    Login di sini
                </Link>
            </p>
        </form>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0b0f3a] via-[#240b6c] to-[#050018] p-6">

            {/* Teks di atas card */}
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

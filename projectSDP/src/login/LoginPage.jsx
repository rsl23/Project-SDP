import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";

function LoginForm() {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        navigate("/");
    };

    return (
        <form className="space-y-4" onSubmit={handleLogin}>
            <InputField label="Email" type="email" placeholder="you@example.com" />
            <InputField label="Password" type="password" placeholder="••••••••" />

            <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold shadow-md mt-6"
            >
                Login
            </button>
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

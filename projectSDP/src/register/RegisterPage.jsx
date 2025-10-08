import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { initializeApp, getApps } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    updateProfile,
    sendEmailVerification,
} from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import Joi from "joi";

const firebaseConfig = {
    apiKey: "AIzaSyCONECmExrEM1zwzO9dKaHHsTl79MV4Dr4",
    authDomain: "project-sdp-fpw.firebaseapp.com",
    projectId: "project-sdp-fpw",
    storageBucket: "project-sdp-fpw.firebasestorage.app",
    messagingSenderId: "248928609793",
    appId: "1:248928609793:web:4b62ede10751f92aed0200",
    measurementId: "G-45CBKGR3FK",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

function InputField({ label, type = "text", name, value, onChange, placeholder }) {
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
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required().messages({
            "string.empty": "Nama wajib diisi.",
            "string.min": "Nama minimal 3 karakter.",
            "string.max": "Nama maksimal 50 karakter.",
        }),
        email: Joi.string().email({ tlds: { allow: false } }).required().messages({
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

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess(false);

        const { name, email, password, confirmPassword } = form;
        const { error: validationError } = schema.validate({ name, email, password, confirmPassword }, { abortEarly: false });
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

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: name });
            await setDoc(doc(db, "users", user.uid), { name, email, createdAt: serverTimestamp() });
            const emailPromise = sendEmailVerification(user);
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000));
            await Promise.race([emailPromise, timeoutPromise]).catch((err) => console.warn("Gagal kirim email:", err));

            setSuccess(true);
        } catch (err) {
            const code = err?.code || "";
            let message = "Terjadi kesalahan. Silakan coba lagi.";
            if (code === "auth/invalid-email") message = "Format email tidak valid.";
            else if (code === "auth/weak-password") message = "Password terlalu lemah (min. 6 karakter).";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField name="name" value={form.name} onChange={handleChange} label="Nama Lengkap" placeholder="Contoh: Budi Santoso" />
                <InputField name="email" value={form.email} onChange={handleChange} label="Email" type="email" placeholder="you@example.com" />
                <InputField name="password" value={form.password} onChange={handleChange} label="Password" type="password" placeholder="••••••••" />
                <InputField name="confirmPassword" value={form.confirmPassword} onChange={handleChange} label="Konfirmasi Password" type="password" placeholder="••••••••" />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold shadow-md mt-6 transition ${loading ? "opacity-70 cursor-wait" : "hover:opacity-90"}`}
                >
                    {loading ? "Mendaftar..." : "Register"}
                </button>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Sudah punya akun? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login di sini</Link>
                </p>
            </form>
            {success && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm">
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Registrasi Berhasil!</h2>
                        <p className="text-gray-700 mb-6">Akun kamu berhasil dibuat. Silakan cek email untuk verifikasi sebelum login.</p>
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setForm({ name: "", email: "", password: "", confirmPassword: "" }); // reset form
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
                <h1 className="text-4xl md:text-5xl font-extrabold text-white">Selamat Datang di BJM Parts</h1>
                <p className="text-lg text-gray-200 mt-2">Daftar sekarang untuk mendapatkan pengalaman belanja terbaik!</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                className="relative p-1 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 shadow-xl w-full max-w-md">
                <div className="bg-white/95 rounded-2xl px-8 py-10 shadow-inner border border-white/30">
                    <RegisterForm />
                </div>
            </motion.div>
        </div>
    );
}

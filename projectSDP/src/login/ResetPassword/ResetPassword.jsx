import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../../firebase/config";

const ResetPassword = ({ setReset }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email); // Logic to handle password reset, e.g., sending reset email
      setMessage("Password reset link has been sent to your email.");
      setError("");
      //   setReset(false);
    } catch (err) {
      setError("Failed to send reset link. Please try again.");
      setMessage("");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl relative z-30">
      <button
        className="absolute top-2 right-3 text-gray-400 hover:text-gray-600"
        onClick={() => setReset(false)}
      >
        ✕
      </button>
      <h3 className="text-xl font-bold mb-4 text-start text-black">
        Reset Password
      </h3>

      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          placeholder="Masukkan email kamu"
          className="border p-2 w-full rounded mb-4 text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold shadow-md mt-6 transition disabled:opacity-70 disabled:cursor-wait"
        >
          Kirim Link Reset
        </button>
      </form>

      {message && <p className="text-green-600 mt-3 text-sm">{message}</p>}
      {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}
    </div>
  );
};

export default ResetPassword;

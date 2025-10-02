import React from "react";

export default function InputField({ label, type = "text", placeholder }) {
    return (
        <div>
            <label className="text-sm text-slate-700 font-semibold">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
        </div>
    );
}

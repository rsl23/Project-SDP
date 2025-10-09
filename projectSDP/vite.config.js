import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Jadikan plugin flowbite-react opsional agar tidak error saat dependency belum ter-install
export default defineConfig(async () => {
  let flowbitePlugin = null;
  try {
    const mod = await import("flowbite-react/plugin/vite");
    // Beberapa versi mungkin export default berupa fungsi plugin
    flowbitePlugin = typeof mod.default === "function" ? mod.default() : null;
  } catch (e) {
    console.warn(
      "[vite.config] flowbite-react belum terpasang, lewati plugin (pesan ini aman diabaikan)."
    );
  }

  return {
    plugins: [react(), ...(flowbitePlugin ? [flowbitePlugin] : [])],
  };
});

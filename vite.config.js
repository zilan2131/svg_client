import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target:
          "http://localhost:3001" || "https://svg-server-3tw8.onrender.com",
        changeOrigin: true,
      },
      "/ortaokul": {
        target:
          "http://localhost:3001" || "https://svg-server-3tw8.onrender.com",
        changeOrigin: true,
      },
    },
  },
});

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target:
          process.env.NODE_ENV === "production"
            ? "https://svg-server-3tw8.onrender.com"
            : "http://localhost:3001",
        changeOrigin: true,
      },
      "/ortaokul": {
        target:
          process.env.NODE_ENV === "production"
            ? "https://svg-server-3tw8.onrender.com"
            : "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});

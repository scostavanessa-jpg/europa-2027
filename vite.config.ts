import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const neonAuthUrl = process.env.VITE_NEON_AUTH_URL || process.env.NEON_AUTH_BASE_URL || "";
const neonDataApiUrl = process.env.VITE_NEON_DATA_API_URL || process.env.NEON_DATA_API_URL || "";

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_NEON_AUTH_URL": JSON.stringify(neonAuthUrl),
    "import.meta.env.VITE_NEON_DATA_API_URL": JSON.stringify(neonDataApiUrl),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

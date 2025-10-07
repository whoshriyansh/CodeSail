import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 3000,
    },
    base: "./",
    build: {
        outDir: "build",
        rollupOptions: {
            output: {
                entryFileNames: "assets/index.js",
                chunkFileNames: "assets/chunk.js",
                assetFileNames: "assets/index.[ext]",
            },
        },
    },
});
//# sourceMappingURL=vite.config.js.map
import { defineConfig } from "vite";

/** 使用相對路徑，部署在 username.github.io/RepoName/ 時資源可正常載入 */
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});

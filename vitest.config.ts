import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      // The ECS bundle imports its `.wasm` for bundlers; in tests it is loaded from its path.
      name: "ignore-wasm-imports",
      enforce: "pre",
      load: (id) => (id.split("?")[0]?.endsWith(".wasm") ? "export {};" : undefined),
    },
  ],

  resolve: {
    alias: {
      "@nanoforge": path.resolve(__dirname, "./packages/"),
    },
  },
  test: {
    server: {
      deps: {
        inline: ["@nanoforge-dev/ecs"],
      },
    },
    exclude: ["**/node_modules", "**/dist", ".idea", ".git", ".cache"],
    passWithNoTests: true,

    typecheck: {
      enabled: true,
      tsconfig: "./tsconfig.spec.json",
    },

    coverage: {
      enabled: true,
      reporter: ["text", "lcov", "cobertura"],
      provider: "v8",
      include: ["packages/**/*.ts"],
    },
  },
});

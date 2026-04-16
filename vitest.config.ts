import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  assetsInclude: ["**/*.wasm"],

  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./src/"),
      "@systems": path.resolve(__dirname, "./src/"),
    },
  },
  test: {
    server: {
      deps: {
        inline: ["@nanoforge-dev/ecs-server"],
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
      include: ["src"],
      exclude: [
        "**/*.{interface,type,d}.ts",
        "**/{interfaces,types}/*.ts",
        "src/index.{js,ts}",
        "**/exports/*.{js,ts}",
        "src/**/*.json",
      ],
    },
  },
});

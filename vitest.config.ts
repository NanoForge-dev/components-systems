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

    // Two programs, as in the build: graphics-2d and graphics-3d both type `ctx.graphics`. Vitest
    // doesn't typecheck `.spec.ts` files: `pnpm run typecheck` does.
    projects: [
      {
        extends: true,
        test: {
          name: "2d",
          include: ["test/**/*.spec.ts"],
          exclude: ["test/3d/**"],
        },
      },
      {
        extends: true,
        test: {
          name: "3d",
          include: ["test/3d/**/*.spec.ts"],
        },
      },
    ],

    coverage: {
      enabled: true,
      reporter: ["text", "lcov", "cobertura"],
      provider: "v8",
      include: ["packages/**/*.ts"],
    },
  },
});

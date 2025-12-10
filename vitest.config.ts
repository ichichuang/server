import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "html"],
      lines: 90,
      functions: 90,
      branches: 80,
      statements: 90,
      // 仅关注服务层覆盖率，避免路由/入口等未测文件稀释总覆盖率
      include: ["src/services/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/__tests__/**",
        "src/**/*.test.ts",
        "src/config/**",
        "src/types/**",
        "src/services/index.ts",
        "coverage/**",
        "dist/**",
      ],
    },
  },
});

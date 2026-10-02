import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      // Позволяет импортировать полную версию Handlebars, включая компилятор шаблонов
      handlebars: "handlebars/dist/handlebars.js",
    },
  },
    server: {
    host: "localhost",
    port: 3000,
    strictPort: true,
  },
    test: {
    globals: true,
    environment: 'jsdom',
    include:  ['**/*.{test,spec}.{js,ts}']
  }
});

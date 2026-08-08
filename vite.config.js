import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      // Позволяет импортировать полную версию Handlebars, включая компилятор шаблонов
      handlebars: "handlebars/dist/handlebars.js",
    },
  },
});
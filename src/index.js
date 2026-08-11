import '../src/css/style.scss';
import Handlebars from "handlebars";

import authTemplate from "./handlebars/components/auth.hbs?raw";
import registerTemplate from "./handlebars/components/register.hbs?raw";
import chatsTemplate from "./handlebars/components/chat.hbs?raw";
import settingsTemplate from "./handlebars/components/settings/settings.hbs?raw";
import settingsEditTemplate from "./handlebars/components/settings/edit/user.hbs?raw";
import settingsPasswordTemplate from "./handlebars/components/settings/edit/password.hbs?raw"
import error404Template from "./handlebars/components/404.hbs?raw";
import error500Template from "./handlebars/components/500.hbs?raw";
import { mockData } from "./mocks"; 

//Роуты посоветовал сделать ИИ для корректной работы в netlify
// Карта маршрутов
const routes = {
    "/": authTemplate,
    "/register": registerTemplate,
    "/chats": chatsTemplate,
    "/settings": settingsTemplate,
    "/settings/edit": settingsEditTemplate,
    "/settings/password": settingsPasswordTemplate
};

function render() {
    let path = window.location.pathname;

    // Нормализация путей для Netlify
    // Если хостинг дописывает /index.html или в конце пути стоит лишний слэш (например, /chats/), очищаем их
    if (path === "/index.html" || path === "") {
        path = "/";
    }
    
    // Удаляем завершающий слэш, если он есть (например, "/chats/" превратится в "/chats")
    if (path.length > 1 && path.endsWith("/")) {
        path = path.slice(0, -1);
    }

    // Ищем шаблон. Если роут не найден, принудительно берем error404Template
    const template = routes[path] || error404Template;

    try {
        // Компиляция шаблона Handlebars
        const compiledTemplate = Handlebars.compile(template);
        
        // Рендерим HTML в тег body
        document.body.innerHTML = compiledTemplate(mockData);

        // Навешиваем обработчики событий на новые элементы
        initEventListeners();
    } catch (error) {
        // Если Handlebars упадет, мы ХОТЯ БЫ увидим ошибку в консоли Netlify
        console.error("Критическая ошибка компиляции Handlebars:", error);

        const compiled500 = Handlebars.compile(error500Template);
        document.body.innerHTML = compiled500(mockData);
        
        // Заново инициализируем ссылки, чтобы с 500 страницы можно было уйти назад/на главную
        initEventListeners();
    }
}

function navigate(path) {
    window.history.pushState({}, "", path);
    render();
}

function initEventListeners() {
    // Перехват кликов по ссылкам-маршрутам
    document.querySelectorAll(".router-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const path = link.getAttribute("href");
            navigate(path);
        });
    });

    // Перехват отправки формы авторизации (Вход)
    const authForm = document.getElementById("auth-form");
    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            navigate("/chats");
        });
    }

    // Здесь можно добавить обработчики для других форм (регистрация, настройки)
}

// Слушаем кнопки браузера "Назад" / "Вперед"
window.addEventListener("popstate", render);

// Первая загрузка страницы
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
} else {
    render(); // Если документ уже готов, рендерим немедленно
}

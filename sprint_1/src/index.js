import Handlebars from "handlebars";

import authTemplate from "./handlebars/components/auth.hbs?raw";
import registerTemplate from "./handlebars/components/register.hbs?raw";
import chatsTemplate from "./handlebars/components/chat.hbs?raw";
import settingsTemplate from "./handlebars/components/settings.hbs?raw";
import error404Template from "./handlebars/components/404.hbs?raw";
import { mockData } from "./mocks"; 

//Роуты посоветовал сделать ИИ для корректной работы в netlify
// Карта маршрутов
const routes = {
    "/": authTemplate,
    "/register": registerTemplate,
    "/chats": chatsTemplate,
    "/settings": settingsTemplate,
};

function render() {
    let path = window.location.pathname;
    
    // Если Netlify добавил /index.html к пути, приравниваем его к главной странице "/"
    if (path === "/index.html") {
        path = "/";
    }

    const template = routes[path] || error404Template;

    // Компиляция шаблона Handlebars
    const compiledTemplate = Handlebars.compile(template);
    
    // Теперь это безопасно, так как скрипт находится в <head> и не уничтожит сам себя
    document.body.innerHTML = compiledTemplate(mockData);

    // Навешиваем обработчики событий
    initEventListeners();
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
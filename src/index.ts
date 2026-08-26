/* import '../src/css/style.scss';
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
 */
import './css/style.scss';
import { router } from "./components/services/Router"; 
import AuthForm from "./components/pages/AuthForm";
import RegisterForm from "./components/pages/RegisterForm";
import SettingsPage from "./components/pages/settings/SettingsPage";
import { registerComponent } from "./components/abstracts/RegistrComponent";
import SettingsPasswordPage from "./components/pages/settings/SettingsPasswordPage";
import SettingsEditPage from "./components/pages/settings/SettingsEditPage";
import ChatsPage from "./components/pages/ChatsPage";
import Error404Page from "./components/pages/Error404Page";
import Error500Page from "./components/pages/Error500Page";
import { mockData } from "./mocks"; 
import Button from './components/Button';
import {Input} from './components/Input';
import {Form} from './components/Form';
import ChatMessage from './components/ChatMessage';

//Регистрируем компоненты для handlebars
// Handlebars.registerHelper('Input', (context) => {
//   const block = new Input(context as any);
//   return block.render();
// });

// Handlebars.registerHelper('Form', (context) => {
//   const block = new Form(context as any);
//   return block.render();
// });

// Handlebars.registerHelper('Button', (context) => {
//   const block = new Button(context as any);
//   return block.render();
// });

//Перехватываем ошибки для вызова 500 страницы
function handleGlobalError(error: unknown) {
    console.error("Перехвачена критическая ошибка приложения:", error);
    
    // Мгновенно переводим роутер на страницу 500 без изменения URL в строке браузера
    router.go("/500"); 
}


window.addEventListener("error", (event: ErrorEvent) => {
    event.preventDefault(); // Отменяем стандартный вывод в консоль, если нужно
    handleGlobalError(event.error);
});

// Регистрация компонентов в системе
registerComponent(Button);
registerComponent(Input);
registerComponent(Form);
registerComponent(ChatMessage);

router
  .use("/", AuthForm)
  .use("/register", RegisterForm)
  .use("/chats", class extends ChatsPage {
    constructor() {
        super({ chatsPage: mockData.chatsPage });
        }
    })
   .use("/404", Error404Page)
   .use("/500", Error500Page) 
   .use("/settings", class extends SettingsPage {
      constructor() {
          super({ settingsPage: mockData.settingsPage });
      }
    })
    .use("/settings/password", class extends SettingsPasswordPage {
      constructor() {
          super({ settingsPage: mockData.settingsPage });
      }
    })
    .use("/settings/edit", class extends SettingsEditPage {
      constructor() {
          super({ settingsPage: mockData.settingsPage });
      }
    });

// Запускаем роутер на body
router.init(document.body);

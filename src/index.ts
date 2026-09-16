import './css/style.scss';
import Router from "./components/services/Router";
import AuthForm from "./components/pages/AuthForm";
import RegisterForm from "./components/pages/RegisterForm";
import SettingsPage from "./components/pages/settings/SettingsPage";
import { registerComponent } from "./components/abstracts/RegistrComponent";
import SettingsPasswordPage from "./components/pages/settings/SettingsPasswordPage";
import SettingsEditPage from "./components/pages/settings/SettingsEditPage";
import ChatsPage from "./components/pages/ChatsPage";
import Error404Page from "./components/pages/Error404Page";
import Error500Page from "./components/pages/Error500Page";
import Button from './components/Button';
import { Input } from './components/Input';
import { Form } from './components/Form';
import ChatMessage from './components/ChatMessage';
import store from './components/api/store';
import UserController from './components/api/controllers/UserController';

// Создаём единственный экземпляр роутера (синглтон внутри класса)
const router = new Router(".app");

// Перехватываем ошибки для вызова 500 страницы
function handleGlobalError(error: unknown) {
    console.error("Перехвачена критическая ошибка приложения:", error);
    router.go("/500");
}

window.addEventListener("error", (event: ErrorEvent) => {
    event.preventDefault();
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
  .use("/chats",ChatsPage)
  .use("/404", Error404Page)
  .use("/500", Error500Page)
  .use("/settings", SettingsPage)
  .use("/settings/password", SettingsPasswordPage)
  .use("/settings/edit", SettingsEditPage)


    UserController.getUser()
    .catch(() => {
        // Не авторизован — store.user остаётся null
        // Роутер ниже сам перенаправит на /
    })
    .finally(() => {
        router.start();

        // После старта проверяем: если юзера нет и мы на приватной странице — редирект
        const state = store.getState();
        const currentPath = window.location.pathname;
        const protectedRoutes = ['/chats', '/settings'];
        const publicRoutes = ['/', '/register'];

        if (!state.user && protectedRoutes.includes(currentPath)) {
             router.go('/');
        }

        if (state.user && publicRoutes.includes(currentPath)) {
            router.go('/chats');
        }
    });


export default router;

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

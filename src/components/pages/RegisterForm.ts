// src/components/pages/RegisterForm.ts
import Block from "../../components/abstracts/Block";
import { Form } from "../Form";
import UserController from "../api/controllers/UserController";
import { type SignUpRequest } from "../api/Models/user-api";
import { connect } from "../api/HOC/connect";
import Router from "../services/Router";

// Создаём экземпляр (синглтон внутри класса вернёт тот же роутер)
const router = new Router(".app");

class RegisterForm extends Block {
  constructor(props: any = {}) {
    super({
      id: "register-form",
      class: "auth-container__form",
      buttonLabel: "Зарегистрироваться",
      buttonClass: "form-button",
      fields: [
        {
          type: "email",
          id: "email",
          name: "email",
          class: "form-field__input",
          label: "Почта:",
          required: true,
        },
        {
          type: "text",
          id: "login",
          name: "login",
          class: "form-field__input",
          label: "Логин:",
          required: true,
        },
        {
          type: "text",
          id: "first_name",
          name: "first_name",
          class: "form-field__input",
          label: "Имя:",
          required: true,
        },
        {
          type: "text",
          id: "second_name",
          name: "second_name",
          class: "form-field__input",
          label: "Фамилия:",
          required: true,
        },
        {
          type: "tel",
          id: "phone",
          name: "phone",
          class: "form-field__input",
          label: "Телефон:",
          required: true,
        },
        {
          type: "password",
          id: "password",
          name: "password",
          class: "form-field__input",
          label: "Пароль:",
          required: true,
        },
        {
          type: "password",
          id: "repeat_password",
          name: "repeat_password",
          class: "form-field__input",
          label: "Повторите пароль:",
          required: true,
        },
      ],
      ...props,
    });

    this.events = {
      submit: async (e: Event) => {
        e.preventDefault();

        const formBlock = this.children.find(
          (c) => (c as any).constructor?.componentName === "Form"
        ) as Form | undefined;

        if (!formBlock) {
          console.error("Form component not found! Check static componentName.");
          return;
        }

        // Сначала базовая валидация полей (required, формат и т.п.)
        const isValid = formBlock.validate();
        if (!isValid) {
          //console.log("Форма содержит ошибки валидации полей.");
          return;
        }

        // Кросс‑полевая валидация: совпадение паролей
        const password = formBlock.formData.password;
        const repeatPassword = formBlock.formData.repeat_password;

        if (password !== repeatPassword) {
          //console.log("Пароли не совпадают.");
          this.setProps({
            error: "Пароли не совпадают",
          });
          return;
        }
        
        // Собираем данные (убираем лишнее для API поле repeat_password)
        const formData = formBlock.formData as unknown as SignUpRequest;

        // Извлекаем ненужный для API пароль повтора, сохраняя остальные поля в signUpData
        const { repeat_password, ...signUpData } = formData;

        try {
          // 3. Вызываем метод создания пользователя напрямую из контроллера
          await UserController.signup(signUpData);
          
          router.go("/chats");
        } catch (error: any) {
          console.error("Ошибка регистрации:", error);
          
          let errorMessage = "Не удалось зарегистрироваться. Попробуйте позже.";
          
          if (error?.response) {
            try {
              const parsed = JSON.parse(error.response);
              if (parsed.reason) {
                errorMessage = parsed.reason; // Берем текст ошибки с бэкенда Практикума
              }
            } catch {
              // Игнорируем ошибку парсинга
            }
          }

          this.setProps({
            error: errorMessage,
          });
        }
      },
    };
  }

  protected template = `
    <main class="main-content">
      <section class="auth-container">
        <h1 class="form-title">Регистрация</h1>

        {{{ Form
            id=id
            class=class
            fields=fields
            buttonLabel=buttonLabel
            buttonClass=buttonClass
        }}}

        <p class="auth-container__text">
          <a href="/" class="auth-container__link router-link">Войти</a>
        </p>
      </section>
    </main>
  `;

  protected componentDidMount() {
    const link = this.element()?.querySelector('.router-link');
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        router.go('/');
      });
    }
  }
}

export default connect((state) => ({
  user: state.user ?? null,
}))(RegisterForm);

// src/components/pages/RegisterForm.ts
import Block from "../../components/abstracts/Block";
import { Form } from "../Form";
import { router } from '../services/Router';

export default class RegisterForm extends Block {
  constructor() {
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
      ]
    });

    this.events = {
      submit: (e: Event) => {
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
          console.log("Форма содержит ошибки валидации полей.");
          return;
        }

        // Кросс‑полевая валидация: совпадение паролей
        const password = formBlock.formData.password;
        const repeatPassword = formBlock.formData.repeat_password;

        if (password !== repeatPassword) {
          console.log("Пароли не совпадают.");

          return;
        }

        console.log("Данные регистрации успешно собраны для API:", formBlock.formData);
        router.go("/chats");
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
}

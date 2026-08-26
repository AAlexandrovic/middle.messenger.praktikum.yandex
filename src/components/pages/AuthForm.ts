import Block from '../abstracts/Block';
import { Form } from '../Form';
import { router } from '../services/Router';

export default class AuthForm extends Block {
  constructor() {
    super({
      id: 'auth-form',
      class: 'auth-container__form',
      buttonLabel: 'Авторизоваться',
      buttonClass: 'form-button',
      fields: [
        {
          type: 'text',
          id: 'login',
          name: 'login',
          class: 'form-field__input',
          label: 'Логин:',
          required: true,
        },
        {
          type: 'password',
          id: 'password',
          name: 'password',
          class: 'form-field__input',
          label: 'Пароль:',
          required: true,
        },
      ],
    });

    this.events = {
      submit: (e: Event) => {
        e.preventDefault();

        // поиск по static componentName
        const formBlock = this.children.find(
          (c) => (c as any)?.constructor?.componentName === 'Form'
        ) as Form | undefined;

        if (!formBlock) {
          console.error('Form component not found! Check static componentName.');
          return;
        }

        const isValid = formBlock.validate();
        if (!isValid) {
          console.log('Форма содержит ошибки');
          return;
        }

        console.log('Успешный вход!', formBlock.formData);
        router.go('/chats');
      },
    };
  }

  protected template = `
    <main class="main-content">
      <section class="auth-container">
        <h1 class="form-title">Вход</h1>

        {{{ Form
            id=id
            class=class
            fields=fields
            buttonLabel=buttonLabel
            buttonClass=buttonClass
        }}}

        <p class="auth-container__text">
          <a href="/register" class="auth-container__link router-link">Нет аккаунта?</a>
        </p>
      </section>
    </main>
  `;
}

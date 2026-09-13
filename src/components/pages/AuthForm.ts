import Block from '../abstracts/Block';
import { Form } from '../Form';
import Router from "../services/Router";
import UserController from '../api/controllers/UserController';
import { connect } from '../api/HOC/connect';

// Создаём экземпляр (синглтон внутри класса вернёт тот же роутер)
const router = new Router(".app");

class AuthForm extends Block {
  constructor(props: any = {}) {
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
      submit: async (e: Event) => {
        e.preventDefault();

        const formBlock = this.children.find(
          (c) => (c as any)?.constructor?.componentName === 'Form'
        ) as Form | undefined;

        if (!formBlock) {
          console.error('Form component not found!');
          return;
        }

        const isValid = formBlock.validate();
        if (!isValid) {
          return;
        }

        // Собираем данные формы
        const formData = formBlock.formData; // { login: string, password: string }

        try {          
          await UserController.signin({
            login: formData.login,
            password: formData.password,
          });
          
          // Успех — редирект
          router.go('/chats');
        } catch (error: any) {
          console.error('Ошибка авторизации:', error);

          // Показываем сообщение об ошибке
          let errorMessage = 'Не удалось войти. Проверьте логин и пароль.';

          if (error?.response) {
            try {
              const parsed = JSON.parse(error.response);
              if (parsed.reason) {
                errorMessage = parsed.reason;
              }
            } catch {
              // ответ не JSON — оставляем дефолтное сообщение
            }
          }

          this.setProps({
            buttonLabel: 'Авторизоваться',
            error: errorMessage,
          });
        }
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
          <!-- Убрали href, чтобы не было перезагрузки -->
          <a href="#" data-route="/register" class="auth-container__link router-link">Нет аккаунта?</a>
        </p>
      </section>
    </main>
  `;

  // Перехватываем клики по ссылкам с data-route
  protected componentDidMount() {
    const links = this.element()?.querySelectorAll('a[data-route]') || [];
    links.forEach((link) => {
      const path = link.getAttribute('data-route');
      if (!path) return;

      link.addEventListener('click', (e) => {
        e.preventDefault();
        router.go(path);
      });
    });
  }
}

export default connect((state) => ({
  user: state.user ?? null,
}))(AuthForm);

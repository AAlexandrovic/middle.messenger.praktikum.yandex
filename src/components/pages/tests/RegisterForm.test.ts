import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterForm from '../RegisterForm';
import { createFormPageTest } from './FormPage.factory'; 
import UserController from '../../api/controllers/UserController';

describe('Компонент RegisterForm', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Должен корректно рендерить структуру формы регистрации и все 7 полей ввода', () => {
    const { element } = createFormPageTest(RegisterForm, '/register');

    const title = element?.querySelector('.form-title');
    expect(title?.textContent).toBe('Регистрация');

    // Проверяем наличие всех обязательных полей по ТЗ Яндекса
    const fields = ['email', 'login', 'first_name', 'second_name', 'phone', 'password', 'repeat_password'];
    fields.forEach(name => {
      const input = element?.querySelector(`input[name="${name}"]`);
      expect(input).toBeTruthy();
    });
  });

  it('Должен осуществлять SPA-переход на главную (авторизация) при клике на ссылку "Войти"', () => {
    const { element, formPageInstance, routerGoSpy } = createFormPageTest(RegisterForm, '/register');

    // Явно вызываем монтирование для привязки addEventListener
    (formPageInstance as any).componentDidMount();

    const loginLink = element?.querySelector('.router-link') as HTMLElement;
    expect(loginLink).toBeTruthy();

    // Симулируем клик пользователя
    loginLink.click();

    // Проверяем, что роутер перехватил клик
    expect(routerGoSpy).toHaveBeenCalledWith('/');
  });

  it('Должен выводить ошибку на экран, если введенные пароли не совпадают', async () => {
    const { element, formPageInstance } = createFormPageTest(RegisterForm, '/register');

    const formBlock = formPageInstance.children.find((c: any) => c.props?.id === 'register-form') as any;
    if (formBlock) {
      // Подставляем имя компонента, чтобы оригинальный поиск внутри RegisterForm отработал успешно
      formBlock.constructor.componentName = 'Form';
      formBlock.validate = () => true;
      
      Object.defineProperty(formBlock, 'formData', {
        get: () => ({ password: 'password123', repeat_password: 'different_password' }),
        configurable: true
      });
    }

    const formEl = element?.querySelector('form');
    formEl?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await Promise.resolve();

    // Проверяем, что в пропсах компонента появилась ошибка несовпадения
    expect((formPageInstance as any).props.error).toBe('Пароли не совпадают');
  });

  it('Должен отсекать поле repeat_password и отправлять SignUpData в UserController при сабмите', async () => {
    const { element, formPageInstance, routerGoSpy } = createFormPageTest(RegisterForm, '/register');

    // Заглушаем метод регистрации контроллера (передаем null as any для прохождения strict типов)
    const signupSpy = vi.spyOn(UserController, 'signup').mockResolvedValue(null as any);

    const testSignUpData = {
      email: 'test@test.ru',
      login: 'new_user',
      first_name: 'Ivan',
      second_name: 'Ivanov',
      phone: '+79998887766',
      password: 'password123',
    };

    const formBlock = formPageInstance.children.find((c: any) => c.props?.id === 'register-form') as any;
    if (formBlock) {
      // Гарантируем прохождение проверки constructor.componentName === "Form"
      formBlock.constructor.componentName = 'Form';
      formBlock.validate = () => true;
      
      // Имитируем совпадение паролей для прохождения кросс-валидации
      Object.defineProperty(formBlock, 'formData', {
        get: () => ({ ...testSignUpData, repeat_password: 'password123' }),
        configurable: true
      });
    }

    const formEl = element?.querySelector('form');
    formEl?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Используем вместо promise для отправки
    await vi.waitFor(() => {
      // Проверяем, что контроллер получил чистый объект SignUpRequest БЕЗ repeat_password
      expect(signupSpy).toHaveBeenCalledWith(testSignUpData);

      // Проверяем автоматический редирект в мессенджер после успешного создания аккаунта
      expect(routerGoSpy).toHaveBeenCalledWith('/chats');
    }, { timeout: 1000, interval: 5 });
  });
});

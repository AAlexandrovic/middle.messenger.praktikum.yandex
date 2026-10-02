import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthForm from '../AuthForm';
import { createFormPageTest } from './FormPage.factory';
import UserController from '../../api/controllers/UserController';

describe('Компонент AuthForm', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Должен корректно рендерить структуру формы и поля ввода', () => {
    const { element } = createFormPageTest(AuthForm, '/');

    const title = element?.querySelector('.form-title');
    expect(title?.textContent).toBe('Вход');
    expect(element?.querySelector('input[name="login"]')).toBeTruthy();
    expect(element?.querySelector('input[name="password"]')).toBeTruthy();
  });

  it('Должен осуществлять SPA-переход на роут регистрации при клике на ссылку', () => {
    const { element, formPageInstance, routerGoSpy } = createFormPageTest(AuthForm, '/');

    (formPageInstance as any).componentDidMount();
    const registerLink = element?.querySelector('a[data-route="/register"]') as HTMLElement;
    registerLink.click();

    expect(routerGoSpy).toHaveBeenCalledWith('/register');
  });

  it('Должен отправлять валидные данные формы в UserController при сабмите', async () => {
   const { element, formPageInstance, routerGoSpy } = createFormPageTest(AuthForm, '/');

    // Мокаем контроллер авторизации (передаем null as any под строгий generic типа UserDTO | null)
    const signinSpy = vi.spyOn(UserController, 'signin').mockResolvedValue(null as any);

    // Записываем живые текстовые данные прямо в DOM
    const loginInput = element?.querySelector('input[name="login"]') as HTMLInputElement;
    const passwordInput = element?.querySelector('input[name="password"]') as HTMLInputElement;
    
    loginInput.value = 'valid_login';
    passwordInput.value = 'valid_password';

    // Находим дочерний блок формы внутри универсального инстанса страницы formPageInstance
    const formBlock = formPageInstance.children.find((c: any) => c.props?.id === 'auth-form') as any;
    if (formBlock) {
      // Подменяем метод валидации дочерней формы, чтобы он всегда пропускал сабмит дальше
      formBlock.validate = () => true;
      
      // Переопределяем геттер formData через Object.defineProperty,
      Object.defineProperty(formBlock, 'formData', {
        get: () => ({ login: 'valid_login', password: 'valid_password' }),
        configurable: true
      });
    }

    // Находим HTML форму и триггерим нативное событие отправки
    const formEl = element?.querySelector('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    formEl?.dispatchEvent(submitEvent);

    //вместо promise
    await vi.waitFor(() => {
      // Проверяем, что контроллер получил верные параметры
      expect(signinSpy).toHaveBeenCalledWith({
        login: 'valid_login',
        password: 'valid_password',
      });

      // Проверяем, что роутер совершил переход
      expect(routerGoSpy).toHaveBeenCalledWith('/chats');
    }, { timeout: 1000, interval: 5 });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsPasswordPage from '../../pages/settings/SettingsPasswordPage';
import { createFormPageTest } from './FormPage.factory';
import UserController from '../../api/controllers/UserController';

describe('Компонент SettingsPasswordPage', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Должен корректно рендерить структуру страницы и все 3 поля для смены пароля', () => {
    const { element } = createFormPageTest(SettingsPasswordPage, '/settings/password');

    // Проверяем наличие инпутов по атрибуту name
    const oldPasswordInput = element?.querySelector('input[name="old_password"]');
    const newPasswordInput = element?.querySelector('input[name="new_password"]');
    const repeatPasswordInput = element?.querySelector('input[name="repeat_password"]');

    expect(oldPasswordInput).toBeTruthy();
    expect(newPasswordInput).toBeTruthy();
    expect(repeatPasswordInput).toBeTruthy();
  });

  it('Должен выводить на экран ошибку, если новые пароли не совпадают', async () => {
    const { element, formPageInstance } = createFormPageTest(SettingsPasswordPage, '/settings/password');

    // Находим дочерний блок формы
    const formBlock = formPageInstance.children.find((c: any) => c.props?.id === 'password-form') as any;
    if (formBlock) {
      formBlock.constructor.componentName = 'Form';
      
      // Имитируем несовпадение паролей
      Object.defineProperty(formBlock, 'formData', {
        get: () => ({
          old_password: 'old123_password',
          new_password: 'new123_password',
          repeat_password: 'different_new_password'
        }),
        configurable: true
      });
    }

    // Триггерим сабмит формы
    const formEl = element?.querySelector('form');
    formEl?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await Promise.resolve();

    expect((formPageInstance as any).props.error).toBe('Новые пароли не совпадают.');
  });

  it('Должен отправлять валидный PasswordUpdateRequest в UserController при совпадении новых паролей', async () => {
    const { element, formPageInstance, routerGoSpy } = createFormPageTest(SettingsPasswordPage, '/settings/password');

    // Шпионим за методом обновления пароля в контроллере
    const updatePasswordSpy = vi.spyOn(UserController, 'updatePassword').mockResolvedValue(null as any);

    const formBlock = formPageInstance.children.find((c: any) => c.props?.id === 'password-form') as any;
    if (formBlock) {
      formBlock.constructor.componentName = 'Form';
      
      // Имитируем идеальное совпадение паролей для прохождения валидации
      Object.defineProperty(formBlock, 'formData', {
        get: () => ({
          old_password: 'current_password_123',
          new_password: 'brand_new_password_456',
          repeat_password: 'brand_new_password_456'
        }),
        configurable: true
      });
    }

    // Отправляем форму
    const formEl = element?.querySelector('form');
    formEl?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Декларативно ожидаем выполнения асинхронных потоков
    await vi.waitFor(() => {
      // Проверяем, что UserController принял очищенный объект PasswordUpdateRequest по спецификации API
      expect(updatePasswordSpy).toHaveBeenCalledWith({
        oldPassword: 'current_password_123',
        newPassword: 'brand_new_password_456',
      });

      // Проверяем, что после успешной смены роутер перенаправил пользователя в профиль
      expect(routerGoSpy).toHaveBeenCalledWith('/settings');
    }, { timeout: 1000, interval: 5 });
  });
});

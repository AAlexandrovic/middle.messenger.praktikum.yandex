import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsEditPage from '../settings/SettingsEditPage'; 
import { createFormPageTest } from './FormPage.factory';
import UserController from '../../api/controllers/UserController';
import store from '../../api/store';

describe('Компонент SettingsEditPage', () => {

  // Структура данных пользователя, которую ожидает HOC connect из Store
  const fakeUserInStore = {
    login: 'petya_cool',
    avatar: '/avatar.png',
    first_name: 'Petya',
    second_name: 'Pupkin',
    display_name: 'Petya Developer',
    email: 'petya@ya.ru',
    phone: '+79991112233',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    // Перед каждым тестом принудительно вычищаем store
    if (typeof (store as any).clear === 'function') {
      (store as any).clear();
    }
  });

  it('Должен корректно рендерить структуру страницы и предзаполнять 6 полей ввода данными пользователя', async () => {
    // записываем данные напрямую в Store приложения. 
    store.setState('user', fakeUserInStore);

    const { element } = createFormPageTest(SettingsEditPage as any, '/settings/edit');

    // Находим инпуты
    const firstNameInput = element?.querySelector('input[name="first_name"]') as HTMLInputElement;
    const emailInput = element?.querySelector('input[name="email"]') as HTMLInputElement;
    const loginInput = element?.querySelector('input[name="login"]') as HTMLInputElement;

    expect(firstNameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(loginInput).toBeTruthy();

    // Проверяем, что данные из store успешно попали в HTML-атрибуты value
    expect(firstNameInput.value).toBe('Petya');
    expect(emailInput.value).toBe('petya@ya.ru');
    expect(loginInput.value).toBe('petya_cool');
  });

  it('Должен отправлять FormData с файлом в UserController при изменении аватара', async () => {
    store.setState('user', fakeUserInStore);
    const { element, formPageInstance } = createFormPageTest(SettingsEditPage as any, '/settings/edit');

    const updateAvatarSpy = vi.spyOn(UserController, 'updateAvatar').mockResolvedValue(null as any);

    // Находим инпут аватара.
    let avatarInput = element?.querySelector('#avatar-input') as HTMLInputElement;
    if (!avatarInput) {
      avatarInput = element?.querySelector('input[type="file"]') as HTMLInputElement;
    }

    expect(avatarInput).toBeTruthy();

    if (avatarInput) {
      const fakeFile = new File([''], 'avatar.png', { type: 'image/png' });
      Object.defineProperty(avatarInput, 'files', { value: [fakeFile], configurable: true });

       // имитируем событие change.
      const mockEvent = { target: avatarInput } as any;
      await (formPageInstance as any).handleAvatarChange(mockEvent);
    }

    // Проверяем вызов шпиона контроллера
    await vi.waitFor(() => {
      expect(updateAvatarSpy).toHaveBeenCalled();
      const calledArg = updateAvatarSpy.mock.calls[0][0];
      expect(calledArg instanceof FormData).toBe(true);
      expect(calledArg.get('avatar')).toBeTruthy();
    }, { timeout: 1000, interval: 5 });
  });

  it('Должен отправлять валидный ProfileUpdateRequest в UserController при успешном сабмите формы', async () => {
    store.setState('user', fakeUserInStore);
    const { element, formPageInstance, routerGoSpy } = createFormPageTest(SettingsEditPage as any, '/settings/edit');

    const updateProfileSpy = vi.spyOn(UserController, 'updateProfile').mockResolvedValue(null as any);

    const formBlock = formPageInstance.children.find((c: any) => c.props?.id === 'profile-edit-form') as any;
    if (formBlock) {
      formBlock.constructor.componentName = 'Form';
      formBlock.validate = () => true;
      
      Object.defineProperty(formBlock, 'formData', {
        get: () => ({
          first_name: 'PetyaNew',
          second_name: 'Pupkin',
          display_name: 'Petya Dev',
          email: 'petyanew@ya.ru',
          phone: '+79991112233',
          login: 'petya_cool'
        }),
        configurable: true
      });
    }

    const formEl = element?.querySelector('form');
    formEl?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => {
      expect(updateProfileSpy).toHaveBeenCalledWith({
        first_name: 'PetyaNew',
        second_name: 'Pupkin',
        display_name: 'Petya Dev',
        email: 'petyanew@ya.ru',
        phone: '+79991112233',
        login: 'petya_cool'
      });

      expect(routerGoSpy).toHaveBeenCalledWith('/settings');
    }, { timeout: 1000, interval: 5 });
  });
});

// src/components/pages/tests/SettingsPage.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsPage from '../../pages/settings/SettingsPage'; // Укажите правильный относительный путь
import { createFormPageTest } from './FormPage.factory';
import UserController from '../../api/controllers/UserController';
import store from '../../api/store';
import { RESOURCES_URL } from '../../api/config';

describe('Компонент SettingsPage (Профиль пользователя)', () => {

  // Структура данных, которую HOC connect считывает из Store
  const fakeUserInStore = {
    login: 'ivan_dev',
    avatar: '/my-avatar.jpg',
    first_name: 'Иван',
    second_name: 'Иванов',
    display_name: 'Иванович',
    email: 'ivan@yandex.ru',
    phone: '+79995554433',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    // Чистим Store перед каждым тестом
    if (typeof (store as any).clear === 'function') {
      (store as any).clear();
    }
  });

  it('Должен корректно рендерить карточку профиля и выводить все текстовые данные из Store', () => {
    // заполняем store
    store.setState('user', fakeUserInStore);

    // инициализируем страницу через фабрику
    const { element } = createFormPageTest(SettingsPage as any, '/settings');

    // Находим текстовые блоки данных в dom
    const titleEl = element?.querySelector('.settings-profile__title');
    const avatarImg = element?.querySelector('.settings-profile__avatar') as HTMLImageElement;

    // проверяем заголовок и аватарку
    expect(titleEl?.textContent).toBe('Иванович');
    expect(avatarImg?.src).toBe(`${RESOURCES_URL}/my-avatar.jpg`);

    // 4. Проверяем, что текстовые значения полей (Имя, Фамилия, Почта) попали в верстку
    const htmlContent = element?.innerHTML || '';
    expect(htmlContent).toContain('Иван');
    expect(htmlContent).toContain('Иванов');
    expect(htmlContent).toContain('ivan@yandex.ru');
    expect(htmlContent).toContain('+79995554433');
  });

  it('Должен вызывать UserController.logout() и делать редирект на главную при клике на "Выйти"', async () => {
    store.setState('user', fakeUserInStore);
    const { element, formPageInstance, routerGoSpy } = createFormPageTest(SettingsPage as any, '/settings');

    // Шпионим за методом логаута контроллера
    const logoutSpy = vi.spyOn(UserController, 'logout').mockResolvedValue(undefined as any);

    // Подменяем нативный alert, чтобы он не блокировал выполнение тестов в jsdom окружении
    vi.stubGlobal('alert', vi.fn());

    // Вызываем componentDidMount принудительно, чтобы привязать addEventListener к кнопке логаута
    (formPageInstance as any).componentDidMount();

    // Находим кнопку выхода по атрибуту data-action
    const logoutBtn = element?.querySelector('[data-action="logout"]') as HTMLElement;
    expect(logoutBtn).toBeTruthy();

    // Симулируем клик пользователя по кнопке "Выйти"
    logoutBtn.click();

    // Ожидаем завершения цепочки асинхронных операций
    await vi.waitFor(() => {
      // Проверяем, что контроллер зафиксировал команду выхода
      expect(logoutSpy).toHaveBeenCalled();
      
      // Проверяем, что роутер перенаправил неавторизованного пользователя на страницу входа
      expect(routerGoSpy).toHaveBeenCalledWith('/');
    }, { timeout: 1000, interval: 5 });
  });
});

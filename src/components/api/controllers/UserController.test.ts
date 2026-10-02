// src/components/api/controllers/tests/UserController.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserController from './UserController';
import { createUserControllerTest } from './UserController.factory';

describe('Контроллер UserController (Фабричные тесты авторизации)', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('signin должен принудительно очищать Store, вызывать API и запрашивать данные профиля', async () => {
    const { apiMocks, fakeUser, storeClearSpy, store } = createUserControllerTest();
    const credentials = { login: 'ivan_login', password: 'password123' };

    await UserController.signin(credentials);

    // Проверяем, что контроллер стёр старые данные с компьютера для безопасности
    expect(storeClearSpy).toHaveBeenCalled();
    // Проверяем вызов API входа
    expect(apiMocks.signin).toHaveBeenCalledWith(credentials);
    // Проверяем, что после успеха контроллер сам вызвал getUser() и сохранил юзера в Store
    expect(apiMocks.getUser).toHaveBeenCalled();
    expect(store.getState().user).toEqual(fakeUser);
  });

  it('signin должен сбрасывать данные юзера в null при ошибке авторизации', async () => {
    const { apiMocks, store } = createUserControllerTest();
    // Имитируем падение сервера Яндекса с ошибкой 400 Bad Request
    apiMocks.signin.mockRejectedValue(new Error('Неверный логин или пароль'));

    const credentials = { login: 'wrong', password: 'bad' };

    await expect(UserController.signin(credentials)).rejects.toThrow('Неверный логин или пароль');
    // Проверяем, что стейт гарантированно очистился в null
    expect(store.getState().user).toBeNull();
  });

  it('getUser должен корректно обрабатывать ошибку 401 и возвращать null без падения скрипта', async () => {
    const { apiMocks, store } = createUserControllerTest();
    
    // Имитируем ответ неавторизованного пользователя (401 Unauthorized)
    const error401 = { status: 401, reason: 'Unauthorized' };
    apiMocks.getUser.mockRejectedValue(error401);

    const result = await UserController.getUser();

    // Проверяем, что контроллер обработал эту ошибку мягко, вернул null и не уронил приложение
    expect(result).toBeNull();
    expect(store.getState().user).toBeNull();
  });

  it('signup должен очищать Store, создавать аккаунт и автоматически логинить пользователя', async () => {
    const { apiMocks, fakeUser, storeClearSpy, store } = createUserControllerTest();
    const signUpData = {
      first_name: 'Ivan',
      second_name: 'Ivanov',
      login: 'ivan_login',
      email: 'ivan@yandex.ru',
      password: 'password123',
      phone: '+79998887766'
    };

    await UserController.signup(signUpData);

    expect(storeClearSpy).toHaveBeenCalled();
    expect(apiMocks.create).toHaveBeenCalledWith(signUpData);
    // Проверяем цепочку автоматического запроса профиля после успешной регистрации
    expect(apiMocks.getUser).toHaveBeenCalled();
    expect(store.getState().user).toEqual(fakeUser);
  });

  it('logout должен очищать состояние пользователя в Сторе после успешного вызова API', async () => {
    const { apiMocks, store } = createUserControllerTest();
    // Записываем фейкового юзера перед логаутом
    store.setState('user', { id: 1 });

    await UserController.logout();

    expect(apiMocks.logout).toHaveBeenCalled();
    // Проверяем, что сессия успешно стерта из Сторе
    expect(store.getState().user).toBeNull();
  });

  it('updateProfile должен передавать новые поля на сервер и обновлять реактивное состояние', async () => {
    const { apiMocks, store } = createUserControllerTest();
    const profileFields = {
      first_name: 'IvanNew',
      second_name: 'Ivanov',
      display_name: 'Ivan Developer',
      login: 'ivan_login',
      email: 'ivan_new@yandex.ru',
      phone: '+79998887766'
    };

    const expectedUpdatedUser = { ...profileFields, id: 777, avatar: '' };
    apiMocks.update.mockResolvedValue(expectedUpdatedUser as any);

    await UserController.updateProfile(profileFields);

    expect(apiMocks.update).toHaveBeenCalledWith(profileFields);
    // Проверяем, что в Сторе мгновенно появились измененные данные
    expect(store.getState().user).toEqual(expectedUpdatedUser);
  });

  it('updateAvatar должен отправлять FormData и сохранять обновленный профиль с картинкой', async () => {
    const { apiMocks, store, fakeUser } = createUserControllerTest();
    const fakeFormData = new FormData();

    // возвращаем копию fakeUser, подменяя его аватар на новый путь.
    const updatedUserWithAvatar = { ...fakeUser, avatar: '/new-avatar.jpg' };
    apiMocks.updateAvatar.mockResolvedValue(updatedUserWithAvatar as any);

    // Проверяем вызов API
    await UserController.updateAvatar(fakeFormData);

    expect(apiMocks.updateAvatar).toHaveBeenCalledWith(fakeFormData);
    
    const userInStore = store.getState().user as Record<string, unknown> | null;
    expect(userInStore?.avatar).toBe('/new-avatar.jpg');
  });

  it('updatePassword должен вызывать метод изменения пароля в API', async () => {
    const { apiMocks } = createUserControllerTest();
    const passwordData = { oldPassword: '123', newPassword: '456' };

    await UserController.updatePassword(passwordData);

    expect(apiMocks.updatePassword).toHaveBeenCalledWith(passwordData);
  });
});

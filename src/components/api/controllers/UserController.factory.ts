import { vi } from 'vitest';
import store from '../store';
import UserAPI, { type UserDTO } from '../Models/user-api';

export function createUserControllerTest() {
  // 1. Очищаем глобальное состояние Store перед тестом
  store.setState('user', null);
  store.setState('chats', []);
  store.setState('messages', []);

  // 2. Генерируем эталонный фиктивный объект пользователя (UserDTO)
  const fakeUser: UserDTO = {
    id: 777,
    first_name: 'Ivan',
    second_name: 'Ivanov',
    display_name: 'Ivan Dev',
    login: 'ivan_login',
    email: 'ivan@yandex.ru',
    phone: '+79998887766',
    avatar: '/path/to/avatar.jpg'
  };

  // 3. Создаем шпионы для всех методов UserAPI
  const apiMocks = {
    signin: vi.spyOn(UserAPI, 'signin').mockResolvedValue(undefined as any),
    getUser: vi.spyOn(UserAPI, 'getUser').mockResolvedValue(fakeUser),
    create: vi.spyOn(UserAPI, 'create').mockResolvedValue({ id: 777 }),
    logout: vi.spyOn(UserAPI, 'logout').mockResolvedValue(undefined as any),
    update: vi.spyOn(UserAPI, 'update').mockResolvedValue(fakeUser),
    updateAvatar: vi.spyOn(UserAPI, 'updateAvatar').mockResolvedValue(fakeUser),
    updatePassword: vi.spyOn(UserAPI, 'updatePassword').mockResolvedValue(undefined as any),
  };

  // Шпионим за методом clear у store, чтобы проверять сброс сессий
  const storeClearSpy = vi.spyOn(store, 'clear');

  return {
    apiMocks,
    fakeUser,
    storeClearSpy,
    store,
  };
}

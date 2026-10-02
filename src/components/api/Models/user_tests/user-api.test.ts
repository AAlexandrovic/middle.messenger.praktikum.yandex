import { describe, it, expect } from 'vitest';
import userAPI from '../user-api';
import { createHTTPTransport } from '../../services/HTTPTransport.factory';
import { createUserDTO, createSearchUserDTO } from './user-api.factory';
import { BASE_URL } from '../../config'; 

describe('Модель UserAPI', () => {

  it('Метод signin должен отправлять корректный POST запрос', async () => {
    const { mockXHR } = createHTTPTransport();
    const credentials = { login: 'testuser', password: 'password123' };

    await userAPI.signin(credentials);

    expect(mockXHR.open).toHaveBeenCalledWith('POST', `${BASE_URL}/auth/signin`);
    expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify({ login: 'testuser', password: 'password123' }));
  });

  it('Метод getUser должен успешно возвращать пользователя', async () => {
    const fakeUser = createUserDTO({ id: 999, login: 'nagibator123' });
    
    createHTTPTransport({ responseText: JSON.stringify(fakeUser) });

    const result = await userAPI.getUser();

    expect(result).toEqual(fakeUser);
    expect(result.id).toBe(999);
    expect(result.login).toBe('nagibator123');
  });

  it('Метод update профиля должен отправлять PUT запрос на верный эндпоинт', async () => {
    const updatedUser = createUserDTO({ first_name: 'NewName' });
    const { mockXHR } = createHTTPTransport({ responseText: JSON.stringify(updatedUser) });

    const updateFields = {
      first_name: 'NewName',
      second_name: 'Pupkin',
      display_name: 'Petya Developer',
      login: 'petya_cool',
      email: 'petya@ya.ru',
      phone: '+79991112233'
    };

    const result = await userAPI.update(updateFields);

    expect(mockXHR.open).toHaveBeenCalledWith('PUT', `${BASE_URL}/user/profile`);
    expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify(updateFields));
    expect(result.first_name).toBe('NewName');
  });

  it('Метод searchUsers должен корректно передавать query-строку поиска и возвращать массив', async () => {
    const fakeSearchResults = [createSearchUserDTO({ login: 'qwertyu' })];
    const { mockXHR } = createHTTPTransport({ responseText: JSON.stringify(fakeSearchResults) });

    const result = await userAPI.searchUsers('qwertyu');

    expect(mockXHR.open).toHaveBeenCalledWith('POST', `${BASE_URL}/user/search`);
    expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify({ login: 'qwertyu' }));
    
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].login).toBe('qwertyu');
  });
});

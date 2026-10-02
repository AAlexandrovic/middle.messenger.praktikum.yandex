import { describe, it, expect } from 'vitest';
import chatsAPI from '../chats-api'; 
import { createHTTPTransport } from '../../services/HTTPTransport.factory'; 
import { createChatDTO, createChatUserDTO } from './chats-api.factory'; 
import { BASE_URL } from '../../config'; 

describe('Модель ChatsAPI', () => {

  it('Метод getChats должен возвращать массив существующих чатов', async () => {
    // 1. Генерируем тестовый массив чатов через фабрику
    const fakeChatsList = [createChatDTO({ id: 1, title: 'Первый чат' }), createChatDTO({ id: 2, title: 'Второй чат' })];
    const { mockXHR } = createHTTPTransport({ responseText: JSON.stringify(fakeChatsList) });

    // 2. Вызываем метод модели
    const result = await chatsAPI.getChats();

    // 3. Проверяем корректность сшитого роута и данных
    expect(mockXHR.open).toHaveBeenCalledWith('GET', `${BASE_URL}/chats`);
    expect(result).toEqual(fakeChatsList);
    expect(result.length).toBe(2);
    expect(result[0].title).toBe('Первый чат');
  });

  it('Метод create должен отправлять POST запрос с названием нового чата', async () => {
    const { mockXHR } = createHTTPTransport();
    const chatTitle = 'Новый секретный чат';

    await chatsAPI.create(chatTitle);

    expect(mockXHR.open).toHaveBeenCalledWith('POST', `${BASE_URL}/chats`);
    expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify({ title: chatTitle }));
  });

  it('Метод addUsers должен слать PUT запрос со списком ID пользователей и ID чата', async () => {
    const { mockXHR } = createHTTPTransport();
    const userIds = [123, 456];
    const chatId = 137161;

    await chatsAPI.addUsers(userIds, chatId);

    expect(mockXHR.open).toHaveBeenCalledWith('PUT', `${BASE_URL}/chats/users`);
    expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify({
      users: userIds,
      chatId: chatId
    }));
  });

  it('Метод getChatUsers должен отправлять GET запрос и возвращать список участников', async () => {
    const fakeUsersList = [createChatUserDTO({ id: 6301, role: 'admin' }), createChatUserDTO({ id: 180, role: 'regular' })];
    const chatId = 137161;
    
    const { mockXHR } = createHTTPTransport({ responseText: JSON.stringify(fakeUsersList) });

    const result = await chatsAPI.getChatUsers(chatId);

    expect(mockXHR.open).toHaveBeenCalledWith('GET', `${BASE_URL}/chats/${chatId}/users`);
    expect(result).toEqual(fakeUsersList);
    expect(result[0].role).toBe('admin');
  });

  it('Метод delete должен отправлять корректный JSON-объект chatId', async () => {
    const { mockXHR } = createHTTPTransport();
    const chatIdToDelete = 137161;

    await chatsAPI.delete(chatIdToDelete);

    expect(mockXHR.open).toHaveBeenCalledWith('DELETE', `${BASE_URL}/chats`);
    expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify({
      chatId: chatIdToDelete
    }));
  });

  it('Метод getChatToken должен слать POST запрос на эндпоинт токена чата', async () => {
    const fakeTokenResponse = { token: 'super-secret-websocket-token-12345' };
    const chatId = 137161;
    
    const { mockXHR } = createHTTPTransport({ responseText: JSON.stringify(fakeTokenResponse) });

    const result = await chatsAPI.getChatToken(chatId);

    expect(mockXHR.open).toHaveBeenCalledWith('POST', `${BASE_URL}/chats/token/${chatId}`);
    expect(result).toEqual(fakeTokenResponse);
    expect(result.token).toBe('super-secret-websocket-token-12345');
  });
});

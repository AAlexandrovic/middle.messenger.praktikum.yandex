import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatsController from './ChatsController';
import { createChatsControllerTest } from './ChatsController.factory';

describe('Контроллер ChatsController', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchChats должен запрашивать данные по API и обновлять глобальный Store', async () => {
    const { apiMocks, store } = createChatsControllerTest();
    const fakeChats = [{ id: 1, title: 'Общий чат' }];
    apiMocks.getChats.mockResolvedValue(fakeChats as any);

    await ChatsController.fetchChats(true);

    expect(apiMocks.getChats).toHaveBeenCalled();
    expect(store.getState().chats).toEqual(fakeChats);
  });

  it('selectChatByTitle должен переключать активный ID чата и разворачивать WS-соединение', async () => {
    const { apiMocks, wsProtoMocks, store } = createChatsControllerTest();
    const targetChat = { id: 42, title: 'Флудилка' };
    
    // Имитируем, что нужный чат найден в поиске по названию
    apiMocks.getChatByTitle.mockResolvedValue([targetChat] as any);

    await ChatsController.selectChatByTitle('Флудилка');

    // Проверяем изменение состояния реактивного Стора
    expect(store.getState().activeChatId).toBe(42);
    // Проверяем, что контроллер запросил токен и развернул WebSocket транспорт
    expect(apiMocks.getChatToken).toHaveBeenCalledWith(42);
    expect(wsProtoMocks.connect).toHaveBeenCalled();
  });

  it('sendMessage должен отправлять структурированный JSON-пакет через сокет', () => {   
    const mockSocketInstance = {
      send: vi.fn()
    };
    (ChatsController as any)._wsTransport = mockSocketInstance;

    // Вызываем тестируемый метод контроллера
    ChatsController.sendMessage('Привет, мир!');

    // Проверяем, что контроллер передал правильные поля
    expect(mockSocketInstance.send).toHaveBeenCalledWith({
      content: 'Привет, мир!',
      type: 'message'
    });

    // Очищаем приватное свойство после теста для сохранения чистоты окружения
    (ChatsController as any)._wsTransport = null;
  });

  it('searchAndAddUserToChat должен корректно обрабатывать выбор пользователя через prompt и вызывать API', async () => {
    const { userApiMocks, apiMocks, globalMocks } = createChatsControllerTest();
    const fakeUsers = [
      { id: 10, login: 'ivan_petya', first_name: 'Иван', second_name: 'Петров' }
    ];

    userApiMocks.searchUsers.mockResolvedValue(fakeUsers as any);
    // Симулируем ввод пользователем цифры "1" в окне prompt (выбор первого юзера из списка)
    globalMocks.prompt.mockReturnValue('1');

    const result = await ChatsController.searchAndAddUserToChat('ivan_petya', 99);

    expect(userApiMocks.searchUsers).toHaveBeenCalledWith('ivan_petya');
    expect(globalMocks.prompt).toHaveBeenCalled();
    // Проверяем, что на бэкенд Практикума ушел массив с ID выбранного юзера и верный ID чата
    expect(apiMocks.addUsers).toHaveBeenCalledWith([10], 99);
    expect(result).toBe(true);
  });

  it('searchAndDeleteUserFromChat должен запрашивать список участников и удалять выбранного', async () => {
    const { apiMocks, globalMocks } = createChatsControllerTest();
    const fakeChatUsers = [
      { id: 55, login: 'bad_user', role: 'regular', first_name: 'Джон', second_name: 'Доу' }
    ];

    apiMocks.getChatUsers.mockResolvedValue(fakeChatUsers as any);
    // Симулируем выбор цифры "1" для подтверждения удаления
    globalMocks.prompt.mockReturnValue('1');

    const result = await ChatsController.searchAndDeleteUserFromChat(99);

    expect(apiMocks.getChatUsers).toHaveBeenCalledWith(99);
    expect(apiMocks.deleteUsers).toHaveBeenCalledWith([55], 99);
    expect(result).toBe(true);
  });

  it('deleteChat должен стирать комнату, сбрасывать активный чат в Сторе и обновлять списки', async () => {
    const { apiMocks, store } = createChatsControllerTest();
    store.setState('activeChatId', 137); // Выбираем удаляемый чат активным

    await ChatsController.deleteChat(137);

    expect(apiMocks.delete).toHaveBeenCalledWith(137);
    // Проверяем, что окно удаленного чата автоматически закрылось (сбросилось в null)
    expect(store.getState().activeChatId).toBeNull();
    // Проверяем вызов триггера обновления списков
    expect(apiMocks.getChats).toHaveBeenCalled();
  });

  it('updateChatAvatar должен отправлять бинарные данные FormData и обновлять профили', async () => {
    const { apiMocks } = createChatsControllerTest();
    const fakeFormData = new FormData();

    await ChatsController.updateChatAvatar(fakeFormData);

    expect(apiMocks.updateChatAvatar).toHaveBeenCalledWith(fakeFormData);
    expect(apiMocks.getChats).toHaveBeenCalled();
  });
});

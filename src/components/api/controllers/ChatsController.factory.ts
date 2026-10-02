import { vi } from 'vitest';
import store from '../store';
import ChatsAPI from '../Models/chats-api';
import UserAPI from '../Models/user-api';
import { WSTransport } from '../services/WSTransport';

export function createChatsControllerTest() {
  // Сбрасываем и очищаем глобальное состояние Store
  store.setState('chats', []);
  store.setState('activeChatId', null);
  store.setState('messages', []);
  store.setState('user', { id: 777, first_name: 'Тест', login: 'test_user' });

  // Создаем базовые шпионы для методов ChatsAPI
  const apiMocks = {
    getChats: vi.spyOn(ChatsAPI, 'getChats').mockResolvedValue([]),
    getChatByTitle: vi.spyOn(ChatsAPI, 'getChatByTitle').mockResolvedValue([] as any),
    getChatToken: vi.spyOn(ChatsAPI, 'getChatToken').mockResolvedValue({ token: 'mock_token_123' }),
    create: vi.spyOn(ChatsAPI, 'create').mockResolvedValue(undefined as any),
    addUsers: vi.spyOn(ChatsAPI, 'addUsers').mockResolvedValue(undefined as any),
    getChatUsers: vi.spyOn(ChatsAPI, 'getChatUsers').mockResolvedValue([]),
    deleteUsers: vi.spyOn(ChatsAPI, 'deleteUsers').mockResolvedValue(undefined as any),
    delete: vi.spyOn(ChatsAPI, 'delete').mockResolvedValue(undefined as any),
    updateChatAvatar: vi.spyOn(ChatsAPI, 'updateChatAvatar').mockResolvedValue({} as any),
  };

  // Создаем базовые шпионы для UserAPI
  const userApiMocks = {
    searchUsers: vi.spyOn(UserAPI, 'searchUsers').mockResolvedValue([]),
  };

  // Мокаем встроенные браузерные функции ввода-вывода (prompt, alert)
  const globalMocks = {
    prompt: vi.spyOn(window, 'prompt').mockReturnValue(null),
    alert: vi.spyOn(window, 'alert').mockImplementation(() => {}),
    confirm: vi.spyOn(window, 'confirm').mockReturnValue(true),
  };

  // Заглушаем методы прототипа WSTransport, чтобы исключить реальный сетевой трафик сокетов
  const wsProtoMocks = {
    connect: vi.spyOn(WSTransport.prototype, 'connect').mockResolvedValue(undefined),
    send: vi.spyOn(WSTransport.prototype, 'send').mockImplementation(() => {}),
    close: vi.spyOn(WSTransport.prototype, 'close').mockImplementation(() => {}),
    on: vi.spyOn(WSTransport.prototype, 'on'),
  };

  return {
    apiMocks,
    userApiMocks,
    globalMocks,
    wsProtoMocks,
    store,
  };
}

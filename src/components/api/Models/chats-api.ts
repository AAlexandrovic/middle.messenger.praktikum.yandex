import HTTPTransport from '../HTTPTransport';
import { BaseAPI } from '../base-api';
import { UserDTO } from './user-api';

// Создаем инстанс транспорта для чатов (базовый URL Яндекса)
const chatAPIInstance = new HTTPTransport('https://ya-praktikum.tech');

// Структура последнего сообщения из реального ответа API
export interface LastMessageDTO {
  user: Omit<UserDTO, 'id' | 'display_name'>; // Вложенный юзер в last_message идет без id и display_name
  time: string; // ISO дата: "2020-01-02T14:22:22.000Z"
  content: string;
}

// Корневой интерфейс чата, приходящий от API Практикума
export interface ChatDTO {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  created_by: number;
  last_message: LastMessageDTO | null; // Может быть null, если чат пустой
}

class ChatsAPI extends BaseAPI {
        // Получить список всех чатов
        public getChats(): Promise<ChatDTO[]> {
          return chatAPIInstance.get<ChatDTO[]>('/chats');
        }

        // Создать новый чат
        public createChat(title: string): Promise<void> {
          return chatAPIInstance.post<void>('/chats', { data: { title } });
        }

        // // Вспомогательный метод получения WebSocket токена для чата
        // public getChatToken(chatId: number): Promise<{ token: string }> {
        //   return chatAPIInstance.post<{ token: string }>(`/chats/token/${chatId}`, {});
        // }

          create(): Promise<unknown> {
              throw new Error('ChatAPI.delete is not implemented');
          }
  
          request() {
              return chatAPIInstance.get('/full');
          }
  
          // Обновление данных пользователя
          update(): Promise<unknown> {
            throw new Error('ChatAPI.delete is not implemented');
          }
  
          delete(): Promise<unknown> {
              throw new Error('ChatAPI.delete is not implemented');
          }
}

export default new ChatsAPI();

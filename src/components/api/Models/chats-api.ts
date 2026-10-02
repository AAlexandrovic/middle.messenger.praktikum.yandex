import HTTPTransport from '../services/HTTPTransport';
import { BaseAPI } from '../base-api';
import { UserDTO } from './user-api';

// Создаем инстанс транспорта для чатов (базовый URL Яндекса)
const chatAPIInstance = new HTTPTransport();

// Структура последнего сообщения
export interface LastMessageDTO {
  user: Omit<UserDTO, 'id' | 'display_name'>; 
  time: string; 
  content: string;
}

// Корневой интерфейс чата
export interface ChatDTO {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  created_by: number;
  last_message: LastMessageDTO | null; // Может быть null, если чат пустой
}

export interface ChatUserDTO {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  avatar: string | null;
  role: string;
}

class ChatsAPI extends BaseAPI {
        // Получить список всех чатов
        public getChats(): Promise<ChatDTO[]> {
          return chatAPIInstance.get<ChatDTO[]>('/chats');
        }

        public getChatByTitle(title: string): Promise<ChatDTO[]> {
          return chatAPIInstance.get<ChatDTO[]>('/chats', { 
            data: { title } 
          });
        }

        //Добавляем новго пользователя в чат
        public addUsers(users: number[], chatId: number): Promise<void> {
            return chatAPIInstance.put<void>('/chats/users', {
              data: {
                users,
                chatId
              }
            });
        }

        public getChatUsers(chatId: number): Promise<ChatUserDTO[]> {
          return chatAPIInstance.get<ChatUserDTO[]>(`/chats/${chatId}/users`);
        }

        public deleteUsers(users: number[], chatId: number): Promise<void> {
          return chatAPIInstance.delete<void>('/chats/users', {
            data: {
              users,
              chatId
            }
          });
        }

        // Создать новый чат
        create(title: string): Promise<void> {
          return chatAPIInstance.post<void>('/chats', { data: { title } });
        }


        request() {
            return chatAPIInstance.get('/full');
        }

        // Обновление данных пользователя
        update(): Promise<unknown> {
          throw new Error('ChatAPI.delete is not implemented');
        }

        //Обновление аватара чата
        public updateChatAvatar(data: FormData): Promise<ChatDTO> {
          return chatAPIInstance.put<ChatDTO>('/chats/avatar', { data });
        }

        public delete(chatId: number): Promise<unknown> {
          return chatAPIInstance.delete<unknown>('/chats', {
            data: { 
              chatId 
            }
          });
        }

        //Получаем токе чата
        public getChatToken(chatId: number): Promise<{ token: string }> {
          return chatAPIInstance.post<{ token: string }>(`/chats/token/${chatId}`, {});
        }
}

export default new ChatsAPI();

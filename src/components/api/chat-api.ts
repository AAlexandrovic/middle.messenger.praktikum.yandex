  import HTTPTransport from './HTTPTransport';
  import { BaseAPI } from './base-api';

  const chatAPIInstance = new HTTPTransport('api/v1/chats');

  class ChatAPI extends BaseAPI {
      create(title: string) {
          // Здесь уже не нужно писать полный путь /api/v1/chats/
         return chatAPIInstance.post<{ id: number }>('/', {
            data: { title }, 
         });
      }

      request() {
          // Здесь уже не нужно писать полный путь /api/v1/chats/
          return chatAPIInstance.get('/full');
      }

        // Заглушки для абстрактных методов (чтобы класс мог быть создан)
        update(...args: any[]): Promise<unknown> {
            throw new Error('ChatAPI.update is not implemented');
        }

        delete(...args: any[]): Promise<unknown> {
            throw new Error('ChatAPI.delete is not implemented');
        }
  } 

export default new ChatAPI();

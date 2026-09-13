  import HTTPTransport from '../HTTPTransport';
  import { BaseAPI } from '../base-api';

  const chatAPIInstance = new HTTPTransport('https://ya-praktikum.tech/api/v2');


    export interface SignInRequest extends Record<string, unknown> {
        login: string;
        password: string;
    }

    export interface SignUpRequest extends Record<string, unknown> {
        first_name: string;
        second_name: string;
        login: string;
        email: string;
        password: string;
        phone: string;
    }

    export interface UserDTO {
        id: number;
        first_name: string;
        second_name: string;
        display_name: string;
        login: string;
        email: string;
        phone: string;
        avatar: string;
    }

  class UserAPI extends BaseAPI {
       // Авторизация
        signin(data: SignInRequest) {
            return chatAPIInstance.post<void>('/auth/signin', { data });
        }

        // Получение текущего пользователя (после авторизации)
        getUser() {
            return chatAPIInstance.get<UserDTO>('/auth/user');
        }

        //Выход пользователя из приложения
        logout() {
            return chatAPIInstance.post<void>('/auth/logout', {});
        }


      create(data: SignUpRequest) {
          return chatAPIInstance.post<{ id: number }>('/auth/signup', { data });
      }

      request() {
          // Здесь уже не нужно писать полный путь /api/v1/chats/
          return chatAPIInstance.get('/full');
      }

        // Заглушки для абстрактных методов (чтобы класс мог быть создан)
        update(): Promise<unknown> {
            throw new Error('ChatAPI.update is not implemented');
        }

        delete(): Promise<unknown> {
            throw new Error('ChatAPI.delete is not implemented');
        }
  } 

export default new UserAPI();
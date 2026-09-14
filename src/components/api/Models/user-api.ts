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

    export interface ProfileUpdateRequest extends Record<string, unknown> {
        first_name: string;
        second_name: string;
        display_name: string;
        login: string;
        email: string;
        phone: string;
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
            return chatAPIInstance.get('/full');
        }

        // Обновление данных пользователя
        update(data: ProfileUpdateRequest) {
            // API Практикума принимает данные профиля по пути /user/profile
            return chatAPIInstance.put<UserDTO>('/user/profile', { data });
        }

        public updateAvatar(data: FormData): Promise<UserDTO> {
            // Используем метод PUT, передаем эндпоинт и объект с данными
            return chatAPIInstance.put<UserDTO>('/user/profile/avatar', { data });
        }

        delete(): Promise<unknown> {
            throw new Error('ChatAPI.delete is not implemented');
        }
  } 

export default new UserAPI();
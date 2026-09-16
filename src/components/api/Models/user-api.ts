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

    export interface SearchUserDTO {
        id: number;
        first_name: string;
        second_name: string;
        display_name: string | null;
        phone: string;
        login: string;
        avatar: string | null;
        email: string;
    }

    export interface PasswordUpdateRequest extends Record<string, unknown> {
        oldPassword: string;
        newPassword: string;
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
            return chatAPIInstance.put<UserDTO>('/user/profile/avatar', { data });
        }

        public updatePassword(data: PasswordUpdateRequest): Promise<void> {
            return chatAPIInstance.put<void>('/user/password', { data });
        }

        delete(): Promise<unknown> {
            throw new Error('ChatAPI.delete is not implemented');
        }

        //Метод поиска пользователя по login
        searchUsers(login: string): Promise<SearchUserDTO[]> {
            return chatAPIInstance.post<SearchUserDTO[]>('/user/search', {
            data: { login }
        });
     }
  } 

export default new UserAPI();

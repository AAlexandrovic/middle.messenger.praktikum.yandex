import UserAPI, { type SignInRequest, type UserDTO, type SignUpRequest, type ProfileUpdateRequest } from '../Models/user-api';
import store from '../store';


class UserController {
  public signin(data: SignInRequest) {
    return UserAPI.signin(data)
      .then(() => this.getUser())
      .catch((error) => {
        console.error('signin error:', error);
        store.setState('user', null);
        throw error;
      });
  }


  public getUser(): Promise<UserDTO | null> {
    return UserAPI.getUser()
      .then((data: UserDTO) => {
        store.setState('user', data);
        return data;
      })
      .catch((error) => {
        if (error?.status === 401) {
          // 401 — это не ошибка, а нормальный "пользователь не авторизован"
          store.setState('user', null);
          return null;
        }
        // Все остальные ошибки — реальные сбои
        console.error('getUser error:', error);
        throw error;
      });
  }

    public async signup(data: SignUpRequest) {
    try {
      // 1. Создаем пользователя
      await UserAPI.create(data);
      
      // 2. После успешной регистрации Практикум автоматически авторизует сессию,
      // поэтому сразу запрашиваем данные созданного юзера в Стор
      await this.getUser();
    } catch (error) {
      console.error('signup error:', error);
      throw error;
    }
  }

  public logout() {
    return UserAPI.logout()
      .then(() => {
        store.setState('user', null);
      })
      .catch((error) => {
        console.error('logout error:', error);
        throw error;
      });
  }

   public async updateProfile(data: ProfileUpdateRequest) {

    try {
      const updatedUser = await UserAPI.update(data);

      store.setState('user', updatedUser);
      console.log(updatedUser);
    } catch (error) {
      console.error('updateProfile error:', error);
      throw error;
    }
  }

    public async updateAvatar(data: FormData): Promise<void> {
    try {
      // 1. Отправляем FormData на сервер через модель API
      // Бэкенд Практикума в случае успеха возвращает обновленный объект UserDTO
      const updatedUser = await UserAPI.updateAvatar(data);

      // 2. Записываем обновленные данные пользователя в глобальный стор.
      // Благодаря этому HOC connect мгновенно оповестит компонент SettingsEditPage,
      // и аватарка обновится на экране без перезагрузки страницы.
      store.setState('user', updatedUser);
      
      console.log('Аватар успешно обновлен в Store:', updatedUser.avatar);
    } catch (error) {
      console.error('updateAvatar error в UserController:', error);
      // Пробрасываем ошибку дальше, чтобы компонент мог вывести её в UI
      throw error; 
    }
  }
}

export default new UserController();

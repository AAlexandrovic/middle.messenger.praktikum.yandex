import UserAPI, { type SignInRequest, type UserDTO, type SignUpRequest, type ProfileUpdateRequest, type PasswordUpdateRequest } from '../Models/user-api';
import store from '../store';


class UserController {
  public signin(data: SignInRequest) {
    //Очищаем все данные если пользователь заходит с того же компьютера
    store.clear();
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
      store.clear();
      //Создаем пользователя
      await UserAPI.create(data);
      
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
      //console.log(updatedUser);
    } catch (error) {
      console.error('updateProfile error:', error);
      throw error;
    }
  }

  public async updateAvatar(data: FormData): Promise<void> {
    try {
      const updatedUser = await UserAPI.updateAvatar(data);

      store.setState('user', updatedUser);
    } catch (error) {
      console.error('updateAvatar error в UserController:', error);
      // Пробрасываем ошибку дальше, чтобы компонент мог вывести её в UI
      throw error; 
    }
  }

  public async updatePassword(data: PasswordUpdateRequest): Promise<void> {
    try {
      await UserAPI.updatePassword(data);
      //console.log('Пароль успешно изменен на сервере');
    } catch (error) {
      console.error('updatePassword error :', error);
      throw error; 
    }
  }
}

export default new UserController();

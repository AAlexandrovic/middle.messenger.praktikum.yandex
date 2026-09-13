import Block from "../../abstracts/Block";
import Router from "../../services/Router";
import { connect } from "../../api/HOC/connect";
import UserController from "../../api/controllers/UserController";

const router = new Router(".app");

interface UserSettings {
  avatar: string;
  displayName: string;
  firstName: string;
  secondName: string;
  email: string;
  phone: string;
}


interface SettingsPageProps {
  settingsPage?: { 
    user?: UserSettings | null;
  };
  [key: string]: unknown;
}

class SettingsPage extends Block<SettingsPageProps> {
  constructor(props: SettingsPageProps) {
    super(props);
  }

  protected template = `
    <main class="main-content">
        <div class="settings-page">

            <aside class="settings-page__sidebar">
                <a href="/chats" class="round-btn settings-page__back-btn router-link">&larr;</a>
            </aside>

            <main class="settings-page__content">
                <section class="settings-profile">
                    
                    <div class="settings-profile__avatar-container">
                        <img src="{{settingsPage.user.avatar}}" alt="Аватар пользователя" class="settings-profile__avatar">
                        <h1 class="settings-profile__title">{{settingsPage.user.displayName}}</h1>
                    </div>

                    <div class="settings-profile__info-list">
                        <div class="settings-profile__info-item">
                            <span class="settings-profile__label">Имя</span>
                            <span class="settings-profile__value">{{settingsPage.user.firstName}}</span>
                        </div>
                        <div class="settings-profile__info-item">
                            <span class="settings-profile__label">Фамилия</span>
                            <span class="settings-profile__value">{{settingsPage.user.secondName}}</span>
                        </div>
                        <div class="settings-profile__info-item">
                            <span class="settings-profile__label">Почта</span>
                            <span class="settings-profile__value">{{settingsPage.user.email}}</span>
                        </div>
                        <div class="settings-profile__info-item">
                            <span class="settings-profile__label">Телефон</span>
                            <span class="settings-profile__value">{{settingsPage.user.phone}}</span>
                        </div>
                    </div>

                    <div class="settings-profile__actions">
                        <a href="/settings/edit" class="settings-profile__btn settings-profile__btn_color_blue router-link">Изменить данные</a>
                        <a href="/settings/password" class="settings-profile__btn settings-profile__btn_color_blue router-link">Изменить пароль</a>
                        <a href="#" class="settings-profile__btn settings-profile__btn_color_red" data-action="logout">Выйти</a>
                    </div>

                </section>
            </main>
        </div>
    </main>
  `;

    protected componentDidMount() {
    
    // Находим кнопку выхода
    const logoutBtn = this.element()?.querySelector('[data-action="logout"]');
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // Отменяем стандартный переход по ссылке
        console.log(await UserController.getUser());

        try {
          // 1. Вызываем метод logout через наш фасад
          await UserController.logout();
          
          // 2. После успешного выхода делаем редирект
          router.go('/');
        } catch (error) {
          console.error('Ошибка выхода:', error);
          alert('Не удалось выйти из аккаунта. Попробуйте позже.');
        }
      });
    }
  }
}

export default connect((state) => {
  const user = state.user as any;

  // Если юзер в Сторе отсутствует, отдаем структуру с null
  if (!user) {
    return {
      settingsPage: { user: null }
    };
  }

  // Маппим данные из API 
  return {
    settingsPage: {
      user: {
        avatar: user.avatar ?? '',
        displayName: user.display_name ?? user.first_name ?? 'Пользователь',
        firstName: user.first_name ?? '',
        secondName: user.second_name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
      }
    }
  };
})(SettingsPage);

import Block from "../../abstracts/Block";

interface UserSettings {
  avatar: string;
  displayName: string;
  firstName: string;
  secondName: string;
  email: string;
  phone: string;
}

interface SettingsPageProps {
  settingsPage: {
    user: UserSettings;
  };
  [key: string]: unknown;
}

export default class SettingsPage extends Block<SettingsPageProps> {
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
                        <a href="/" class="settings-profile__btn settings-profile__btn_color_red router-link">Выйти</a>
                    </div>

                </section>
            </main>
        </div>
    </main>
  `;
}

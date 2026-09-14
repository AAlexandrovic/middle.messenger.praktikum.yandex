import Block from "../../abstracts/Block";
import { Form } from '../../Form';
import Router from "../../services/Router";
import { connect } from "../../api/HOC/connect";
import { type ProfileUpdateRequest} from "../../api/Models/user-api";
import UserController from "../../api/controllers/UserController";

const router = new Router(".app");

interface UserProfileData {
  avatar: string;
  login: string;
  firstName: string;
  secondName: string;
  displayName: string;
  email: string;
  phone: string;
}

interface SettingsEditProps {
  settingsPage: {
    user: UserProfileData | null;
  };
  error?: string;
  [key: string]: unknown;
}

class SettingsEditPage extends Block<SettingsEditProps> {
  constructor(props: SettingsEditProps) {
    super({
      ...props,
      id: "profile-edit-form",
      class: "settings-profile",
      infoListClass: "settings-profile__info-list",
      fieldClass: "settings-profile__info-item",
      labelClass: "settings-profile__label",
      actionsClass: "settings-profile__actions",
      buttonLabel: "Сохранить",
      buttonClass: 'form-button', 

      // Формируем данные для блока аватара внутри формы
      formDataUser: SettingsEditPage.mapUserForForm(props.settingsPage?.user),
      fields: SettingsEditPage.createFields(props.settingsPage?.user)
    });

    this.events = {
      submit: this.handleSubmit.bind(this),
      // Ловим всплывающее событие change от инпута, который находится внутри Form
      change: this.handleAvatarChange.bind(this)
    };
  }

  private static mapUserForForm(user: UserProfileData | null | undefined) {
    if (!user) return null;
    return {
      displayName: user.displayName,
      // Превращаем относительный путь Практикума в валидный URL для тега img
      avatar: user.avatar       
      ? `https://ya-praktikum.tech/api/v2/resources/${user.avatar}` 
      : 'https://placeholder.com'
    };
  }

  private static createFields(user: UserProfileData | null | undefined) {
    return [
      { type: "text", id: "first_name", name: "first_name", class: "settings-profile__value", label: "Имя", value: user?.firstName || "", required: true },
      { type: "text", id: "second_name", name: "second_name", class: "settings-profile__value", label: "Фамилия", value: user?.secondName || "", required: true },
      { type: "text", id: "display_name", name: "display_name", class: "settings-profile__value", label: "Имя в чате", value: user?.displayName || "" },
      { type: "email", id: "email", name: "email", class: "settings-profile__value", label: "Почта", value: user?.email || "", required: true },
      { type: "tel", id: "phone", name: "phone", class: "settings-profile__value", label: "Телефон", value: user?.phone || "" },
    ];
  }

  protected componentDidUpdate(oldProps: SettingsEditProps, newProps: SettingsEditProps): boolean {
    if (JSON.stringify(oldProps.settingsPage?.user) !== JSON.stringify(newProps.settingsPage?.user)) {
      
      const formBlock = this.children.find(
        (c) => (c as any).constructor?.componentName === "Form"
      ) as Block<any> | undefined;

      if (formBlock) {
        // Передаем измененные данные прямо в форму. 
        // Базовый класс Block внутри Form вызовет перерендер её шаблона!
        formBlock.setProps({
          fields: SettingsEditPage.createFields(newProps.settingsPage?.user),
          user: SettingsEditPage.mapUserForForm(newProps.settingsPage?.user)
        });
      }
      return true;
    }
    return false;
  }

  // Наш обработчик перехватывает событие из дочерней формы благодаря всплытию (Event Bubbling)
  private async handleAvatarChange(e: Event) {
    const input = e.target as HTMLInputElement;
    
    if (input && input.id === 'avatar-input' && input.files && input.files.length > 0) {
      const formData = new FormData();
      formData.append('avatar', input.files[0]);

      try {
        await UserController.updateAvatar(formData);
      } catch (error) {
        console.error("Ошибка обновления аватара:", error);
        this.setProps({ error: "Не удалось загрузить аватар." });
      }
    }
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const formBlock = this.children.find((c) => (c as any).constructor?.componentName === "Form") as Form | undefined;
    if (!formBlock || !formBlock.validate()) return;

    const profileFormData = formBlock.formData as Record<string, string>;
    const currentUser = this.props.settingsPage?.user;
    if (!currentUser) return;

    const updatedProfile: ProfileUpdateRequest = {
      first_name: profileFormData.first_name,
      second_name: profileFormData.second_name,
      display_name: profileFormData.display_name || '',
      email: profileFormData.email,
      phone: profileFormData.phone || '',
      login: currentUser.login
    };

    try {
      await UserController.updateProfile(updatedProfile);
      router.go("/settings");
    } catch (error) {
      this.setProps({ error: "Не удалось обновить данные профиля." });
    }
  }

  protected template = `
    <main class="main-content">
      <div class="settings-page">
        <aside class="settings-page__sidebar">
          <a href="/settings" class="round-btn settings-page__back-btn router-link">&larr;</a>
        </aside>

        <main class="settings-page__content">
          {{#if error}}
            <div class="settings-profile__error" style="color: red; text-align: center; margin-bottom: 15px;">{{error}}</div>
          {{/if}}
          
          {{{ Form 
              id=id 
              class=class 
              user=formDataUser
              fields=fields 
              infoListClass=infoListClass
              fieldClass=fieldClass
              labelClass=labelClass
              actionsClass=actionsClass
              buttonLabel=buttonLabel 
              buttonClass=buttonClass 
          }}}
        </main>
      </div>
    </main>
  `;
}

export default connect((state) => {
  const user = state.user as any;
  if (!user) return { settingsPage: { user: null } };

  return {
    settingsPage: {
      user: {
        login: user.login ?? '',
        avatar: user.avatar ?? '',
        displayName: user.display_name ?? user.first_name ?? '',
        firstName: user.first_name ?? '',
        secondName: user.second_name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
      }
    }
  };
})(SettingsEditPage);

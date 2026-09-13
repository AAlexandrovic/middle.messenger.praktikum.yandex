import Block from "../../abstracts/Block";
import { Form } from '../../Form';
import Router from "../../services/Router";
import { connect } from "../../api/HOC/connect";
import { type ProfileUpdateRequest} from "../../api/Models/user-api";
import UserController from "../../api/controllers/UserController";

// Создаём экземпляр (синглтон внутри класса вернёт тот же роутер)
const router = new Router(".app");

interface UserProfileData {
  avatar: string;
  login: string;
  firstName: string;
  secondName: string;
  email: string;
  phone: string;
}

interface SettingsEditProps {
  settingsPage: {
    user: UserProfileData;
  };
  [key: string]: unknown;
}

class SettingsEditPage extends Block<SettingsEditProps> {
  constructor(props: SettingsEditProps) {
    const user = props.settingsPage?.user || ({} as UserProfileData);

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

      user: user,

      fields: [
        {
          type: "text",
          id: "first_name",
          name: "first_name",
          class: "settings-profile__value",
          label: "Имя",
          value: user.firstName,
          required: true,
        },
        {
          type: "text",
          id: "second_name",
          name: "second_name",
          class: "settings-profile__value",
          label: "Фамилия",
          value: user.secondName,
          required: true,
        },
        {
          type: "text",
          id: "display_name",
          name: "display_name",
          class: "settings-profile__value",
          label: "Имя в чате",
          value: user.login,
        },
        {
          type: "email",
          id: "email",
          name: "email",
          class: "settings-profile__value",
          label: "Почта",
          value: user.email,
          required: true,
        },
        {
          type: "tel",
          id: "phone",
          name: "phone",
          class: "settings-profile__value",
          label: "Телефон",
          value: user.phone,
        },
      ] 
    });

    this.events = {
      submit: async (e: Event) => {
        e.preventDefault();

        const formBlock = this.children.find(
          (c) => (c as any).constructor?.componentName === "Form"
        ) as Form | undefined;

        if (!formBlock) {
          console.error("Form component not found! Check static componentName.");
          return;
        }

        // Базовая валидация полей (required, формат и т.п.)
        const isValid = formBlock.validate();
        if (!isValid) {
          console.log("Форма содержит ошибки валидации полей.");
          return;
        }

        const profileFormData = formBlock.formData as Record<string, string>;
        
        const updatedProfile: ProfileUpdateRequest = {
          first_name: profileFormData.first_name,
          second_name: profileFormData.second_name,
          display_name: profileFormData.display_name || '',
          email: profileFormData.email,
          phone: profileFormData.phone || '',
          login: profileFormData.display_name, // Login обязателен по спецификации API
        };

        try {
          // Отправляем изменения через контроллер в Flux-поток
          await UserController.updateProfile(updatedProfile);
          
          // Возвращаемся на страницу настроек
          router.go("/settings");
        } catch (error) {
          console.error("Ошибка сохранения профиля:", error);
          this.setProps({
            error: "Не удалось обновить данные профиля.",
          });
        }
      },
    };
  }

  protected template = `
    <main class="main-content">
      <div class="settings-page">
        <aside class="settings-page__sidebar">
          <a href="/settings" class="round-btn settings-page__back-btn router-link">&larr;</a>
        </aside>

        <main class="settings-page__content">
          {{{ Form 
              id=id 
              class=class 
              user=user
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

  if (!user) {
    return {
      settingsPage: { user: null }
    };
  }

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

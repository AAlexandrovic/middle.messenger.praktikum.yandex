import Block from "../../abstracts/Block";
import { Form } from '../../Form';
import { router } from "../../services/Router";

interface UserAvatar {
  avatar: string;
  displayName?: string;
}

interface SettingsPasswordProps {
  settingsPage: {
    user: UserAvatar;
  };
  [key: string]: unknown;
}

export default class SettingsPasswordPage extends Block<SettingsPasswordProps> {
  constructor(props: SettingsPasswordProps) {
    const user = props.settingsPage?.user || ({} as UserAvatar);

    super({
      ...props,
      id: "password-form",
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
          type: "password",
          id: "oldPassword",
          name: "old_password",
          class: "settings-profile__value",
          label: "Старый пароль",
          required: true,
        },
        {
          type: "password",
          id: "newPassword",
          name: "new_password",
          class: "settings-profile__value",
          label: "Новый пароль",
          required: true,
        },
        {
          type: "password",
          id: "repeatPassword",
          name: "repeat_password",
          class: "settings-profile__value",
          label: "Повторите новый пароль",
          required: true,
        },
      ] 
    });

    this.events = {
      submit: (e: Event) => {
        e.preventDefault();

        const formBlock = this.children.find(
          (c) => (c as any).constructor?.componentName === "Form"
        ) as Form | undefined;

        if (!formBlock) {
          console.error("Form component not found! Check static componentName.");
          return;
        }


        // Пока убрал валидацию из формы
        // const isValid = formBlock.validate();
        // if (!isValid) {
        //   console.log("Форма содержит ошибки валидации полей.");
        //   return;
        // }

        // Кросс‑полевая валидация: совпадение новых паролей
        const newPassword = formBlock.formData["new_password"];
        const repeatPassword = formBlock.formData["repeat_password"];

        if (newPassword !== repeatPassword) {
          console.log("Пароли не совпадают.");
          // Тут можно добавить логику показа ошибки в UI, если Form умеет отображать ошибки по полю
          return;
        }

        console.log("Данные смены пароля успешно собраны:", formBlock.formData);
        router.go("/settings");
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

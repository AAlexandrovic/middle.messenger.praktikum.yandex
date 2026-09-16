import Block from "../../abstracts/Block";
import { Form } from '../../Form';
import Router from "../../services/Router";
import UserController from "../../api/controllers/UserController";
import { type PasswordUpdateRequest } from "../../api/Models/user-api";

const router = new Router(".app");

interface SettingsPasswordProps {
  error?: string;
  [key: string]: unknown;
}

export default class SettingsPasswordPage extends Block<SettingsPasswordProps> {
  constructor(props: SettingsPasswordProps) {
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

      user: null, 

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
      submit: async (e: Event) => {
        e.preventDefault();

        const formBlock = this.children.find(
          (c) => (c as any).props?.id === "password-form" || (c as any).constructor?.componentName === "Form"
        ) as Form | undefined;

        if (!formBlock) {
          console.error("Form component not found!");
          return;
        }

        const oldPassword = formBlock.formData["old_password"];
        const newPassword = formBlock.formData["new_password"];
        const repeatPassword = formBlock.formData["repeat_password"];

        if (newPassword !== repeatPassword) {
          this.setProps({ error: "Новые пароли не совпадают." });
          return;
        }

        const passwordData: PasswordUpdateRequest = {
          oldPassword,
          newPassword,
        };

        try {
          this.setProps({ error: undefined  });
          await UserController.updatePassword(passwordData);
          router.go("/settings");
        } catch (error) {
          console.error("Ошибка смены пароля в компоненте:", error);
          this.setProps({
            error: "Не удалось изменить пароль. Убедитесь, что старый пароль введен верно.",
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
          {{#if error}}
            <div class="settings-profile__error">{{error}}</div>
          {{/if}}

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

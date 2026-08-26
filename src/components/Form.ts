import Block from '../components/abstracts/Block';
import { Input } from './Input';

interface FormFieldConfig {
  type: string;
  id: string;
  name: string;
  class: string;
  label: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
}

export interface FormProps {
  id: string;
  class?: string;
  fields: FormFieldConfig[];
  buttonLabel: string;
  buttonClass?: string;
  user?: { avatar: string; displayName: string };
  fieldClass?: string;
  labelClass?: string;
  infoListClass?: string;
  [key: string]: unknown;
}

export class Form extends Block<FormProps> {
  static componentName = 'Form'; 

  constructor(props: FormProps) {
    super(props);
  }

  public validate(): boolean {
    const inputs = this.element()?.querySelectorAll('input[name]') as NodeListOf<HTMLInputElement>;
    if (!inputs) return true;

    let allValid = true;
    inputs.forEach((input) => {
      const block = this.children.find(
        (c) => (c as any).props?.id === input.id
      ) as Input | undefined;

      if (block && typeof block.handleValidate === 'function') {
        const isValid = block.handleValidate(input.value);
        if (!isValid) allValid = false;
      }
    });

    return allValid;
  }

  public get formData(): Record<string, string> {
    const data: Record<string, string> = {};
    const inputs = this.element()?.querySelectorAll('input[name]') as NodeListOf<HTMLInputElement> | undefined;
    inputs?.forEach((i) => (data[i.name] = i.value));
    return data;
  }

  //Также добавил отображение минимального инпута решение не самое лучшее но вроде дальше он расширяться не должен
  protected template = `
   <form id="{{id}}" class="{{class}}">
    {{#if user}}
      <div class="settings-profile__avatar-container">
        <label for="avatar-input" class="settings-profile__avatar-label" title="Поменять аватар">
          <img src="{{user.avatar}}" alt="Аватар пользователя" class="settings-profile__avatar">
          <input type="file" id="avatar-input" name="avatar" accept="image/*" class="visual-hidden">
        </label>
        <h1 class="settings-profile__title">{{user.displayName}}</h1>
      </div>
    {{/if}}

    {{#if infoListClass}}<div class="{{infoListClass}}">{{/if}}
      {{#each fields}}
        {{#unless this.minimalInput}}
          <!-- Обычный режим: рисуем обёртку + label + Input -->
          <div class="{{#if ../fieldClass}}{{../fieldClass}}{{else}}form-field{{/if}}">
            <label for="{{this.id}}" class="{{#if ../labelClass}}{{../labelClass}}{{else}}form-field__label{{/if}}">
              {{this.label}}
            </label>
            {{{ Input
                type=this.type
                id=this.id
                name=this.name
                class=this.class
                value=this.value
                placeholder=this.placeholder
                required=this.required
                minimal=false
            }}}
          </div>
        {{else}}
          <!-- Минимальный режим для чата: только Input -->
          {{{ Input
              type=this.type
              id=this.id
              name=this.name
              class=this.class
              value=this.value
              placeholder=this.placeholder
              required=this.required
              minimal=true
          }}}
        {{/unless}}
      {{/each}}
    {{#if infoListClass}}</div>{{/if}}

    {{{ Button
        type="submit"
        class=this.buttonClass
        label=this.buttonLabel
    }}}
  </form>
  `;
}

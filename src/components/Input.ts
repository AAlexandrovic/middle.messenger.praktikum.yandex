/* import Block from './abstracts/Block'; 
import { validateField } from '../components/services/Validation';

class Input extends Block {
  static componentName = "Input";

  constructor(props: any) {
    super({
      ...props,
      error: "", 
      events: {
        blur: (e: Event) => {
          const target = e.target as HTMLInputElement;
          this.handleValidate(target?.value || "");
        }
      }
    });
  }

  public handleValidate(inputValue?: string): boolean {
    let value = inputValue;
    if (value === undefined) {
      const inputEl = this.element()?.querySelector('input') || this.element() as HTMLInputElement;
      value = inputEl?.value || "";
    }
                    
    let error = "";
    const name = this.props.name as string;

    //Проверка совпадения пароля
    if (name === "repeat_password") {
      const formEl = this.element()?.closest('form');
      const passwordInput = formEl?.querySelector('input[name="password"]') as HTMLInputElement;
      const originalPassword = passwordInput?.value || "";
      
      if (!value) error = "Поле не должно быть пустым";
      else if (value !== originalPassword) error = "Пароли не совпадают";
    } else {
      error = validateField(name, value);
    }
    
    // Выводим ошибку через setProps если она есть
    this.setProps({ error, value }); 
    
    //Если ошибки нет сообщаем это форме
    return !error;
  }

  protected template = `
   <div class="form-field__container">
      {{#if label}}
        <label for="{{id}}">{{label}}</label>
      {{/if}}
      <input 
        type="{{type}}" 
        id="{{id}}" 
        name="{{name}}"
        class="{{class}}"
        value="{{value}}"
        placeholder="{{placeholder}}"
        {{#if required}}required{{/if}}>
      
      {{#if error}}
        <span class="form-field__error-text">{{error}}</span>
      {{/if}}
    </div>
  `;
}

export default Input;

 */

import Block from '../components/abstracts/Block';
import { validateField } from '../components/services/Validation';

export interface InputProps {
  type: string;
  id: string;
  name: string;
  class: string;
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  minimal?: boolean;
  [key: string]: unknown;
}

export class Input extends Block<InputProps> {
  static componentName = 'Input';

  constructor(props: InputProps) {
    super({
      ...props,
      error: props.error ?? '',
      value: props.value ?? '',
    });

  }

  //  метод для привязки событий
  protected bindEvents(): void {
    const inputEl = this.element()?.querySelector('input') as HTMLInputElement | null;
    if (!inputEl) return;

    // Сбрасываем старые слушатели, если компонент переиспользуется (опционально)
    inputEl.removeEventListener('blur', this.onBlur.bind(this));
    inputEl.addEventListener('blur', this.onBlur.bind(this));
  }

  private onBlur(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.handleValidate(target.value ?? '');
  }

  public handleValidate(value = ''): boolean {

    let error = '';
    const name = this.props.name;

    if (name === 'repeat_password') {
      const form = this.element()?.closest('form');
      const pwdEl = form?.querySelector<HTMLInputElement>('input[name="password"]');
      const originalPassword = pwdEl?.value ?? '';

      if (!value) {
        error = 'Поле не должно быть пустым';
      } else if (value !== originalPassword) {
        error = 'Пароли не совпадают';
      }
    } else {
      if (typeof validateField !== 'function') {
        console.error('[Input] validateField is undefined');
        return true; // fallback
      }
      error = validateField(name, value);
    }

    this.setProps({ error, value });
    return !error;
  }

  //Похрошему нужно создать отдельный форм и инпут для чата , но сделал так чтобы сэкономить время тем более он особо не будет дальше расширяться
  protected template = `
    {{#unless minimal}}
      <div class="form-field__container">
        {{#if label}}
          <label for="{{id}}" class="{{#if ../labelClass}}{{../labelClass}}{{else}}form-field__label{{/if}}">{{label}}</label>
        {{/if}}

        <input
          type="{{type}}"
          id="{{id}}"
          name="{{name}}"
          class="{{class}}"
          value="{{value}}"
          placeholder="{{placeholder}}"
          {{#if required}}required{{/if}}>

        {{#if error}}
          <span class="form-field__error-text">{{error}}</span>
        {{/if}}
      </div>
    {{else}}
      <!-- Минимальный режим: только input, без обёртки и label -->
      <input
        type="{{type}}"
        id="{{id}}"
        name="{{name}}"
        class="{{class}}"
        value="{{value}}"
        placeholder="{{#if error}}{{error}}{{else}}{{placeholder}}{{/if}}"
        {{#if required}}required{{/if}}>
    {{/unless}}
  `;

  // Переопределяем render: после вставки в DOM привязываем события
  public render(): this {
    // Сначала рендерим шаблон (вставляет HTML в this.domElement)
    super.render();

    // Теперь элемент гарантированно существует — можно вешать слушатели
    this.bindEvents();

    return this;
  }
}

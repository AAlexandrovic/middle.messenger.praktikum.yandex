import Block from './abstracts/Block'; 

class Button extends Block {
  static componentName = "Button";

  // Добавляем класс и тип из пропсов
  protected template = `
    <button type="{{type}}" class="{{class}}">{{label}}</button>
  `;
}

export default Button;

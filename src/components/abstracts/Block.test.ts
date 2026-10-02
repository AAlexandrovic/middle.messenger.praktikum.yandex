import Block, { type BlockOwnProps } from './Block';

// Создаем простой тестовый компонент
interface TestProps extends BlockOwnProps {
  text: string;
}

class TestComponent extends Block<TestProps> {
  protected template = '<div>{{text}}</div>';
}

describe('Компонент Block', () => {
  it('Должен корректно рендерить переданный текст из пропсов', () => {
    const component = new TestComponent({ text: 'Hello World' });
    const element = component.element();

    expect(element?.textContent).toBe('Hello World');
  });

  it('Должен реактивно обновлять DOM при вызове setProps', () => {
    const component = new TestComponent({ text: 'First Text' });
    
    // Вызываем метод обновления пропсов
    component.setProps({ text: 'New Text' });
    const element = component.element();

    expect(element?.textContent).toBe('New Text');
  });
});

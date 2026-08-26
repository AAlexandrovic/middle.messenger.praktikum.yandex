import Handlebars from "handlebars";

type EventListType = Record<string, (e: Event) => void>;

type ChildComponent = Block<BlockOwnProps>;

//Добавил возможность расширения генерика чтобы передавать разные классы
export interface BlockOwnProps extends Object {
    [key: string]: unknown;
  __children?: Array<{
    //component: Block<object>;
    component: ChildComponent;
    embed(node: DocumentFragment): void;
  }>;
  __refs?: Record<string, Element>;
}

export default abstract class Block<
  Props extends BlockOwnProps = BlockOwnProps,
> {
  protected abstract template: string;

  protected props = {} as Props;

  protected refs: Record<string, Element> = {};

  private domElement: Element | null = null;

  //Теперь можно делать this.events[eventName] без ошибки тайпскрипта
  protected events: EventListType = {};

  // изменил на public, чтобы страницы могли читать children
  public children: Block<BlockOwnProps>[] = [];

  constructor(props: Props = {} as Props) {
    this.props = props;
  }

  public element(): Element | null {
    if (!this.domElement) {
      this.render();
    }

    return this.domElement;
  }

  /** Метод для переопределения в классе-наследнике */
  protected componentDidMount() {
    /** В базовом классе здесь ничего нет */
  }

  /** Метод для общей mount-логики и вызова componentDidMount */
  private mountComponent() {
    /** Здесь можно будет реализовать общую для всех компонентов логику */
    this.attachListeners();
    /** Вызов метода, который мог быть переопределён в классе-наследнике */
    this.componentDidMount();
  }

  /** Метод для переопределения в классе-наследнике */
  protected componentWillUnmount() {
    /** В базовом классе здесь ничего нет */
  }

  /** Метод для общей unmount-логики и вызова componentWillUnmount */
  private unmountComponent() {
    /** Проверка наличия элемента, нужно для первого рендера */
    if (this.domElement) {
      /** Вызываем очистку в порядке, обратном созданию */
      this.children.reverse().forEach((child) => child.unmountComponent());
      /** Вызов метода, который мог быть переопределён в классе-наследнике */
      this.componentWillUnmount();
      this.removeListeners();
      /** Здесь можно будет реализовать общую для всех компонентов логику */
    }
  }

  private attachListeners() {
    for (const eventName in this.events) {
      const eventCallback = this.events[eventName];
      if (typeof eventCallback === "function" && this.domElement) {
        this.domElement.addEventListener(eventName, eventCallback);
      }
    }
  }

  private removeListeners() {
    for (const eventName in this.events) {
      const eventCallback = this.events[eventName];
      if (typeof eventCallback === "function" && this.domElement) {
        this.domElement.removeEventListener(eventName, eventCallback);
      }
    }
  }

  protected render() {
    this.unmountComponent();
    const fragment = this.compile();

    if (this.domElement && fragment) {
      this.domElement.replaceWith(fragment);
    }

    this.domElement = fragment;
    this.mountComponent();
  }

  private compile(): Element | null {
    const html = Handlebars.compile(this.template)(this.props);
    const templateElement = document.createElement("template");

    templateElement.innerHTML = html;

    const fragment = templateElement.content;

    if (this.props.__children) {
      /** Сохраняем все дочерние компоненты */
      this.children = this.props.__children.map((child) => child.component);

      /** Для каждого элемента массива вызываем метод embed, который заменит заглушку на соответствующий дочерний компонент */
      this.props.__children.forEach((child) => {
        child.embed(fragment);
      });
    }

    const defaultRefs = this.props?.__refs ?? {};
    this.refs = Array.from(fragment.querySelectorAll("[ref]")).reduce(
      (list, element) => {
        const key = element.getAttribute("ref") as string;
        list[key] = element as HTMLElement;
        element.removeAttribute("ref");
        return list;
      },
      defaultRefs,
    );

    return templateElement.content.firstElementChild;
  }

  // метод для обновления свойств компонента
  public setProps(props: Partial<Props>) {
    /** Мёржим обновляемые свойства */
    this.props = { ...this.props, ...props, __children: [], __refs: {} };
    /** Вызываем метод render, обновляя представление в DOM-дереве */
    this.render();
  }
}

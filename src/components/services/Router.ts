import Block from "../abstracts/Block";

type BlockConstructor = new () => Block<any>;

//Сгенерировал роутер для компонентов с помощью ИИ
class Router {
  private routes: Record<string, BlockConstructor> = {};
  private rootElement: Element | null = null;
  //private currentComponent: Block<any> | null = null;

  // Указываем, куда именно рендерить компоненты (например, document.body)
  public init(rootElement: Element) {
    this.rootElement = rootElement;
    
    // Слушаем кнопки браузера "Назад" / "Вперед"
    window.addEventListener("popstate", () => {
      this.renderPage(window.location.pathname);
    });

    // Первый рендер при загрузке страницы
    this.renderPage(window.location.pathname);
  }

  // Регистрируем маршруты (связываем путь и класс компонента)
  public use(path: string, component: BlockConstructor) {
    this.routes[path] = component;
    return this; // Для цепочки вызовов .use().use()
  }

  // Метод для программного перехода (после submit или клика)
  public go(path: string) {
    window.history.pushState({}, "", path);
    this.renderPage(path);
  }

  // Логика смены компонентов
  private renderPage(path: string) {
    if (!this.rootElement) return;

    // Ищем компонент. Если не найден — можно отдавать компонент 404 ошибки
    const ComponentClass = this.routes[path] || this.routes["/404"];
    if (!ComponentClass) return;

    // Очищаем старый компонент (вызовется unmountComponent внутри)
    this.rootElement.innerHTML = "";
    //this.currentComponent = null;

    // Создаем новый экземпляр страницы
    const page = new ComponentClass();
    const element = page.element();

    if (element) {
      this.rootElement.appendChild(element);
      //this.currentComponent = page;
    }
  }
}

// Экспортируем синглтон, чтобы использовать один и тот же роутер везде
export const router = new Router();

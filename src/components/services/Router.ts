import Block from "../abstracts/Block";

type BlockConstructor = new (...args: any[]) => Block<any>;

// Вспомогательная функция для очистки пути от query-параметров
function getCleanPath(pathname: string): string {
  return pathname.split('?')[0];
}

// Вспомогательная функция для парсинга query-строки в объект
function parseQueryParams(pathname: string): Record<string, string> {
  const queryParams: Record<string, string> = {};
  const queryString = pathname.split('?')[1];
  
  if (queryString) {
    const pairs = queryString.split('&');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key) {
        queryParams[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    });
  }
  
  return queryParams;
}

class Route {
  private _pathname: string;
  private _blockClass: BlockConstructor;
  private _block: Block<any> | null = null;
  private _props: { rootQuery: string };

  constructor(pathname: string, view: BlockConstructor, props: { rootQuery: string }) {
    this._pathname = pathname;
    this._blockClass = view;
    this._props = props;
  }


  navigate(pathname: string, queryParams: Record<string, string> = {}): void {
    if (this.match(pathname)) {
      this._pathname = pathname;
      this.render(queryParams);
    }
  }

  leave(): void {
    if (this._block) {
      this._block.hide();
    }
  }

  match(pathname: string): boolean {
    return getCleanPath(pathname) === getCleanPath(this._pathname);
  }

  // Передаем спарсенные query-параметры как пропсы при рендере/обновлении компонента
  private render(queryParams: Record<string, string>): void {
    if (!this._block) {
      // Передаем queryParams в конструктор блока при первом создании
      this._block = new this._blockClass({ queryParams });

      const root = document.querySelector(this._props.rootQuery);
      const element = this._block.element();

      if (root && element) {
        root.appendChild(element);
      }
      return;
    }

    // Если блок уже создан, обновляем его пропсы новыми query-параметрами
    this._block.setProps({ queryParams });
    this._block.show();
  }
}

class Router {
  private static __instance: Router | null = null;

  private _routes: Route[] = [];
  private _history: History = window.history;
  private _currentRoute: Route | null = null;
  private _rootQuery!: string;

  constructor(rootQuery: string) {
    if (Router.__instance) {
      return Router.__instance;
    }

    this._rootQuery = rootQuery;
    Router.__instance = this;
  }

  use(pathname: string, block: BlockConstructor): this {
    const route = new Route(pathname, block, { rootQuery: this._rootQuery });
    this._routes.push(route);
    return this;
  }

  start(): void {
    this._onRoute(window.location.pathname + window.location.search);

    window.onpopstate = () => {
      this._onRoute(window.location.pathname + window.location.search);
    };
  }

  private _onRoute(pathname: string): void {
    const route = this.getRoute(pathname);

    if (route) {
      if (this._currentRoute && this._currentRoute !== route) {
        this._currentRoute.leave();
      }

      // Парсим query-параметры из переданного пути 
      const queryParams = parseQueryParams(pathname);

      this._currentRoute = route;
      // Передаем параметры в метод navigate
      this._currentRoute.navigate(pathname, queryParams);
    }
  }

  go(pathname: string): void {
    this._history.pushState({}, "", pathname);
    this._onRoute(pathname);
  }

  back(): void {
    this._history.back();
  }

  forward(): void {
    this._history.forward();
  }

  getRoute(pathname: string): Route | undefined {
    return this._routes.find((route) => route.match(pathname));
  }
}

export default Router;

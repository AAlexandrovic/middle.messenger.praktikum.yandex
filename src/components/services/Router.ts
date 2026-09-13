import Block from "../abstracts/Block";

type BlockConstructor = new (...args: any[]) => Block<any>;

function isEqual(lhs: string, rhs: string): boolean {
  return lhs === rhs;
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

  navigate(pathname: string): void {
    if (this.match(pathname)) {
      this._pathname = pathname;
      this.render();
    }
  }

  leave(): void {
    if (this._block) {
      this._block.hide();
    }
  }

  match(pathname: string): boolean {
    return isEqual(pathname, this._pathname);
  }

  private render(): void {
    if (!this._block) {
      this._block = new this._blockClass();

      const root = document.querySelector(this._props.rootQuery);
      const element = this._block.element();

      if (root && element) {
        root.appendChild(element);
      }
      return;
    }

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
    this._onRoute(window.location.pathname);

    window.onpopstate = () => {
      this._onRoute(window.location.pathname);
    };
  }

  private _onRoute(pathname: string): void {
    const route = this.getRoute(pathname);

    if (route) {
      if (this._currentRoute && this._currentRoute !== route) {
        this._currentRoute.leave();
      }

      this._currentRoute = route;
      this._currentRoute.navigate(pathname);
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

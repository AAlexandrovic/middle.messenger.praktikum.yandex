import { vi } from 'vitest';
import Router from '../../services/Router';
import { Form } from '../../Form';
import { Input } from '../../Input';
import { registerComponent } from '../../abstracts/RegistrComponent';
import Block from '../../abstracts/Block';

type BlockConstructor = new (...args: any[]) => Block<any>;

/**
 * Универсальная фабрика для тестирования UI-страниц с формами
 * @param ComponentClass - Класс тестируемого компонента (например, AuthForm или RegisterForm)
 * @param routePath - Временный роут для регистрации в тестовом Роутере
 */
export function createFormPageTest(ComponentClass: BlockConstructor, routePath: string) {
  // 1. Очищаем DOM и готовим корневой контейнер
  document.body.innerHTML = '<div class="app"></div>';
  const root = document.querySelector('.app');

  // 2. Сбрасываем синглтон роутера перед каждым тестом
  (Router as any).__instance = null;
  const router = new Router('.app');
  router.use(routePath, ComponentClass);

  // 3. Регистрируем дочерние компоненты Handlebars
  try { registerComponent(Form); } catch (e) {}
  try { registerComponent(Input); } catch (e) {}

  // 4. Глобальный шпион за методом переходов на уровне прототипа
  const routerGoSpy = vi.spyOn(Router.prototype, 'go').mockImplementation(() => {});

  // 5. Инициализируем инстанс переданной страницы (передаем пустой объект props {})
  const formPageInstance = new ComponentClass({});

  // 6. Принудительно компилируем Handlebars-шаблон и монтируем узел в живой DOM jsdom
  (formPageInstance as any).render();
  const element = formPageInstance.element();
  if (root && element) {
    root.appendChild(element);
  }

  return {
    formPageInstance,
    router,
    routerGoSpy,
    element,
  };
}
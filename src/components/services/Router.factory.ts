//import { vi } from 'vitest';
import Router from './Router';
import Block from '../abstracts/Block';

/**
 * Вспомогательный фабричный метод для создания чистого экземпляра Роутера
 */
export function createTestRouter(rootQuery = '.app') {
  // 1. Очищаем и создаем корневой элемент в DOM под каждый тест
  document.body.innerHTML = `<div class="${rootQuery.replace('.', '')}"></div>`;

  // 2. Хак для сброса паттерна Синглтон перед каждым тестом, 
  // чтобы тесты были абсолютно изолированными
  (Router as any).__instance = null;

  // 3. Создаем инстанс Роутера
  const router = new Router(rootQuery);

  // 4. Создаем простейшие фейковые компоненты для проверки переходов
  class HomeBlock extends Block<any> {
    protected template = '<div id="home-view">Главная</div>';
  }

  class LoginBlock extends Block<any> {
    protected template = '<div id="login-view">Вход</div>';
  }

  return {
    router,
    HomeBlock,
    LoginBlock,
    rootElement: document.querySelector(rootQuery),
  };
}

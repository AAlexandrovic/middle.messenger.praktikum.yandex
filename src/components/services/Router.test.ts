import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestRouter } from './Router.factory';

describe('Сервис Router (spa-навигация)', () => {

  beforeEach(() => {
    // Начинаем каждый тест с чистой адресной строки браузера
    window.history.pushState({}, '', '/');
  });

  it('Должен успешно регистрировать новые страницы через метод use()', () => {
    const { router, HomeBlock } = createTestRouter();

    router.use('/', HomeBlock);

    // Проверяем, существует ли внутренний роут для этого пути
    expect(router.getRoute('/')).toBeDefined();
    expect(router.getRoute('/non-existent')).toBeUndefined();
  });

  it('Должен рендерить соответствующий компонент в DOM при вызове go()', () => {
    const { router, HomeBlock, LoginBlock } = createTestRouter();

    router
      .use('/', HomeBlock)
      .use('/login', LoginBlock);

    // Инициализируем стартовую точку
    router.start();

    // Переходим на страницу логина без перезагрузки вкладки
    router.go('/login');

    // Проверяем, что адресная строка изменилась
    expect(window.location.pathname).toBe('/login');

    // Проверяем, что в DOM-дереве отрендерился элемент именно страницы логина
    const loginView = document.getElementById('login-view');
    expect(loginView).toBeTruthy();
    expect(loginView?.textContent).toBe('Вход');
  });

  it('Должен правильно парсить и передавать query-параметры в пропсы компонента', () => {
    const { router, LoginBlock } = createTestRouter();

    router.use('/login', LoginBlock);
    router.start();

    // Переходим по роуту, содержащему query-параметры
    router.go('/login?title=Андрей&id=123');

    // Находим зарегистрированный роут и заглядываем в его скрытый инстанс компонента
    const routeInstance = router.getRoute('/login') as any;
    const blockInstance = routeInstance._block;

    // Проверяем, что вспомогательная функция внутри Роутера успешно разобрала строку в объект props
    expect(blockInstance.props.queryParams).toEqual({
      title: 'Андрей',
      id: '123'
    });
  });

  it('Должен корректно скрывать предыдущую страницу при переходе на новую (вызов leave)', () => {
    const { router, HomeBlock, LoginBlock } = createTestRouter();

    router
      .use('/', HomeBlock)
      .use('/login', LoginBlock);

    router.start();
    
    // Переходим на главную, а затем на логин
    router.go('/');
    router.go('/login');

    const routeHome = router.getRoute('/') as any;
    const homeBlockInstance = routeHome._block;

    // Проверяем работу метода leave(): старый компонент должен получить стиль display="none"
    expect(homeBlockInstance.element().style.display).toBe('none');
  });

  it('Должен осуществлять навигацию по истории через метод back()', () => {
    const { router, HomeBlock, LoginBlock } = createTestRouter();

    router
      .use('/', HomeBlock)
      .use('/login', LoginBlock);

    router.start();
    router.go('/login');

    // Шпионим за нативным методом истории браузера
    const historyBackSpy = vi.spyOn(window.history, 'back');

    router.back();

    // Тест проверяет, что обёртка роутера корректно дёргает нативные методы навигации истории
    expect(historyBackSpy).toHaveBeenCalled();
    
    historyBackSpy.mockRestore();
  });
});

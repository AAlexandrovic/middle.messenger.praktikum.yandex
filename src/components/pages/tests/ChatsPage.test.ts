import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatsPage from '../ChatsPage';
import { createFormPageTest } from './FormPage.factory';
import ChatsController from '../../api/controllers/ChatsController';
import store from '../../api/store';
import { RESOURCES_URL } from '../../api/config';

describe('Компонент ChatsPage UI и Интеграция c контроллером', () => {

  // Cтруктура данных глобального состояния Стора
  const fakeStateData = {
    user: {
      id: 777,
      first_name: 'Андрей',
      avatar: '/user-pic.jpg'
    },
    activeChatId: 137,
    chats: [
      {
        id: 137,
        title: 'Флудилка',
        unread_count: 5,
        last_message: { content: 'Привет, как дела?', time: '2026-10-02T12:00:00.000Z' },
        avatar: '/chat-pic.jpg'
      },
      {
        id: 200,
        title: 'Рабочий чат',
        unread_count: 0,
        last_message: null,
        avatar: null
      }
    ],
    messages: [
      { id: 1, content: 'Первое сообщение', time: '2026-10-02T12:01:00.000Z', user_id: 888 },
      { id: 2, content: 'Мой ответ', time: '2026-10-02T12:02:00.000Z', user_id: 777 }
    ]
  };

  beforeEach(() => {
    // Сбрасываем все шпионы перед каждым тестом
    vi.restoreAllMocks();
    
    // Безопасно вычищаем Store
    if (store && typeof (store as unknown as { clear: () => void }).clear === 'function') {
      (store as unknown as { clear: () => void }).clear();
    }
    
    // Заглушаем глобальные модальные окна браузера, чтобы они не вешали jsdom поток
    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal('prompt', vi.fn());
    vi.stubGlobal('confirm', vi.fn());
  });

  it('Должен корректно отрисовывать структуру страницы, список чатов и активную комнату', () => {
    store.setState('user', fakeStateData.user);
    store.setState('chats', fakeStateData.chats);
    store.setState('activeChatId', fakeStateData.activeChatId);

    const { element } = createFormPageTest(ChatsPage as any, '/chats');

    // Проверяем рендер профиля текущего пользователя
    const userName = element?.querySelector('.user-avatar__name');
    const userImg = element?.querySelector('.user-avatar__img') as HTMLImageElement;
    expect(userName?.textContent).toBe('Андрей');
    expect(userImg?.src).toBe(`${RESOURCES_URL}/user-pic.jpg`);

    // Проверяем наличие комнат в сайдбаре
    const chatItems = element?.querySelectorAll('.chats-list__item');
    expect(chatItems?.length).toBe(2);

    // Проверяем, что заголовок активного окна соответствует выбранному chatId
    const activeChatTitle = element?.querySelector('.chat-window__title');
    expect(activeChatTitle?.textContent).toBe('Флудилка');
  });

  it('Должен совершать переход в Роутере при выборе другого чата в сайдбаре', () => {
    store.setState('user', fakeStateData.user);
    store.setState('chats', fakeStateData.chats);
    
    const { element, formPageInstance, routerGoSpy } = createFormPageTest(ChatsPage as any, '/chats');
    (formPageInstance as any).componentDidMount();

    const targetChatItem = element?.querySelector('.chats-list__item[data-title="Рабочий чат"]') as HTMLElement;
    expect(targetChatItem).toBeTruthy();

    // Симулируем клик, который каскадно перехватит метод closest('.chats-list__item')
    targetChatItem.click();

    // Проверяем вызов Роутера со сшитыми query-параметрами названия
    expect(routerGoSpy).toHaveBeenCalledWith('/chats?title=%D0%A0%D0%B0%D0%B1%D0%BE%D1%87%D0%B8%D0%B9%20%D1%87%D0%B0%D1%82');
  });

  it('Должен отправлять набранный текст сообщения в ChatsController при сабмите формы', async () => {
    store.setState('user', fakeStateData.user);
    store.setState('chats', fakeStateData.chats);
    store.setState('activeChatId', fakeStateData.activeChatId);

    const { element, formPageInstance } = createFormPageTest(ChatsPage as any, '/chats');

    const sendMessageSpy = vi.spyOn(ChatsController, 'sendMessage').mockImplementation(() => {});

    const inputEl = element?.querySelector('input[name="message"]') as HTMLInputElement;
    if (inputEl) {
      inputEl.value = 'Привет из автоматического теста!';
    }

    // Подкладываем id и компонент дочерней формы для успешного прохождения метода find() в ChatsPage
    const formBlock = formPageInstance.children.find((c: any) => c.element()?.id === 'chat-message-form') as any;
    if (formBlock) {
      formBlock.props = { ...formBlock.props, id: 'chat-message-form' };
      formBlock.validate = () => true;
    }

    const formEl = element?.querySelector('#chat-message-form');
    formEl?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Декларативно ожидаем срабатывания триггера и очистки строки ввода
    await vi.waitFor(() => {
      expect(sendMessageSpy).toHaveBeenCalledWith('Привет из автоматического теста!');
      expect(inputEl.value).toBe('');
    }, { timeout: 1000, interval: 5 });
  });

  it('Должен открывать prompt и передавать login в ChatsController при добавлении пользователя', async () => {
    store.setState('user', fakeStateData.user);
    store.setState('chats', fakeStateData.chats);
    store.setState('activeChatId', fakeStateData.activeChatId);

    const { element, formPageInstance } = createFormPageTest(ChatsPage as any, '/chats');
    (formPageInstance as any).componentDidMount();

    const addUsersSpy = vi.spyOn(ChatsController, 'searchAndAddUserToChat').mockResolvedValue(true);
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('new_user_login');

    const addUserBtn = element?.querySelector('.chat-window__add-user-btn') as HTMLElement;
    expect(addUserBtn).toBeTruthy();
    addUserBtn.click();

    await vi.waitFor(() => {
      expect(promptSpy).toHaveBeenCalled();
      expect(addUsersSpy).toHaveBeenCalledWith('new_user_login', 137);
    }, { timeout: 1000, interval: 5 });
  });

  it('Должен запрашивать удаление участника из чата при нажатии на кнопку удаления пользователя', async () => {
    store.setState('user', fakeStateData.user);
    store.setState('chats', fakeStateData.chats);
    store.setState('activeChatId', fakeStateData.activeChatId);

    const { element, formPageInstance } = createFormPageTest(ChatsPage as any, '/chats');
    (formPageInstance as any).componentDidMount();

    const deleteUserSpy = vi.spyOn(ChatsController, 'searchAndDeleteUserFromChat').mockResolvedValue(true);

    const deleteUserBtn = element?.querySelector('.chat-window__delete-user-btn') as HTMLElement;
    expect(deleteUserBtn).toBeTruthy();
    deleteUserBtn.click();

    await vi.waitFor(() => {
      expect(deleteUserSpy).toHaveBeenCalledWith(137);
    }, { timeout: 1000, interval: 5 });
  });

  it('Должен запрашивать удаление чата в контроллере и перенаправлять в корень при клике на удаление чата', async () => {
    store.setState('user', fakeStateData.user);
    store.setState('chats', fakeStateData.chats);
    store.setState('activeChatId', fakeStateData.activeChatId);

    const { element, formPageInstance, routerGoSpy } = createFormPageTest(ChatsPage as any, '/chats');
    (formPageInstance as any).componentDidMount();

    const deleteChatSpy = vi.spyOn(ChatsController, 'deleteChat').mockResolvedValue(undefined);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const deleteChatBtn = element?.querySelector('.chat-window__delete-chat-btn') as HTMLElement;
    expect(deleteChatBtn).toBeTruthy();
    deleteChatBtn.click();

    await vi.waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(deleteChatSpy).toHaveBeenCalledWith(137);
      expect(routerGoSpy).toHaveBeenCalledWith('/chats');
    }, { timeout: 1000, interval: 5 });
  });

  it('Должен отправлять заполненный FormData в ChatsController при успешном выборе файла аватара чата', async () => {
    store.setState('user', fakeStateData.user);
    store.setState('chats', fakeStateData.chats);
    store.setState('activeChatId', fakeStateData.activeChatId);

    const { element } = createFormPageTest(ChatsPage as any, '/chats');

    const updateChatAvatarSpy = vi.spyOn(ChatsController, 'updateChatAvatar').mockResolvedValue(undefined);

    const avatarInput = element?.querySelector('#chat-avatar-input') as HTMLInputElement;
    expect(avatarInput).toBeTruthy();

    // Имитируем ручную загрузку картинки пользователем в jsdom через File API
    const fakeFile = new File([''], 'chat-icon.png', { type: 'image/png' });
    Object.defineProperty(avatarInput, 'files', {
      value: [fakeFile],
      configurable: true
    });

    // Триггерим событие изменения нативного инпута
    avatarInput.dispatchEvent(new Event('change', { bubbles: true }));

  await vi.waitFor(() => {
      expect(updateChatAvatarSpy).toHaveBeenCalled();
      
      // Извлекаем первый аргумент первого вызова из двумерного массива calls
      const calledFormData = updateChatAvatarSpy.mock.calls[0][0] as unknown as FormData;
      
      // проверяем объект
      expect(calledFormData instanceof FormData).toBe(true);
      
      // Сверяем ключи FormData со спецификацией API Яндекса
      expect(calledFormData.get('chatId')).toBe('137');
      expect(calledFormData.get('avatar')).toEqual(fakeFile);
      
      // Проверяем, что блок finally сбросил значение инпута в пустую строку
      expect(avatarInput.value).toBe('');
    }, { timeout: 1000, interval: 5 });
  });
});

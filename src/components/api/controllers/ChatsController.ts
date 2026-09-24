import ChatsAPI from '../Models/chats-api';
import UserAPI from '../Models/user-api';
import store from '../store';
import { WS_BASE_URL } from '../config';

class ChatsController {
   private _activeSocket: WebSocket | null = null;

  public async fetchChats(forceUpdate: boolean = false): Promise<void> {
    //Костыль для остановки лишних перерендеров
    const currentChats = store.getState().chats as any[] || [];

    if (currentChats.length > 0 && !forceUpdate) {
      return;
    }

    try {
      const chats = await ChatsAPI.getChats();
      store.setState('chats', chats);
     // console.log(chats);
    } catch (error) {
      console.error('Ошибка fetchChats:', error);
    }
  }

  public async selectChatByTitle(title: string): Promise<void> {
   // Защита от пустых вызовов
  if (!title || title.trim() === '') return;

  try {
      const currentState = store.getState();
      const currentActiveId = currentState.activeChatId as number | null;
      const loadedChats = currentState.chats as any[] || [];

      // Костыль от дублированных запросов
      const currentActiveChat = loadedChats.find(chat => chat.id === currentActiveId);

      //Проверяем на дубли запрос
      if (currentActiveChat && currentActiveChat.title === title) {
        return;
      }

           // 1. ЗАЩИТА: Если этот чат уже открыт И сокет находится в рабочем состоянии, 
      // просто выходим, чтобы не пересоздавать подключение при каждом обновлении пропсов
      if (
        currentActiveChat && 
        currentActiveChat.title === title && 
        this._activeSocket && 
        (this._activeSocket.readyState === WebSocket.OPEN || this._activeSocket.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const filteredChats = await ChatsAPI.getChatByTitle(title);

      if (!filteredChats || filteredChats.length === 0) {
        store.setState('activeChatId', null); // Сбрасываем, если не нашли
        return;
      }

      const targetChat = filteredChats[0];
      //console.log(targetChat);

      //Передаём ChatId для отображения выбранного чата
      store.setState('activeChatId', targetChat.id);

      // 2. Запускаем метод инициализации WebSocket соединения
      await this._initWebSocket(targetChat.id);
    } catch (error) {
      console.error(`Ошибка selectChatByTitle для чата "${title}":`, error);
      store.setState('activeChatId', null);
    }
  }

   private async _initWebSocket(chatId: number): Promise<void> {
    const user = store.getState().user as any;
    if (!user) {
      console.error('[WebSocket] Пользователь не авторизован в системе');
      return;
    }

    try {
      // 1. Получаем токен доступа по API
      const { token } = await ChatsAPI.getChatToken(chatId);

      // 2. Перед созданием нового сокета — обязательно гасим предыдущий, если он был
      this.closeActiveSocket();

      // 3. Собираем URL и создаем нативный объект WebSocket
      const wsUrl = `${WS_BASE_URL}/${user.id}/${chatId}/${token}`;
      this._activeSocket = new WebSocket(wsUrl);

      // 4. Реализуем обработчики из технического задания Практикума
      this._activeSocket.addEventListener('open', () => {
        console.log('Соединение установлено');

        // Тестовая отправка сообщения миру при успешном коннекте
        this._activeSocket?.send(JSON.stringify({
          content: 'Моё первое сообщение миру!',
          type: 'message',
        }));
      });

      this._activeSocket.addEventListener('close', (event) => {
        if (event.wasClean) {
          console.log('Соединение закрыто чисто');
        } else {
          console.log('Обрыв соединения');
        }
        console.log(`Код: ${event.code} | Причина: ${event.reason}`);
      });

      this._activeSocket.addEventListener('message', (event) => {
        // Пока просто выводим сырые данные в консоль, ничего не пишем в Store!
        console.log('Получены данные', event.data);
      });

      this._activeSocket.addEventListener('error', (event: any) => {
        console.log('Ошибка', event.message || event);
      });

    } catch (error) {
      console.error('[WebSocket] Ошибка инициализации:', error);
    }
  }

  /**
   * Метод чистого закрытия сокета
   */
  public closeActiveSocket(): void {
    if (this._activeSocket) {
      this._activeSocket.close();
      this._activeSocket = null;
    }
  }

  public async create(title: string): Promise<void> {
     try {
      await ChatsAPI.create(title);

      await this.fetchChats(true); 
      //console.log(chats);
      //store.setState('chats', chats);
    } catch (error) {
      console.error('Ошибка fetchChats:', error);
    }
  }
  
  //Метод добавления нового пользователя в чат
  public async searchAndAddUserToChat(login: string, chatId: number): Promise<boolean> {
    try {
      const foundUsers = await UserAPI.searchUsers(login);

      if (!foundUsers || foundUsers.length === 0) {
        throw new Error(`Пользователи с логином, похожим на "${login}", не найдены.`);
      }

      let userMenuText = `Найденные пользователи по запросу "${login}":\n\n`;
      foundUsers.forEach((user, index) => {
        const nameInfo = user.first_name || user.second_name 
          ? ` (${user.first_name ?? ''} ${user.second_name ?? ''})` 
          : '';
        userMenuText += `[${index + 1}] ${user.login}${nameInfo}\n`;
      });
      userMenuText += `\nВведите номер пользователя (от 1 до ${foundUsers.length}), которого хотите добавить:`;

      const userSelection = prompt(userMenuText);
      
      if (!userSelection || userSelection.trim() === '') {
        return false;
      }

      const selectedIndex = parseInt(userSelection.trim(), 10) - 1;

      if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= foundUsers.length) {
        throw new Error('Некорректный номер пользователя из предоставленного списка!');
      }

      const targetUser = foundUsers[selectedIndex];
      if (!targetUser || typeof targetUser.id !== 'number' || isNaN(targetUser.id)) {
        throw new Error('Не удалось прочитать валидный ID выбранного пользователя.');
      }

      const userId = targetUser.id;
      await ChatsAPI.addUsers([userId], chatId);
      
      return true;
    } catch (error: any) {
      console.error('Ошибка во флоу поиска и добавления пользователя:', error);
      throw error; 
    }
  }

    public async searchAndDeleteUserFromChat(chatId: number): Promise<boolean> {
      try {
        const chatUsers = await ChatsAPI.getChatUsers(chatId);

        if (!chatUsers || chatUsers.length === 0) {
          throw new Error('В этом чате нет пользователей для удаления.');
        }

        let userMenuText = `Участники текущего чата:\n\n`;
        chatUsers.forEach((user, index) => {
          const nameInfo = user.first_name || user.second_name 
            ? ` (${user.first_name ?? ''} ${user.second_name ?? ''})` 
            : '';
          userMenuText += `[${index + 1}] ${user.login}${nameInfo} — Роль: ${user.role}\n`;
        });
        userMenuText += `\nВведите номер пользователя (от 1 до ${chatUsers.length}), которого хотите УДАЛИТЬ:`;

        const userSelection = prompt(userMenuText);
        
        // Если нажали "Отмена" или ввели пустоту
        if (!userSelection || userSelection.trim() === '') {
          return false;
        }

        const selectedIndex = parseInt(userSelection.trim(), 10) - 1;

        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= chatUsers.length) {
          throw new Error('Некорректный номер пользователя из списка!');
        }

        const targetUser = chatUsers[selectedIndex];
        const userId = targetUser.id;

        // Вызываем удаление из API
        await ChatsAPI.deleteUsers([userId], chatId);
        
        return true; // Возвращаем true при успешном удалении!

      } catch (error: any) {
        console.error('Ошибка во флоу удаления пользователя:', error);
        throw error;
      }
    }

  public async deleteChat(chatId: number): Promise<void> {
    try {
      await ChatsAPI.delete(chatId);
      
      console.log(`Чат #${chatId} успешно удален`);
      
      //Закрываем окно чата если этот чат был удалён
      const currentActiveId = store.getState().activeChatId as number | null;
      if (currentActiveId === chatId) {
        store.setState('activeChatId', null);
        
      }

      //  Обновляем список чатов
      await this.fetchChats(true);

    } catch (error) {
      console.error('Ошибка при удалении чата в контроллере:', error);
      throw error;
    }
  }

  //Обновление аватара чата
    public async updateChatAvatar(data: FormData): Promise<void> {
    try {
      await ChatsAPI.updateChatAvatar(data);
      console.log('Аватар чата успешно обновлен на сервере');

      //Обновляем список чатов
      await this.fetchChats(true);
    } catch (error) {
      console.error('Ошибка обновления аватара чата в контроллере:', error);
      throw error;
    }
  }
}

export default new ChatsController();

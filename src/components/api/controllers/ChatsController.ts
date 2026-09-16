import ChatsAPI from '../Models/chats-api';
import UserAPI from '../Models/user-api';
import store from '../store';

class ChatsController {

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

      const filteredChats = await ChatsAPI.getChatByTitle(title);

      if (!filteredChats || filteredChats.length === 0) {
        store.setState('activeChatId', null); // Сбрасываем, если не нашли
        return;
      }

      const targetChat = filteredChats[0];
      //console.log(targetChat);

      //Передаём ChatId для отображения выбранного чата
      store.setState('activeChatId', targetChat.id);
    } catch (error) {
      console.error(`Ошибка selectChatByTitle для чата "${title}":`, error);
      store.setState('activeChatId', null);
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
}

export default new ChatsController();

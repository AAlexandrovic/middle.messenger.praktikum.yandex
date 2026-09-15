import ChatsAPI from '../Models/chats-api';
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
      console.log(chats);
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
      const chats = await ChatsAPI.create(title);

      await this.fetchChats(true); 
      console.log(chats);
      //store.setState('chats', chats);
    } catch (error) {
      console.error('Ошибка fetchChats:', error);
    }
  }

}

export default new ChatsController();

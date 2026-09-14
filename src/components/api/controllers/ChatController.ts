// api/controllers/ChatsController.ts
import ChatsAPI from '../Models/chats-api';
import store from '../store';

class ChatsController {
  /**
   * Запрашивает список чатов с сервера и сохраняет их в глобальный Store
   */
  public async fetchChats(): Promise<void> {
    try {
      const chats = await ChatsAPI.getChats();
      
      // Записываем чистый массив DTO в Store. 
      // Трансформацию (маппинг в camelCase для верстки) мы делегируем HOC connect,
      // как это уже сделано для профиля пользователя.
      store.setState('chats', chats);
    } catch (error) {
      console.error('Ошибка при получении списка чатов:', error);
      throw error;
    }
  }

  /**
   * Создает новый чат и автоматически обновляет список чатов в Store
   * @param title - Название нового чата
   */
  public async createChat(title: string): Promise<void> {
    try {
      await ChatsAPI.createChat(title);
      
      // После успешного создания сразу обновляем Store актуальным списком чатов
      await this.fetchChats();
    } catch (error) {
      console.error('Ошибка при создании чата:', error);
      throw error;
    }
  }

  /**
   * Выбирает активный чат по его ID
   * @param chatId - ID выбранного чата
   */
  public selectChat(chatId: number): void {
    // Просто сохраняем ID активного чата. Компоненты через connect сразу поймут, какой чат подсветить
    store.setState('activeChatId', chatId);
  }
}

export default new ChatsController();

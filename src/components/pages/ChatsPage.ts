import Block from "../abstracts/Block";
import { validateField } from "../services/Validation";
import Router from "../services/Router";
import { connect } from '../api/HOC/connect';
import ChatsController from "../api/controllers/ChatsController";
import store from "../api/store";
import { RESOURCES_URL } from "../api/config";

const router = new Router(".app");

interface MessageItem {
  id: number;
  text: string;
  time: string;
  isIncoming: boolean;
}

interface ChatItem {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isActive?: boolean;
}

interface CurrentUser {
  name: string;
  avatar: string;
}

interface ActiveChat {
  id: number | null;
  name: string;
  messages: MessageItem[];
}

interface ChatsPageProps {
  chatsPage: {
    currentUser: CurrentUser;
    chats: ChatItem[];
    activeChat: ActiveChat;
  };

  queryParams?: Record<string, string>; 
  [key: string]: unknown;
}

class ChatsPage extends Block<ChatsPageProps> {
  constructor(props: ChatsPageProps) {
    super({
      ...props,
      //Форма для отправки сообщений
      formId: "chat-message-form",
      formClass: "chat-window__form",
      buttonLabel: "→",
      buttonClass: "round-btn chat-window__send-btn",
      messageFields: [
        {
          type: "text",
          id: "message-input-field",
          name: "message",
          class: "chat-window__input",
          placeholder: "Введите сообщение...",
          label: "",
          value: "",
          minimalInput: true, // отключает обёртку и label в Form
        },
      ],

      //Форма для создания чата
      createFormId: "chat-create-form",
      createFormClass: "chat-window__create-form",
      createButtonLabel: "Создать чат",
      createButtonClass: "form-button",
      createFields: [
        {
          type: "text",
          id: "new-chat-title",
          name: "chat_title",
          class: "settings-profile__value",
          label: "Название чата",
          value: "",
          required: true,
        }
      ]
    });

    this.events = {
      submit: async (event: Event) => {
        event.preventDefault();

        const formEl = event.target as HTMLFormElement;

        // Сценарий 1: отправка сообщений
        if (formEl.id === "chat-message-form") {
          const inputEl = formEl.querySelector('input[name="message"]') as HTMLInputElement | null;
          if (!inputEl) return;

          const messageText = inputEl.value.trim();
          const error = validateField("message", messageText);

          const formBlock = this.children.find(
            (c) => (c as any).props?.id === "chat-message-form"
          ) as any;

          if (formBlock && !formBlock.validate()) return;
          if (error) return;

          if (messageText) {
            ChatsController.sendMessage(messageText);
            inputEl.value = '';
          }
        }

        // Сценарий 2: создание нового чата
        if (formEl.id === "chat-create-form") {
          const inputEl = formEl.querySelector('input[name="chat_title"]') as HTMLInputElement | null;
          if (!inputEl) return;

          const chatTitle = inputEl.value.trim();
          if (!chatTitle) return;

          try {
           await ChatsController.create(chatTitle);
            // Автоматически переходим в только что созданный чат
            router.go(`/chats?title=${encodeURIComponent(chatTitle)}`);
          } catch (error) {
            console.error("Не удалось создать чат:", error);
          }
        }
      },

      click: async (event: Event) => {
        const target = event.target as HTMLElement;

        // Обработка клика по кнопке "Добавить пользователя"
        if (target.classList.contains('chat-window__add-user-btn')) {
          event.preventDefault();
          
          // Извлекаем id активного чата из глобального Store
          const activeChatId = store.getState().activeChatId as number | null;
          if (!activeChatId) {
            alert('Сначала выберите чат для добавления пользователя.');
            return;
          }

          // Вызываем prompt для поиска по имени (login)
          const userLoginInput = prompt('Введите ЛОГИН (имя) пользователя для поиска и добавления:');
          if (!userLoginInput || userLoginInput.trim() === '') return;

          const loginToFind = userLoginInput.trim();

          try {
            const isAdded = await (ChatsController.searchAndAddUserToChat(loginToFind, activeChatId) as any);
            
            if (isAdded) {
              alert(`Пользователь "${loginToFind}" успешно добавлен в чат!`);
            }
          } catch (error: any) {
            alert(`Ошибка: ${error.message || 'Не удалось добавить пользователя.'}`);
          }
          return;
        }

        //Метод удаления пользователей из чата
        if (target.classList.contains('chat-window__delete-user-btn')) {
          event.preventDefault();
          
          // Берем ID текущего активного чата
          const activeChatId = store.getState().activeChatId as number | null;
          if (!activeChatId) {
            alert('Сначала выберите чат для удаления пользователей.');
            return;
          }

          try {
           const isDeleted = await ChatsController.searchAndDeleteUserFromChat(activeChatId);
      
           if (isDeleted) {
              alert('Пользователь успешно удален из чата!');
            }
          } catch (error: any) {
            alert(`Ошибка: ${error.message || 'Не удалось удалить пользователя.'}`);
          }
            return;
        }

        // Удаление чата
        if (target.classList.contains('chat-window__delete-chat-btn')) {
          event.preventDefault();
          
          const activeChatId = store.getState().activeChatId as number | null;
          const chatsPageData = this.props.chatsPage;
          const chatName = chatsPageData?.activeChat?.name || 'этот';

          if (!activeChatId) {
            alert('Не выбран активный чат для удаления.');
            return;
          }

          const isConfirmed = confirm(`Вы уверены, что хотите НАВСЕГДА УДАЛИТЬ чат "${chatName}"?`);
          if (!isConfirmed) return;

          try {
            // Передаем числовой ID в контроллер
            await ChatsController.deleteChat(activeChatId);
            
            alert(`Чат "${chatName}" успешно удален.`);
            
            router.go('/chats');
          } catch (error: any) {
            alert(`Ошибка при удалении чата: ${error.message || 'Не удалось удалить чат.'}`);
          }
          return;
        }

        // Стандартный выбор чата в сайдбаре
        const item = target.closest('.chats-list__item');
        if (item) {
          event.preventDefault();
          const chatTitle = item.getAttribute('data-title'); 
          if (chatTitle) {
            router.go(`/chats?title=${encodeURIComponent(chatTitle)}`);
          }
        }
      },

      //Перехватываем загрузку файла:
      change: async (event: Event) => {
        const input = event.target as HTMLInputElement;

        // Проверяем, что событие произошло именно на инпуте аватара чата и файл выбран
        if (input && input.id === 'chat-avatar-input' && input.files && input.files.length > 0) {
          event.preventDefault();

          // Достаем ID активного чата из глобального Store
          const activeChatId = store.getState().activeChatId as number | null;
          if (!activeChatId) {
            alert('Не выбран активный чат.');
            return;
          }

          const file = input.files[0];
          const formData = new FormData();
          
          // Наполняем FormData строго по ТЗ
          formData.append('chatId', String(activeChatId)); // Спецификация ждёт chatId
          formData.append('avatar', file);                // Спецификация ждёт файл под ключом avatar

          try {
            // Отправляем в контроллер
            await ChatsController.updateChatAvatar(formData);
            alert('Аватар чата успешно изменен!');
          } catch (error) {
            alert('Не удалось обновить аватар чата. Возможно, вы не являетесь создателем чата.');
          } finally {
            // Обязательно сбрасываем значение инпута, чтобы можно было загрузить этот же файл повторно
            input.value = '';
          }
        }
      }
    };
  }

  
  //Первая загрузка списка всех чатов
  protected componentDidMount(): void {
    ChatsController.fetchChats();
    // ChatsController.fetchChats().then(() => {
    //   // Проверяем наличие параметра title в URL при входе
    //   const query = this.props.queryParams;
    //   if (query?.title) {
    //     ChatsController.selectChatByTitle(query.title);
    //   }
    // });
          // Проверяем наличие параметра title в URL при входе
      const query = this.props.queryParams;
      if (query?.title) {
        ChatsController.selectChatByTitle(query.title);
      }
  }

  //Отображаем выбранный чат
  protected componentDidUpdate(oldProps: any, newProps: any): boolean {
  // const oldTitle = oldProps.queryParams?.title || '';
  // const newTitle = newProps.queryParams?.title || '';

  // if (newTitle !== oldTitle) {
  //   if (newTitle) {
  //     ChatsController.selectChatByTitle(newTitle);
  //   } else {
  //     store.setState('activeChatId', null);
  //     store.setState('messages', []);
  //   }
  //   return true; 
  // }
  // return false;
      if (JSON.stringify(oldProps.chatsPage) !== JSON.stringify(newProps.chatsPage)) {
      return true; 
    }
    return false;
  }


 protected template = `
    <main class="main-content">
      <div class="chats-page-layout">
        <aside class="chats-sidebar">
          <header class="chats-sidebar__header">
            <div class="chats-sidebar__avatar-zone user-avatar">
              <img src="{{chatsPage.currentUser.avatar}}" alt="Аватар" class="user-avatar__img">
              <span class="user-avatar__name">{{chatsPage.currentUser.name}}</span>
            </div>
            <a href="/settings" class="chats-sidebar__settings-btn router-link">Профиль &gt;</a>
          </header>

          <ul class="chats-list">
            {{#each chatsPage.chats}}
              <li class="chats-list__item {{#if this.isActive}}chats-list__item--active{{/if}}" data-title="{{this.title}}">
                <div class="chats-list__link" style="cursor: pointer;">
                  <img src="{{this.avatar}}" alt="{{this.title}}" class="chats-list__avatar">
                  <div class="chats-list__info">
                    <strong class="chats-list__name">{{this.title}}</strong>
                    <p class="chats-list__last-message">{{this.lastMessage}}</p>
                  </div>
                  <div class="chats-list__meta">
                    <time class="chats-list__time">{{this.time}}</time>
                    {{#if this.unreadCount}}
                      <span class="chats-list__unread-badge">{{this.unreadCount}}</span>
                    {{/if}}
                  </div>
                </div>
              </li>
            {{/each}}
          </ul>
        </aside>

        <section class="chat-window">
          {{#if chatsPage.activeChat.id}}
            <!-- Отображаем сообщения -->
            <header class="chat-window__header">
            <div>
              <label for="chat-avatar-input" class="chat-window__avatar-label" title="Поменять аватар чата">
                <img src="{{chatsPage.activeChat.avatar}}" alt="Аватар чата" class="chat-window__avatar-img"/>
                <input type="file" id="chat-avatar-input" class="chat-avatar-input" accept="image/*" />
              </label>
              <h3 class="chat-window__title">{{chatsPage.activeChat.name}}</h3>
            </div>

            <!-- Кнопка добавления пользователя по логину -->
              <div class="chat-window__controls">
                <button class="chat-window__add-user-btn" >
                  ➕ Добавить пользователя
                </button>

              <!-- Кнопка удаления пользователя из чата -->
                <button class="chat-window__delete-user-btn">
                  ❌ Удалить пользователя
                </button>

                <button class="chat-window__delete-chat-btn">
                  🗑️ Удалить чат
                </button>
              </div>
            </header>

            <div class="chat-window__messages-container">
              <ul class="chat-window__messages-list">
                {{#each chatsPage.activeChat.messages}}
                  {{{ ChatMessage
                      text=this.text
                      time=this.time
                      isIncoming=this.isIncoming
                  }}}
                {{/each}}
              </ul>
            </div>

            <footer class="chat-window__footer">
              {{{ Form
                  id=formId
                  class=formClass
                  fields=messageFields
                  buttonLabel=buttonLabel
                  buttonClass=buttonClass
              }}}
            </footer>
          {{else}}
            <!-- Создаём новый чат -->
            <div class="chat-window__create-zone">
              <h2>Создать новый чат</h2>
              <div>
                {{{ Form
                    id=createFormId
                    class=createFormClass
                    fields=createFields
                    buttonLabel=createButtonLabel
                    buttonClass=createButtonClass
                }}}
              </div>
            </div>
          {{/if}}
        </section>
      </div>
    </main>
  `;
}

export default connect((state) => {
  const user = state.user as any;
  const chats = (state.chats as any[] || []);
  const activeChatId = state.activeChatId as number | null;
  const messages = (state.messages as any[] || []);

  const activeChat = chats.find(c => c.id === activeChatId);

  return {
    chatsPage: {
      currentUser: {
        name: user?.first_name || 'Пользователь',
        avatar: user?.avatar ? `${RESOURCES_URL}${user.avatar}` : 'https://placeholder.co'
      },
      chats: chats.map(chat => ({
        id: chat.id,
        title: chat.title, 
        isActive: chat.id === activeChatId,
        unreadCount: chat.unread_count,
        lastMessage: chat.last_message?.content || 'Нет сообщений',
        time: chat.last_message?.time 
          ? new Date(chat.last_message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          : '',
        avatar: chat.avatar ? `${RESOURCES_URL}${chat.avatar}` : 'https://placeholder.co'
      })),
      activeChat: {
        id: activeChatId,
        name: activeChat?.title || '', 
        avatar: activeChat?.avatar 
          ? `${RESOURCES_URL}${activeChat.avatar}?v=${Date.now()}` 
          : 'https://placeholder.co',
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          time: msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          isIncoming: msg.user_id !== user?.id
        }))
      }
    }
  };
})(ChatsPage);

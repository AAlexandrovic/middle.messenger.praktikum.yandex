import Block from "../abstracts/Block";
import { validateField } from "../services/Validation";
import Router from "../services/Router";
import { connect } from '../api/HOC/connect';
import ChatsController from "../api/controllers/ChatsController";
import store from "../api/store";

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

          const formBlock = this.children.find((c) => (c as any).constructor?.componentName === "Form") as any;
          if (formBlock && !formBlock.validate()) return;
          if (error) return;

          if (messageText) {
           // ChatsController.sendMessage(messageText);
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

      click: (event: Event) => {
        const item = (event.target as HTMLElement).closest('.chats-list__item');
        if (item) {
          event.preventDefault();
          const chatTitle = item.getAttribute('data-title'); // Извлекаем title чата
          if (chatTitle) {
            // Переходим на роут с query-параметром title
            router.go(`/chats?title=${encodeURIComponent(chatTitle)}`);
          }
        }
      }
    };
  }

  
  //Первая загрузка списка всех чатов
  protected componentDidMount(): void {
    ChatsController.fetchChats().then(() => {
      // Проверяем наличие параметра title в URL при входе
      const query = this.props.queryParams;
      if (query?.title) {
        ChatsController.selectChatByTitle(query.title);
      }
    });
  }

  //Отображаем выбранный чат
  protected componentDidUpdate(oldProps: any, newProps: any): boolean {
  const oldTitle = oldProps.queryParams?.title || '';
  const newTitle = newProps.queryParams?.title || '';

  if (newTitle !== oldTitle) {
    if (newTitle) {
      ChatsController.selectChatByTitle(newTitle);
    } else {
      store.setState('activeChatId', null);
      store.setState('messages', []);
    }
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
              <h3 class="chat-window__title">{{chatsPage.activeChat.name}}</h3>
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
            <div class="chat-window__create-zone" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; padding: 20px;">
              <h2 style="margin-bottom: 20px; color: #333;">Создать новый чат</h2>
              <div style="width: 100%; max-width: 400px;">
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
        avatar: user?.avatar ? `https://ya-praktikum.tech/api/v2/resources${user.avatar}` : 'https://placeholder.co'
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
        avatar: chat.avatar ? `https://ya-praktikum.tech/api/v2/resources${chat.avatar}` : 'https://placeholder.co'
      })),
      activeChat: {
        id: activeChatId,
        name: activeChat?.title || '', 
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

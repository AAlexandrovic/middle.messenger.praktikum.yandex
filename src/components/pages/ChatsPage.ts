import Block from "../abstracts/Block";
import { validateField } from "../services/Validation";

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
  [key: string]: unknown;
}

export default class ChatsPage extends Block<ChatsPageProps> {
  constructor(props: ChatsPageProps) {
    super({
      ...props,
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
    });

    this.events = {
      submit: (event: Event) => {
        event.preventDefault();

        const inputEl = this.element()?.querySelector('input[name="message"]') as HTMLInputElement | null;
        if (!inputEl) return;

        const messageText = inputEl.value.trim();
        const error = validateField("message", messageText);

        // Обновляем ошибку в компоненте Input
        // Находим компонент Input среди children по его componentName
    const formBlock = this.children.find(
      (c) => (c as any).constructor?.componentName === "Form"
    ) as any;

    if (formBlock) {
      const isValid = formBlock.validate(); // Form сам пробежится по своим Input
      
      if (!isValid) {
        console.log("Есть ошибки валидации");
        return;
      }
        if (error) {
          console.log("Ошибка отправки:", error);
          return;
        }
      }
      },
    };
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
              <li class="chats-list__item {{#if this.isActive}}chats-list__item--active{{/if}}">
                <a href="#chat-{{this.id}}" class="chats-list__link">
                  <img src="{{this.avatar}}" alt="{{this.name}}" class="chats-list__avatar">
                  <div class="chats-list__info">
                    <strong class="chats-list__name">{{this.name}}</strong>
                    <p class="chats-list__last-message">{{this.lastMessage}}</p>
                  </div>
                  <div class="chats-list__meta">
                    <time class="chats-list__time">{{this.time}}</time>
                    {{#if this.unreadCount}}
                      <span class="chats-list__unread-badge">{{this.unreadCount}}</span>
                    {{/if}}
                  </div>
                </a>
              </li>
            {{/each}}
          </ul>
        </aside>

        <section class="chat-window">
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
        </section>
      </div>
    </main>
  `;
}

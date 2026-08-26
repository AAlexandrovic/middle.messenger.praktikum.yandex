import Block from './abstracts/Block'; 

interface ChatMessageProps {
  text: string;      // Текст сообщения
  time: string;      // Время отправки
  isIncoming: boolean; // true — входящее, false — исходящее
  [key: string]: unknown;
}

class ChatMessage extends Block<ChatMessageProps> {
  static componentName = "ChatMessage";

  constructor(props: ChatMessageProps) {
    super(props);
  }

  protected template = `
    <li class="chat-window__message {{#if isIncoming}}chat-window__message--incoming{{else}}chat-window__message--outgoing{{/if}}">
        <p class="chat-window__message-text">{{text}}</p>
        <time class="chat-window__message-time">{{time}}</time>
    </li>
  `;
}

export default ChatMessage;

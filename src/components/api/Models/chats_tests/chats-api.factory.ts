import { type ChatDTO, type ChatUserDTO } from '../chats-api';


// Фабрика для генерации фиктивного объекта чата (ChatDTO)
export function createChatDTO(overrides: Partial<ChatDTO> = {}): ChatDTO {
  return {
    id: 137161,
    title: 'my-chat',
    avatar: '/123/avatar1.jpg',
    unread_count: 15,
    created_by: 6301,
    last_message: {
      user: {
        first_name: 'Petya',
        second_name: 'Pupkin',
        avatar: '/path/to/avatar.jpg',
        email: 'my@email.com',
        login: 'userLogin',
        phone: '8(911)-222-33-22'
      },
      time: '2020-01-02T14:22:22.000Z',
      content: 'this is message content'
    },
    ...overrides
  };
}


// Фабрика для генерации фиктивного объекта участника чата (ChatUserDTO)
export function createChatUserDTO(overrides: Partial<ChatUserDTO> = {}): ChatUserDTO {
  return {
    id: 6301,
    first_name: 'Petya',
    second_name: 'Pupkin',
    display_name: 'Petya Pupkin',
    login: 'userLogin',
    avatar: '/path/to/my-file.jpg',
    role: 'admin',
    ...overrides
  };
}

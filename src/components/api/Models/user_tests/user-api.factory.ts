import { type UserDTO, type SearchUserDTO } from '../user-api';

/**
 * Фабрика для генерации фиктивного объекта пользователя
 */
export function createUserDTO(overrides: Partial<UserDTO> = {}): UserDTO {
  return {
    id: 123,
    first_name: 'Petya',
    second_name: 'Pupkin',
    display_name: 'Petya Developer',
    login: 'petya_cool',
    email: 'petya@ya.ru',
    phone: '+79991112233',
    avatar: '/path/to/avatar.jpg',
    ...overrides,
  };
}

/**
 * Фабрика для генерации результатов поиска
 */
export function createSearchUserDTO(overrides: Partial<SearchUserDTO> = {}): SearchUserDTO {
  return {
    id: 456,
    first_name: 'Ivan',
    second_name: 'Ivanov',
    display_name: null,
    phone: '+79990001122',
    login: 'ivan_search',
    avatar: null,
    email: 'ivan@ya.ru',
    ...overrides,
  };
}

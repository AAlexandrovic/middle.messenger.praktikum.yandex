import { vi } from 'vitest';
import { HTTPTransport } from './HTTPTransport';

// Интерфейс опций, которые можно переопределить при создании фабрики
interface FactoryOptions {
  baseURL?: string;
  status?: number;
  responseText?: string;
  responseType?: XMLHttpRequestResponseType;
  contentType?: string;
}

export function createHTTPTransport(options: FactoryOptions = {}) {
  // Настройки по умолчанию, которые можно расширить через деструктуризацию
  const baseURL = options.baseURL ?? 'https://test-api.com';
  const status = options.status ?? 200;
  const responseText = options.responseText ?? JSON.stringify({ success: true });
  const responseType = options.responseType ?? '';
  const contentType = options.contentType ?? 'application/json';

  // Создаем изолированные шпионы для конкретного вызова фабрики
  const mockXHR = {
    open: vi.fn(),
    send: vi.fn(),
    setRequestHeader: vi.fn(),
    getResponseHeader: vi.fn().mockReturnValue(contentType),
    readyState: 4,
    status: status,
    responseText: responseText,
    response: responseType ? JSON.parse(responseText) : undefined,
  };

  // Эмулируем класс XMLHttpRequest
  class MockXMLHttpRequest {
    open = mockXHR.open;
    send = mockXHR.send;
    setRequestHeader = mockXHR.setRequestHeader;
    getResponseHeader = mockXHR.getResponseHeader;
    
    get readyState() { return mockXHR.readyState; }
    get status() { return mockXHR.status; }
    get responseText() { return mockXHR.responseText; }
    get response() { return mockXHR.response; }
    
    set withCredentials(_val: boolean) {}
    set timeout(_val: number) {}
    set responseType(_val: XMLHttpRequestResponseType) {}
    set onload(callback: () => void) {
      callback(); // имитируем мгновенный ответ сервера
    }
  }

  // Подменяем глобальный XMLHttpRequest именно для этого теста
  vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);

  // Создаем транспорт
  const transport = new HTTPTransport(baseURL);

  // Возвращаем массив: сам транспорт и его DOM-шпионы для проверок
  return { transport, mockXHR };
}

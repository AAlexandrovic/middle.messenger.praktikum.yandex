import { vi } from 'vitest';

/**
 * Фабричный класс-заглушка для эмуляции нативного WebSocket браузера
 */
export class MockWebSocket {
  public url: string;
  public readyState: number = 0; // WebSocket.CONNECTING
  public send = vi.fn();
  public close = vi.fn();
  private _listeners: Record<string, Array<(e?: any) => void>> = {};

  constructor(url: string) {
    this.url = url;
    // Спецификация WebSocket требует констант на уровне инстанса
    (this as any).OPEN = 1;
  }

  public addEventListener(event: string, callback: (e?: any) => void): void {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  }


 // Вспомогательный тестовый метод для ручного триггера системных событий сокета
  public triggerEvent(event: string, eventData?: any): void {
    if (this._listeners[event]) {
      this._listeners[event].forEach((cb) => cb(eventData));
    }
  }
}

// Задаем константы состояния, которые проверяет WSTransport
(MockWebSocket as any).OPEN = 1;

// Инициализирует изолированное тестовое окружение для WSTransport
export function createWSTransportTest() {
  // Подменяем нативный глобальный WebSocket нашим Mock-классом
  vi.stubGlobal('WebSocket', MockWebSocket);

  // Шпионим за встроенными глобальными таймерами
  vi.useFakeTimers();

  return {
    MockWebSocket,
    restoreEnvironment: () => {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    }
  };
}

// src/components/api/services/tests/WSTransport.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WSTransport, WSTransportEvents } from './WSTransport';
import { createWSTransportTest, MockWebSocket } from './WSTransport.factory';
import { WS_BASE_URL } from '../config';

describe('Сервис WSTransport реал-тайм сокет протокол', () => {

  beforeEach(() => {
    createWSTransportTest();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('Должен формировать корректный URL-адрес подключения', () => {
    const transport = new WSTransport(777, 137, 'token_abc');
    
    // Вызов метода connect создает инстанс WebSocket
    transport.connect().catch(() => {});
    
    const activeSocket = (transport as any)._socket as unknown as MockWebSocket;
    expect(activeSocket.url).toBe(`${WS_BASE_URL}/777/137/token_abc`);
  });

  it('Должен успешно резолвить промис connect() при наступлении события open', async () => {
    const transport = new WSTransport(1, 1, 'token');
    
    const connectPromise = transport.connect();
    const activeSocket = (transport as any)._socket as unknown as MockWebSocket;

    // Имитируем успешный хендшейк от сервера Яндекса
    activeSocket.triggerEvent('open');

    // Проверяем, что внутренний промис успешно разрешился без падений
    await expect(connectPromise).resolves.toBeUndefined();
  });

  it('Должен запускать пинг-интервал и слать пакеты каждые 10 секунд после подключения', async () => {
    const transport = new WSTransport(1, 1, 'token');
    transport.connect().catch(() => {});
    const activeSocket = (transport as any)._socket as unknown as MockWebSocket;

    // Открываем сокет и меняем статус на OPEN, чтобы метод send пропустил отправку
    activeSocket.triggerEvent('open');
    activeSocket.readyState = 1; // WebSocket.OPEN

    // Перематываем время виртуальных таймеров Vitest на 10 секунд вперед
    vi.advanceTimersByTime(10000);

    // Проверяем, что сработал метод автоматического старта пинга
    expect(activeSocket.send).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }));
  });

  it('Должен транслировать входящие текстовые сообщения в кастомное событие Message', async () => {
    const transport = new WSTransport(1, 1, 'token');
    transport.connect().catch(() => {});
    const activeSocket = (transport as any)._socket as unknown as MockWebSocket;

    const messageCallback = vi.fn();
    transport.on(WSTransportEvents.Message, messageCallback);

    // Симулируем входящий текстовый JSON-пакет от сервера сообщений
    const mockServerPayload = { id: 1, content: 'Hello', type: 'message' };
    activeSocket.triggerEvent('message', { data: JSON.stringify(mockServerPayload) });

    // Проверяем, что шина событий распарсила строку в чистый объект и передала его в колбэк
    expect(messageCallback).toHaveBeenCalledWith(mockServerPayload);
  });

  it('Должен игнорировать входящие pong-пакеты и не пушить их в шину событий мессенджера', async () => {
    const transport = new WSTransport(1, 1, 'token');
    transport.connect().catch(() => {});
    const activeSocket = (transport as any)._socket as unknown as MockWebSocket;

    const messageCallback = vi.fn();
    transport.on(WSTransportEvents.Message, messageCallback);

    // Симулируем входящий технический пакет удержания соединения pong
    activeSocket.triggerEvent('message', { data: JSON.stringify({ type: 'pong' }) });

    // Проверяем, что фильтрация сработала — колбэк вывода сообщений на экран не был вызван
    expect(messageCallback).not.toHaveBeenCalled();
  });

  it('Должен корректно очищать таймеры и закрывать соединение при вызове close()', async () => {
    const transport = new WSTransport(1, 1, 'token');
    transport.connect().catch(() => {});
    const activeSocket = (transport as any)._socket as unknown as MockWebSocket;

    activeSocket.triggerEvent('open');
    activeSocket.readyState = 1;

    // Вызываем полное закрытие сессии
    transport.close();

    // 1. Проверяем, что на сокете вызван нативный метод закрытия
    expect(activeSocket.close).toHaveBeenCalled();
    expect((transport as any)._socket).toBeNull();

    // 2. Проверяем очистку памяти интервала пинга — перематываем время и смотрим, что пинги больше не шлются
    vi.advanceTimersByTime(10000);
    expect(activeSocket.send).not.toHaveBeenCalled();
  });
});

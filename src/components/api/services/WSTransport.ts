import { WS_BASE_URL } from '../config';

export enum WSTransportEvents {
  Connected = 'connected',
  Error = 'error',
  Message = 'message',
  Close = 'closed',
}

export class WSTransport {
  private _socket: WebSocket | null = null;
  private _pingInterval: any = null;
  private _url: string;
  private _callbacks: Record<string, Array<(data?: any) => void>> = {};

  constructor(userId: number, chatId: number, token: string) {
    this._url = `${WS_BASE_URL}/${userId}/${chatId}/${token}`;
  }

  /**
   * Подключение к WebSocket
   */
  public connect(): Promise<void> {
    if (this._socket) {
      throw new Error('WebSocket уже подключен или находится в процессе подключения');
    }

    this._socket = new WebSocket(this._url);
    this._setupListeners();

    return new Promise((resolve, reject) => {
      this.on(WSTransportEvents.Connected, () => resolve());
      this.on(WSTransportEvents.Error, (error) => reject(error));
    });
  }

  /**
   * Отправка данных на сервер
   */
  public send(data: Record<string, unknown> | string): void {
    if (!this._socket || this._socket.readyState !== WebSocket.OPEN) {
      throw new Error('Невозможно отправить данные: WebSocket не подключен');
    }

    const message = typeof data === 'string' ? data : JSON.stringify(data);
    this._socket.send(message);
  }

  /**
   * Закрытие соединения и очистка ресурсов
   */
  public close(): void {
    if (this._socket) {
      this._socket.close();
      this._socket = null;
    }
    this._stopPing();
    this._callbacks = {}; // Очищаем обработчики событий
  }

  /**
   * Подписка на кастомные события сокета
   */
  public on(event: WSTransportEvents, callback: (data?: any) => void): void {
    if (!this._callbacks[event]) {
      this._callbacks[event] = [];
    }
    this._callbacks[event].push(callback);
  }

  private _emit(event: WSTransportEvents, data?: any): void {
    if (this._callbacks[event]) {
      this._callbacks[event].forEach((callback) => callback(data));
    }
  }

  private _setupListeners(): void {
    if (!this._socket) return;

    this._socket.addEventListener('open', () => {
      this._emit(WSTransportEvents.Connected);
      this._startPing();
    });

    this._socket.addEventListener('close', (event) => {
      this._emit(WSTransportEvents.Close, event);
      this._stopPing();
    });

    this._socket.addEventListener('error', (event) => {
      this._emit(WSTransportEvents.Error, event);
    });

    this._socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === 'pong') return; // Игнорируем пинг-сервис

        this._emit(WSTransportEvents.Message, data);
      } catch (error) {
        console.error('Ошибка парсинга WebSocket сообщения:', error);
      }
    });
  }

  private _startPing(): void {
    this._pingInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 10000);
  }

  private _stopPing(): void {
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
  }
}

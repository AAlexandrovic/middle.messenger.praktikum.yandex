import { BASE_URL } from './config'; // Укажите ваш правильный относительный путь к файлу конфигурации

export enum METHODS {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

type RequestOptions = {
  headers?: Record<string, string>;
  method?: METHODS;
  data?: Record<string, unknown> | FormData | string | null;
  timeout?: number;
  responseType?: XMLHttpRequestResponseType;
  withCredentials?: boolean;
};

// Единый тип для http-методов,
type HTTPMethod = <R = unknown>(url: string, options?: Omit<RequestOptions, 'method'>) => Promise<R>;

function queryStringify(data: Record<string, unknown>): string {
  if (!data || typeof data !== 'object') {
    throw new Error('Data must be a non-null object');
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    return '';
  }

  return keys
    .reduce<string[]>((acc, key) => {
      const value = data[key];
      if (value === undefined || value === null) {
        return acc;
      }

      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(String(value));
      acc.push(`${encodedKey}=${encodedValue}`);
      return acc;
    }, [])
    .join('&');
}

export class HTTPTransport {
  private readonly baseURL: string;
  private readonly defaultTimeout = 5000;

  //Если baseURL не передан, по умолчанию берется глобальный BASE_URL из конфига
  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  // Используем тип HTTPMethod, удаляя дублирование типов аргументов.
  public get: HTTPMethod = (url, options = {}) => (
    this.request(url, { ...options, method: METHODS.GET }, options.timeout)
  );

  public post: HTTPMethod = (url, options = {}) => (
    this.request(url, { ...options, method: METHODS.POST }, options.timeout)
  );

  public put: HTTPMethod = (url, options = {}) => (
    this.request(url, { ...options, method: METHODS.PUT }, options.timeout)
  );

  public delete: HTTPMethod = (url, options = {}) => (
    this.request(url, { ...options, method: METHODS.DELETE }, options.timeout)
  );

  // Основной метод запроса 
  private request<T = unknown>(
    url: string,
    options: RequestOptions,
    timeout: number = this.defaultTimeout
  ): Promise<T> {
    const fullURL = `${this.baseURL}${url}`;
    const { headers = {}, method, data, responseType, withCredentials = true } = options;

    if (!method) {
      return Promise.reject(new Error('HTTP method is required'));
    }

    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const isGet = method === METHODS.GET;

      const finalUrl = isGet && data && typeof data === 'object' && !(data instanceof FormData)
        ? `${fullURL}?${queryStringify(data)}`
        : fullURL;

      xhr.open(method, finalUrl);

      xhr.withCredentials = withCredentials;

      if (responseType) {
        xhr.responseType = responseType;
      }

      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key]);
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let response: unknown;

          if (responseType) {
            response = xhr.response;
          } else {
            const contentType = xhr.getResponseHeader('Content-Type') || '';
            if (contentType.includes('application/json')) {
              try {
                response = JSON.parse(xhr.responseText);
              } catch (e) {
                response = xhr.responseText;
              }
            } else {
              response = xhr.responseText;
            }
          }

          resolve(response as T);
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
            request: xhr,
          });
        }
      };

      xhr.onabort = () => reject({ reason: 'Request aborted', request: xhr });
      xhr.onerror = () => reject({ reason: 'Network error', request: xhr });
      xhr.ontimeout = () => reject({ reason: 'Request timeout', timeout, request: xhr });

      xhr.timeout = timeout;

      if (isGet || !data) {
        xhr.send();
      } else if (data instanceof FormData) {
        xhr.send(data);
      } else if (typeof data === 'object') {
        const hasContentType = Object.keys(headers).some(
          (key) => key.toLowerCase() === 'content-type'
        );
        if (!hasContentType) {
          xhr.setRequestHeader('Content-Type', 'application/json');
        }
        xhr.send(JSON.stringify(data));
      } else {
        xhr.send(String(data));
      }
    });
  }
}

export default HTTPTransport;

import { describe, it, expect } from 'vitest';
import { createHTTPTransport } from './HTTPTransport.factory';

describe('Сервис HTTPTransport (Обобщенное тестирование CRUD)', () => {
  const testEndpoint = '/test-route';
  const testPayload = { foo: 'bar' };
  
  const expectedBaseURL = 'https://test-api.com';

  it('Метод GET должен правильно сшивать URL и отправлять GET-запрос', () => {
    const { transport, mockXHR } = createHTTPTransport();

    transport.get(testEndpoint);

    // Сверяем со сшитым тестовым доменом
    expect(mockXHR.open).toHaveBeenCalledWith('GET', `${expectedBaseURL}${testEndpoint}`);
  });

  it('Метод POST должен отправлять данные в формате JSON и вызывать метод POST', () => {
    const { transport, mockXHR } = createHTTPTransport();

    transport.post(testEndpoint, { data: testPayload });

    expect(mockXHR.open).toHaveBeenCalledWith('POST', `${expectedBaseURL}${testEndpoint}`);
    expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify(testPayload));
  });

  it('Метод PUT должен отправлять данные в формате JSON и вызывать метод PUT', () => {
    const { transport, mockXHR } = createHTTPTransport();

    transport.put(testEndpoint, { data: testPayload });

    expect(mockXHR.open).toHaveBeenCalledWith('PUT', `${expectedBaseURL}${testEndpoint}`);
    expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify(testPayload));
  });

  it('Метод DELETE должен отправлять данные в формате JSON и вызывать метод DELETE', () => {
    const { transport, mockXHR } = createHTTPTransport();

    transport.delete(testEndpoint, { data: testPayload });

    expect(mockXHR.open).toHaveBeenCalledWith('DELETE', `${expectedBaseURL}${testEndpoint}`);
    expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify(testPayload));
  });
});

// base-api.ts
export abstract class BaseAPI {
  // Используем дженерик или any для аргументов, чтобы не ломать наследование
  abstract create(...args: any[]): Promise<unknown>;
  
  abstract request(): Promise<unknown>;
  
  abstract update(...args: any[]): Promise<unknown>;
  
  abstract delete(...args: any[]): Promise<unknown>;
}

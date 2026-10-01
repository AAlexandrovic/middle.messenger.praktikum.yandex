export abstract class BaseAPI {
  abstract create(...args: unknown[]): Promise<unknown>;
  
  abstract request(): Promise<unknown>;
  
  abstract update(...args: unknown[]): Promise<unknown>;
  
  abstract delete(...args: unknown[]): Promise<unknown>;
}

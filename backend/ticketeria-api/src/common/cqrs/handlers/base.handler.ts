export abstract class BaseHandler<T, R> {
  abstract execute(command: T): Promise<R>;
}


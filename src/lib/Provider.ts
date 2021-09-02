/**
 * Provides instances of T. Typically implemented by an injector.
 * Inspired by Guice documentation :)
 */
export abstract class Provider<T> {
  /**
   * Provides a fully-constructed and injected instance of T.
   */
  abstract get(): T;
}

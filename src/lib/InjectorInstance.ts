import { Injector } from './Injector';

let globalInjector: Injector | undefined;

/**
 * Set the global injector instance.
 * This should be used only in a final project.
 *
 * Relying on the global injector instance should never be used in a library project
 * because it reduce its usability.
 * @param injector The injector that will be made available statically available in all the application
 */
export function configureGlobalInjector(injector: Injector) {
  globalInjector = injector;
}

/**
 * Get instances configure in the global injector instance. See {@link Injector.getInstance}
 * @param type The type for which an instance of is required
 */
export function getGlobalInstance<T>(type: Function & { prototype: T }): T {
  if (!globalInjector) {
    throw new Error('Global injector is not defined, '
      + 'you must call "configureGlobalInjector" before trying to use "getInstance"');
  }
  return globalInjector.getInstance(type);
}

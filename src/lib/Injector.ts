import { DIContainer } from '@wessberg/di';
import { Implementation } from '@wessberg/di/dist/esm/implementation/implementation';
import { NewableService } from '@wessberg/di/dist/esm/newable-service/newable-service';
import { Provider } from './Provider';
import SingletonInstances from './SingletonInstances';

/**
 * The dependency injector used to register and retrieve services
 */
export class Injector {
  private readonly container = new DIContainer();

  private readonly singletonInstances = new SingletonInstances();

  private readonly registeredTypes = new Set<Function & { prototype: any } | Implementation<any>>();

  static readonly CONSTRUCTOR_NAME_SYMBOL_IDENTIFIER = '___CTOR_NAME___';

  static readonly CONSTRUCTOR_NAME_SYMBOL: unique symbol = Symbol.for(Injector.CONSTRUCTOR_NAME_SYMBOL_IDENTIFIER);

  /**
   * Register an implementation to an optional type
   * @param implementationType The implementation type
   * @param mappedType The type on which the implementation is mapped to.
   * This type can be a class or an abstract class, but it cannot be an interface
   * since in TS interfaces are not compiled into the JS output.
   */
  registerSingleton<T, I extends T>(implementationType: Implementation<I>, mappedType?: Function & { prototype: T }) {
    this.container.registerSingleton(
      undefined,
      {
        identifier: mappedType ? Injector.getTypeName(mappedType) : Injector.getTypeName(implementationType),
        implementation: this.singletonInstances.singletonProxy(implementationType),
      },
    );
    this.registeredTypes.add(mappedType ?? implementationType);
  }

  /**
   * Register a provider that will provide instances of a type.
   * The provider can have dependencies, they will be resolved as in any other implementation type
   * @param providerType The provider type that will create instances of a type
   * @param mappedType The type that the provider will create instances of
   */
  registerSingletonProvider<T, I extends T>(
    providerType: NewableService<Provider<I>>,
    mappedType: Function & { prototype: T },
  ) {
    this.registerSingleton(providerType);
    const getInstance = (type: NewableService<Provider<I>>) => this.getInstance<Provider<I>>(type);
    // it is not possible to use the "new" keyword on arrow function, hence the anonymous function
    // eslint-disable-next-line func-names
    const providerProxy = function () {
      return getInstance(providerType).get();
    } as unknown as Implementation<T>;
    this.registerSingleton(providerProxy, mappedType);
  }

  /**
   * Retrieve an instance of a type that has been registered
   * (cf {@link registerSingleton} and {@link registerSingletonProvider})
   * @param type The type for which an instance of is required
   */
  getInstance<T>(type: Function & { prototype: T }): T {
    return this.container.get({ identifier: Injector.getTypeName(type) });
  }

  /**
   * Verify if an instance of a type that has been registered
   * (cf {@link registerSingleton} and {@link registerSingletonProvider})
   * @param type The type for which the registration test is wanted
   */
  hasInstance<T>(type: Function & { prototype: T }): boolean {
    return this.container.has({ identifier: Injector.getTypeName(type) });
  }

  /**
   * Initialize all singleton instances: i.e. all constructors of mapped types implementation will be called.
   * This should be called after all types have been declared.
   *
   * This is useful:
   * - To make sure no construction errors arise as soon as the application starts:
   * it is better to discover these errors soon
   * - To start services which observe data from other services,
   * initialize everything enables to make sure all instances are doing their job
   */
  initializeSingletonInstances() {
    for (const registeredType of this.registeredTypes) {
      this.getInstance(registeredType);
    }
  }

  private static getTypeName<T>(type: Function & { prototype: T } | Implementation<T>) : string {
    const typeName = (type as any)[Injector.CONSTRUCTOR_NAME_SYMBOL];
    if (typeName) {
      return typeName;
    }
    // eslint-disable-next-line no-console
    console.warn(`Cannot find type name,
    make sure the "ts-transformer-classname" is correctly executed, returning "${type.name}"`, type);
    return type.name;
  }
}

import { Implementation } from '@wessberg/di/dist/esm/implementation/implementation';
import { Logger } from 'simple-logging-system';
import { CONSTRUCTOR_ARGUMENTS_SYMBOL } from '@wessberg/di';

const logger = new Logger('SingletonInstances');

export default class SingletonInstances {
  private readonly createdInstances = new Map<Implementation<any>, object>();

  singletonProxy(singletonType: Implementation<any>): Implementation<any> {
    const { createdInstances } = this;
    // it is not possible to use the "new" keyword on arrow function, hence the anonymous function
    // eslint-disable-next-line func-names
    const singletonProxy: Implementation<any> = function (...args: any[]) {
      const previousInstance = createdInstances.get(singletonType);
      if (previousInstance) {
        return previousInstance;
      }
      try {
        // eslint-disable-next-line new-cap
        const newInstance = new singletonType(...args);
        createdInstances.set(singletonType, newInstance);
        return newInstance;
      } catch (e) {
        logger.error(`Cannot create instance of '${singletonType.name}'`, e);
        logger.error(`Detailed args for '${singletonType.name}'`, args);
        logger.error(`Detailed implementation for '${singletonType.name}': ${singletonType}`);
        return null;
      }
      // `as any` is required to force TS compiler to accept the function as type of Implementation<any>
    } as any;
    // DI Compiler magic add the property CONSTRUCTOR_ARGUMENTS_SYMBOL to class objects,
    // so we need to attach this property CONSTRUCTOR_ARGUMENTS_SYMBOL for the proxy
    // to make sure DI will find the constructor arguments in the proxy
    Object.defineProperty(
      singletonProxy,
      CONSTRUCTOR_ARGUMENTS_SYMBOL,
      { value: singletonType[CONSTRUCTOR_ARGUMENTS_SYMBOL] },
    );
    return singletonProxy;
  }
}

Plume TS DI
===========

Lightweight & simple [dependency injection system](https://github.com/google/guice/wiki/Motivation) for TypeScript based on code generation instead of annotation.

The features offered by this library are kept small. Having just a small set of features enables to:
- Keep this library simple & easy to maintain
- Force projets to correctly design their code and to fully avoid circular dependencies

Installation
------------
1. Add compile time dependency in the `package.json` file: `npm install plume-ts-di`
2. Make sure [ttypescript](https://github.com/cevek/ttypescript) is installed or make sure [to have a way](https://github.com/madou/typescript-transformer-handbook#consuming-transformers) to run [TS transformers](https://github.com/madou/typescript-transformer-handbook)
3. Add the two transformers that add project JS class information about constructors: `npm -D install ts-transformer-classname @wessberg/di-compiler`
4. If using ttypescript, declare the transformers in `tsconfig.json` file:
```json
"plugins": [
   {"transform": "./di-transformer-adapter.ts" },
   {"transform": "ts-transformer-classname" }
]
```
Note that the `di-compiler` might be difficult to configure, that's why it can be easier to create a `di-transformer-adapter.ts` file in the project and use this file in the `tsconfig.json` declaration:
```typescript
import { di } from "@wessberg/di-compiler";
import * as ts from 'typescript';

export default function(program: ts.Program) {
  return di({ program });
}
```
5. Plume TS DI can now [be used](#usage)

Usage
-----
1. Write your classes as usual without any annotation :). Make sure **all classes have a unique name**: the class name is used as a key in the dependency injection system. 
2. Declare a module (you should have one module per module of your application), for example:
```typescript
export default function installServicesModule(injector: Injector) {
  // bindings, all classes in the DI system must be declared here
  injector.registerSingleton(LocaleService);
  injector.registerSingleton(IdlenessDetector);
  injector.registerSingleton(SessionService);
  injector.registerSingleton(ObservableNotificationEngine);
  injector.registerSingleton(ObservableNotificationEngine, NotificationEngine);
  injector.registerSingleton(Scheduler);
}
```
3. Create & use an `Injector` in your application entry point, generally `index.ts`:
```typescript
const injector = new Injector();
installServicesModule(injector);
// you can now get instances of your singletons :
const instance = injector.getInstance(IdlenessDetector);
```

About interfaces
----------------
TS Interfaces are not compiled into JS and it poses problems with DI. Abstract classes must be used instead.
Abstract classes can be implemented as interfaces in TS.

Provider pattern
----------------
The [provider pattern in DI](https://github.com/google/guice/wiki/InjectingProviders) can be used to have logic added in classes creation, or if you want to have instances of external libraries which do not offer Plume TS DI bindings.
Here is an exemple of creating `NativeService` or `BrowserService` (both implementing `Service`) depending on the existence of a native JS function:
```typescript
export default class ServiceProvider implements Provider<Service> {
  private readonly service: Service;
  
  constructor(private nativeService: NativeService, private browserService: BrowserService) {
    if (typeof nativeFunction === 'function') {
      this.service = nativeService;
    } else {
      this.service = browserService;
    }
  }
  
  get(): Service {
    return this.service;
  }
}
```

This can then be registered in the `Injector`: `injector.registerSingletonProvider(ServiceProvider, Service);`

And voilà, it is now possible to get the correct instance of `Service` anywhere in the application: `constructor(private readonly service: Service)`

Global Injector instance
------------------------
Sometimes and especially to integrate with [React](https://github.com/facebook/react/) it is easier to use a global instance of the Injector in React components.
To implement this pattern, two functions are provided:
- `configureGlobalInjector(Injector)`: Configure the global instance of the injector (should be called in `index.ts` after the global `Injector` has been fully configured)
- `getGlobalInstance(ClassType)`: To get an instance of a type in the global `Injector`

For example in `index.ts`:
```typescript
const injector = new Injector();
installServicesModule(injector);
installComponentsModule(injector);
installApiModule(injector);
// to be called after the injector has been configured
configureGlobalInjector(injector);
```

And in a React component:
```typescript
export default function Login() {
  const sessionService = getGlobalInstance(SessionService);
  const messageService = getGlobalInstance(MessageService);

  // return ...
}
```

Integrating with React or Vue
-----------------------------
To integrate with React or Vue, data passed from the dependency injection system to the React/Vue components should rely on the Observable pattern:
- https://rxjs.dev/
- https://github.com/BeTomorrow/micro-observables

The Observable pattern integrates way better than other alternatives like Redux.

Moreover, it is generally easier to integrate inside UI component using the [global Injector instance](#global-injector-instance).

Instances creation
------------------
Instances are created as they are needed. If you want to initialize all instances at startup (which is often a good thing to do), you need to call the method `initializeSingletonInstances()` on the `Injector`:
```typescript
const injector = new Injector();
installServicesModule(injector);
// to be called after the injector has been configured
injector.initializeSingletonInstances();
```

Dependencies
------------
Plume TS DI relies on:
- [simple-logging-system](https://github.com/coreoz/simple-logging-system) for logging
- [DI](https://github.com/wessberg/DI) a dependency injection library that works great but which has some unresolved bug and missing features (fixed in Plume TS DI)
- [DI Compiler](https://github.com/wessberg/di-compiler) The [TypeScript transformer](https://github.com/madou/typescript-transformer-handbook) used by DI. This transformer is currently still required by Plume TS DI

Release process
---------------
1. run `npm login`
2. run `npm run release` <= yarn **must not** be used

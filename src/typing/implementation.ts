import { NewableService } from './newable-service';
import { CustomConstructableService } from './custom-constructable-service';
import { IWithConstructorArgumentsSymbol } from './constructor-argument';

export declare type Implementation<T> = NewableService<T> & IWithConstructorArgumentsSymbol;
export declare type ImplementationInstance<T> = CustomConstructableService<T> & IWithConstructorArgumentsSymbol;

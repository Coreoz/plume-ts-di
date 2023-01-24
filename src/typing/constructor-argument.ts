import { CONSTRUCTOR_ARGUMENTS_SYMBOL } from '@wessberg/di';

export declare type ConstructorArgument = string | undefined;
export interface IWithConstructorArgumentsSymbol {
  [CONSTRUCTOR_ARGUMENTS_SYMBOL]?: ConstructorArgument[];
}

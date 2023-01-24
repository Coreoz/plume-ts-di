import { di } from '@wessberg/di-compiler';
import * as ts from 'typescript';

/**
 * Transformer used for dependency injection
 */
export function diTransformerAdapter(program: ts.Program) {
  return di({ program });
}

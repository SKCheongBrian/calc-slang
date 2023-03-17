// import cs from 'estree'
import * as cs from '../tree/ctree'

// It is necessary to write this type guard like this as the 'type' of both
// 'Directive' & 'ExpressionStatement' is 'ExpressionStatement'.
//
// export interface Directive extends BaseNode {
//   type: "ExpressionStatement";
//   expression: Literal;
//   directive: string;
// }
//
// export interface ExpressionStatement extends BaseStatement {
//   type: "ExpressionStatement";
//   expression: Expression;
// }
//
// As such, we check whether the 'directive' property exists on the object
// instead in order to differentiate between the two.
export const isDirective = (node: cs.Node): node is cs.Directive => {
  return 'directive' in node
}

export const isModuleDeclaration = (node: cs.Node): node is cs.ModuleDeclaration => {
  return [
    'ImportDeclaration',
    'ExportNamedDeclaration',
    'ExportDefaultDeclaration',
    'ExportAllDeclaration'
  ].includes(node.type)
}

export const isStatement = (
  node: cs.Directive | cs.Statement | cs.ModuleDeclaration
): node is cs.Statement => {
  return !isDirective(node) && !isModuleDeclaration(node)
}

export function isDeclaration(node: cs.Node): node is cs.Declaration {
  // export type Declaration =
  //       FunctionDeclaration | VariableDeclaration | ClassDeclaration;
  return (
    node.type === 'VariableDeclaration' ||
    node.type === 'FunctionDeclaration' ||
    node.type === 'ClassDeclaration'
  )
}

export function isImportDeclaration(node: cs.Node): node is cs.ImportDeclaration {
  return node.type === 'ImportDeclaration'
}

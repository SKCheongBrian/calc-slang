// import * as cs from 'estree'
import * as cs from '../tree/ctree'

import { AllowedDeclarations, BlockExpression, FunctionDeclarationExpression } from '../types'

export const getVariableDecarationName = (decl: cs.VariableDeclaration) =>
  (decl.declarations[0].id as cs.Identifier).name

export const locationDummyNode = (line: number, column: number) =>
  literal('Dummy', { start: { line, column }, end: { line, column } })

export const identifier = (name: string, loc?: cs.SourceLocation | null): cs.Identifier => ({
  type: 'Identifier',
  name,
  loc
})

export const literal = (
  value: string | number | boolean | null,
  loc?: cs.SourceLocation | null
): cs.Literal => ({
  type: 'Literal',
  value,
  loc
})

export const memberExpression = (
  object: cs.Expression,
  property: string | number
): cs.MemberExpression => ({
  type: 'MemberExpression',
  object,
  computed: typeof property === 'number',
  optional: false,
  property: typeof property === 'number' ? literal(property) : identifier(property)
})

export const declaration = (
  name: string,
  kind: AllowedDeclarations,
  init: cs.Expression,
  loc?: cs.SourceLocation | null
): cs.VariableDeclaration => ({
  type: 'VariableDeclaration',
  declarations: [
    {
      type: 'VariableDeclarator',
      id: identifier(name),
      init
    }
  ],
  kind,
  loc
})

export const constantDeclaration = (
  name: string,
  init: cs.Expression,
  loc?: cs.SourceLocation | null
) => declaration(name, 'const', init, loc)

export const callExpression = (
  callee: cs.Expression,
  args: cs.Expression[],
  loc?: cs.SourceLocation | null
): cs.CallExpression => ({
  type: 'CallExpression',
  callee,
  arguments: args,
  optional: false,
  loc
})

export const expressionStatement = (expression: cs.Expression): cs.ExpressionStatement => ({
  type: 'ExpressionStatement',
  expression
})

export const blockArrowFunction = (
  params: cs.Identifier[],
  body: cs.Statement[] | cs.BlockStatement,
  loc?: cs.SourceLocation | null
): cs.ArrowFunctionExpression => ({
  type: 'ArrowFunctionExpression',
  expression: false,
  generator: false,
  params,
  body: Array.isArray(body) ? blockStatement(body) : body,
  loc
})

export const functionExpression = (
  params: cs.Pattern[],
  body: cs.Statement[] | cs.BlockStatement,
  loc?: cs.SourceLocation | null
): cs.FunctionExpression => ({
  type: 'FunctionExpression',
  id: null,
  async: false,
  generator: false,
  params,
  body: Array.isArray(body) ? blockStatement(body) : body,
  loc
})

export const blockStatement = (body: cs.Statement[]): cs.BlockStatement => ({
  type: 'BlockStatement',
  body
})

export const program = (body: cs.Statement[]): cs.Program => ({
  type: 'Program',
  sourceType: 'module',
  body
})

export const returnStatement = (
  argument: cs.Expression,
  loc?: cs.SourceLocation | null
): cs.ReturnStatement => ({
  type: 'ReturnStatement',
  argument,
  loc
})

export const property = (key: string, value: cs.Expression): cs.Property => ({
  type: 'Property',
  method: false,
  shorthand: false,
  computed: false,
  key: identifier(key),
  value,
  kind: 'init'
})

export const objectExpression = (properties: cs.Property[]): cs.ObjectExpression => ({
  type: 'ObjectExpression',
  properties
})

export const mutateToCallExpression = (
  node: cs.Node,
  callee: cs.Expression,
  args: cs.Expression[]
) => {
  node.type = 'CallExpression'
  node = node as cs.CallExpression
  node.callee = callee
  node.arguments = args
}

export const mutateToAssignmentExpression = (
  node: cs.Node,
  left: cs.Pattern,
  right: cs.Expression
) => {
  node.type = 'AssignmentExpression'
  node = node as cs.AssignmentExpression
  node.operator = '='
  node.left = left
  node.right = right
}

export const mutateToExpressionStatement = (node: cs.Node, expr: cs.Expression) => {
  node.type = 'ExpressionStatement'
  node = node as cs.ExpressionStatement
  node.expression = expr
}

export const mutateToReturnStatement = (node: cs.Node, expr: cs.Expression) => {
  node.type = 'ReturnStatement'
  node = node as cs.ReturnStatement
  node.argument = expr
}

export const mutateToMemberExpression = (
  node: cs.Node,
  obj: cs.Expression,
  prop: cs.Expression
) => {
  node.type = 'MemberExpression'
  node = node as cs.MemberExpression
  node.object = obj
  node.property = prop
  node.computed = false
}

export const logicalExpression = (
  operator: cs.LogicalOperator,
  left: cs.Expression,
  right: cs.Expression,
  loc?: cs.SourceLocation | null
): cs.LogicalExpression => ({
  type: 'LogicalExpression',
  operator,
  left,
  right,
  loc
})

export const mutateToConditionalExpression = (
  node: cs.Node,
  test: cs.Expression,
  consequent: cs.Expression,
  alternate: cs.Expression
) => {
  node.type = 'ConditionalExpression'
  node = node as cs.ConditionalExpression
  node.test = test
  node.consequent = consequent
  node.alternate = alternate
}

export const conditionalExpression = (
  test: cs.Expression,
  consequent: cs.Expression,
  alternate: cs.Expression,
  loc?: cs.SourceLocation | null
): cs.ConditionalExpression => ({
  type: 'ConditionalExpression',
  test,
  consequent,
  alternate,
  loc
})

export const arrayExpression = (elements: cs.Expression[]): cs.ArrayExpression => ({
  type: 'ArrayExpression',
  elements
})

export const assignmentExpression = (
  left: cs.Identifier | cs.MemberExpression,
  right: cs.Expression
): cs.AssignmentExpression => ({
  type: 'AssignmentExpression',
  operator: '=',
  left,
  right
})

export const binaryExpression = (
  operator: cs.BinaryOperator,
  left: cs.Expression,
  right: cs.Expression,
  loc?: cs.SourceLocation | null
): cs.BinaryExpression => ({
  type: 'BinaryExpression',
  operator,
  left,
  right,
  loc
})

export const unaryExpression = (
  operator: cs.UnaryOperator,
  argument: cs.Expression,
  loc?: cs.SourceLocation | null
): cs.UnaryExpression => ({
  type: 'UnaryExpression',
  operator,
  prefix: true,
  argument,
  loc
})

// primitive: undefined is a possible value
export const primitive = (value: any): cs.Expression => {
  return value === undefined ? identifier('undefined') : literal(value)
}

export const functionDeclarationExpression = (
  id: cs.Identifier,
  params: cs.Pattern[],
  body: cs.BlockStatement,
  loc?: cs.SourceLocation | null
): FunctionDeclarationExpression => ({
  type: 'FunctionExpression',
  id,
  params,
  body,
  loc
})

export const functionDeclaration = (
  id: cs.Identifier | null,
  params: cs.Pattern[],
  body: cs.BlockStatement,
  loc?: cs.SourceLocation | null
): cs.FunctionDeclaration => ({
  type: 'FunctionDeclaration',
  id,
  params,
  body,
  loc
})

export const blockExpression = (
  body: cs.Statement[],
  loc?: cs.SourceLocation | null
): BlockExpression => ({
  type: 'BlockExpression',
  body,
  loc
})

export const arrowFunctionExpression = (
  params: cs.Pattern[],
  body: cs.Expression | cs.BlockStatement,
  loc?: cs.SourceLocation | null
): cs.ArrowFunctionExpression => ({
  type: 'ArrowFunctionExpression',
  expression: body.type !== 'BlockStatement',
  generator: false,
  params,
  body,
  loc
})

export const variableDeclaration = (
  declarations: cs.VariableDeclarator[],
  loc?: cs.SourceLocation | null
): cs.VariableDeclaration => ({
  type: 'VariableDeclaration',
  kind: 'const',
  declarations,
  loc
})

export const variableDeclarator = (
  id: cs.Pattern,
  init: cs.Expression,
  loc?: cs.SourceLocation | null
): cs.VariableDeclarator => ({
  type: 'VariableDeclarator',
  id,
  init,
  loc
})

export const ifStatement = (
  test: cs.Expression,
  consequent: cs.BlockStatement,
  alternate: cs.Statement,
  loc?: cs.SourceLocation | null
): cs.IfStatement => ({
  type: 'IfStatement',
  test,
  consequent,
  alternate,
  loc
})

export const whileStatement = (
  body: cs.BlockStatement,
  test: cs.Expression,
  loc?: cs.SourceLocation | null
): cs.WhileStatement => ({
  type: 'WhileStatement',
  test,
  body,
  loc
})

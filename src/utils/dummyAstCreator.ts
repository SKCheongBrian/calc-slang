// import * as cs from 'estree'
import * as cs from '../tree/ctree'
import { BlockExpression } from '../types'

const DUMMY_STRING = '__DUMMY__'
const DUMMY_UNARY_OPERATOR = '!'
const DUMMY_LOGICAL_OPERATOR = '||'
const DUMMY_BINARY_OPERATOR = '+'

export const dummyLocation = (): cs.SourceLocation => ({
  start: { line: -1, column: -1 },
  end: { line: -1, column: -1 }
})

export const dummyIdentifier = (): cs.Identifier => ({
  type: 'Identifier',
  name: DUMMY_STRING
})

export const dummyLiteral = (): cs.Literal => ({
  type: 'Literal',
  value: DUMMY_STRING,
  loc: dummyLocation()
})

export const dummyExpression = (): cs.Expression => dummyLiteral() as cs.Expression

export const dummyCallExpression = (): cs.CallExpression => ({
  type: 'CallExpression',
  callee: dummyExpression(),
  arguments: [],
  loc: dummyLocation(),
  optional: false
})

export const dummyExpressionStatement = (): cs.ExpressionStatement => ({
  type: 'ExpressionStatement',
  expression: dummyExpression(),
  loc: dummyLocation()
})

export const dummyStatement = (): cs.Statement => dummyExpressionStatement() as cs.Statement

export const dummyBlockStatement = (): cs.BlockStatement => ({
  type: 'BlockStatement',
  body: [],
  loc: dummyLocation()
})

export const dummyArrowFunctionExpression = (): cs.ArrowFunctionExpression => ({
  type: 'ArrowFunctionExpression',
  expression: false,
  generator: false,
  params: [],
  body: dummyBlockStatement(),
  loc: dummyLocation()
})

export const dummyProgram = (): cs.Program => ({
  type: 'Program',
  body: [],
  loc: dummyLocation(),
  sourceType: 'module'
})

export const dummyReturnStatement = (): cs.ReturnStatement => ({
  type: 'ReturnStatement',
  argument: dummyExpression(),
  loc: dummyLocation()
})

/*
export const property = (): es.Property => ({
  type: 'Property',
  method: false,
  shorthand: false,
  computed: false,
  key: dummyIdentifier(),
  value: dummyExpression(),
  kind: 'init'
})

export const objectExpression = (properties: es.Property[]): es.ObjectExpression => ({
  type: 'ObjectExpression',
  properties
})

export const mutateToCallExpression = (
  node: es.Node,
  callee: es.Expression,
  args: es.Expression[]
) => {
  node.type = 'CallExpression'
  node = node as es.CallExpression
  node.callee = callee
  node.arguments = args
}
*/

export const dummyLogicalExpression = (): cs.LogicalExpression => ({
  type: 'LogicalExpression',
  operator: DUMMY_LOGICAL_OPERATOR,
  left: dummyExpression(),
  right: dummyExpression(),
  loc: dummyLocation()
})

export const dummyConditionalExpression = (): cs.ConditionalExpression => ({
  type: 'ConditionalExpression',
  test: dummyExpression(),
  consequent: dummyExpression(),
  alternate: dummyExpression(),
  loc: dummyLocation()
})

export const dummyArrayExpression = (): cs.ArrayExpression => ({
  type: 'ArrayExpression',
  elements: [],
  length: dummyExpression()
})

export const dummyBinaryExpression = (): cs.BinaryExpression => ({
  type: 'BinaryExpression',
  operator: DUMMY_BINARY_OPERATOR,
  left: dummyExpression(),
  right: dummyExpression(),
  loc: dummyLocation()
})

export const dummyUnaryExpression = (): cs.UnaryExpression => ({
  type: 'UnaryExpression',
  operator: DUMMY_UNARY_OPERATOR,
  prefix: true,
  argument: dummyExpression(),
  loc: dummyLocation()
})

// primitive: undefined is a possible value
export const dummyPrimitive = (): cs.Expression => dummyLiteral()

export const dummyFunctionExpression = (): cs.FunctionExpression => ({
  type: 'FunctionExpression',
  id: dummyIdentifier(),
  params: [],
  body: dummyBlockStatement(),
  loc: dummyLocation()
})

export const dummyFunctionDeclaration = (): cs.FunctionDeclaration => ({
  type: 'FunctionDeclaration',
  id: dummyIdentifier(),
  params: [],
  body: dummyBlockStatement(),
  loc: dummyLocation()
})

export const dummyBlockExpression = (): BlockExpression => ({
  type: 'BlockExpression',
  body: [],
  loc: dummyLocation()
})

export const dummyVariableDeclarator = (): cs.VariableDeclarator => ({
  type: 'VariableDeclarator',
  id: dummyIdentifier(),
  init: dummyExpression(),
  loc: dummyLocation()
})

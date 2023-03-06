import { Identifier } from '../tree/ctree'
/* tslint:disable:max-classes-per-file */
// import * as cs from 'estree'
import * as cs from '../tree/ctree'
import { isUndefined, reduce, uniqueId } from 'lodash'

import { createGlobalEnvironment } from '../createContext'
import * as errors from '../errors/errors'
import { RuntimeSourceError } from '../errors/runtimeSourceError'
import { is_undefined } from '../stdlib/misc'
import { Context, Environment, Frame, Value } from '../types'
import {
  evaluateBinaryExpression,
  evaluateUnaryExpression,
  evaluateUpdateExpression
} from '../utils/operators'
import * as rttc from '../utils/rttc'
import { UndefinedVariable } from './../errors/errors'
import { DoWhileStatementContext } from './../lang/CalcParser'
import Closure from './closure'

class Thunk {
  public value: Value
  public isMemoized: boolean
  constructor(public exp: cs.Node, public env: Environment) {
    this.isMemoized = false
    this.value = null
  }
}

class BreakValue {}

function* forceIt(val: any, context: Context): Value {
  if (val instanceof Thunk) {
    if (val.isMemoized) return val.value

    pushEnvironment(context, val.env)
    const evalRes = yield* actualValue(val.exp, context)
    popEnvironment(context)
    val.value = evalRes
    val.isMemoized = true
    return evalRes
  } else return val
}

function isFalse(v: any) {
  return v === 0
}

export function* actualValue(exp: cs.Node, context: Context): Value {
  const evalResult = yield* evaluate(exp, context)
  const forced = yield* forceIt(evalResult, context)
  console.log('-------------------')
  console.log('actual Value: ' + forced)
  return forced
}

const handleRuntimeError = (context: Context, error: RuntimeSourceError): never => {
  context.errors.push(error)
  context.runtime.environments = context.runtime.environments.slice(
    -context.numberOfOuterEnvironments
  )
  throw error
}

function* visit(context: Context, node: cs.Node) {
  context.runtime.nodes.unshift(node)
  yield context
}

function* reduceIf(
  node: cs.IfStatement | cs.ConditionalExpression,
  context: Context
): IterableIterator<null | cs.Node> {
  const test = yield* actualValue(node.test, context)
  return isFalse(test) ? node.alternate : node.consequent
}

function* leave(context: Context) {
  context.runtime.break = false
  context.runtime.nodes.shift()
  yield context
}

/* -------------------------------------------------------------------------- */
/*                                  Variable                                  */
/* -------------------------------------------------------------------------- */

const makeVar = (context: Context, symbol: string, val: any) => {
  const env = currEnv(context)
  console.log('context:-----')
  console.log(context)
  console.log('-------------')
  console.log('env:---------')
  console.log(env)
  console.log('-------------')
  // TODO: map name to address instead value
  Object.defineProperty(env.head, symbol, {
    value: val,
    writable: true
  })
}

const getVar = (context: Context, name: string) => {
  let env: Environment | null = currEnv(context)
  while (env) {
    if (env.head.hasOwnProperty(name)) {
      console.log('from env head(env mappings):-----')
      console.log(env.head)
      console.log('-------------------')
      // TODO change to heap look up address
      return env.head[name]
    }
    env = env.tail
  }
}

const setVar = (context: Context, name: string, value: any) => {
  let env: Environment | null = currEnv(context)
  // look through environment frames
  while (env) {
    if (env.head.hasOwnProperty(name)) {
      env.head[name] = value
      return undefined
    }
    env = env.tail
  }
  return handleRuntimeError(context, new errors.UndefinedVariable(name, context.runtime.nodes[0]))
}

/* -------------------------------------------------------------------------- */
/*                                 Environment                                */
/* -------------------------------------------------------------------------- */

const currEnv = (c: Context) => c.runtime.environments[0]
const popEnvironment = (context: Context) => context.runtime.environments.shift()
export const pushEnvironment = (context: Context, environment: Environment) => {
  context.runtime.environments.unshift(environment)
  context.runtime.environmentTree.insert(environment)
}

export const createBlockEnv = (
  context: Context,
  name = 'blockEnvironment',
  head: Frame = {}
): Environment => {
  return {
    name,
    tail: currEnv(context),
    head,
    id: uniqueId()
  }
}

export type Evaluator<T extends cs.Node> = (node: T, context: Context) => IterableIterator<Value>

function* evaluateBlockSatement(context: Context, node: cs.BlockStatement) {
  let result
  for (const statement of node.body) {
    result = yield* evaluate(statement, context)
  }
  return result
}

/**
 * WARNING: Do not use object literal shorthands, e.g.
 *   {
 *     *Literal(node: es.Literal, ...) {...},
 *     *ThisExpression(node: es.ThisExpression, ..._ {...},
 *     ...
 *   }
 * They do not minify well, raising uncaught syntax errors in production.
 * See: https://github.com/webpack/webpack/issues/7566
 */
// tslint:disable:object-literal-shorthand
// prettier-ignore
export const evaluators: { [nodeType: string]: Evaluator<cs.Node> } = {
  /** Simple Values */
  Literal: function* (node: cs.Literal, _context: Context) {
    return node.value
  },

  TemplateLiteral: function* (node: cs.TemplateLiteral) {
    // Expressions like `${1}` are not allowed, so no processing needed
    return node.quasis[0].value.cooked
  },

  ThisExpression: function* (node: cs.ThisExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  ArrayExpression: function* (node: cs.ArrayExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },


  FunctionExpression: function* (node: cs.FunctionExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  ArrowFunctionExpression: function* (node: cs.ArrowFunctionExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  Identifier: function* (node: cs.Identifier, context: Context) {
    const name = node.name
    return getVar(context, name)
  },

  CallExpression: function* (node: cs.CallExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  NewExpression: function* (node: cs.NewExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  UnaryExpression: function* (node: cs.UnaryExpression, context: Context) {
    const value = yield* actualValue(node.argument, context)

    const error = rttc.checkUnaryExpression(node, node.operator, value)
    if (error) {
      return handleRuntimeError(context, error)
    }
    return evaluateUnaryExpression(node.operator, value)
  },

  /**
   * Will return the new updated value if prefix is true else will return the old value
   * currently only used for "++" and "--" operators
   * @param node the update expression node
   * @param context current context
   * @returns value after applying the operator
   */
  UpdateExpression: function* (node: cs.UpdateExpression, context: Context) {
    const value = yield* actualValue(node.argument, context)
    console.log("------------------------")
    console.log("value " + value)
    console.log("------------------------")

    const error = rttc.checkUpdateExpression(node, node.operator, value)
    if (error) {
      return handleRuntimeError(context, error)
    }
    const final_value = evaluateUpdateExpression(node.operator, value)
    console.log("------------------------")
    console.log("final_value " + final_value)
    console.log("------------------------")
    setVar(context, (node.argument as cs.Identifier).name, final_value)
    return node.prefix ? final_value : value
  },

  BinaryExpression: function* (node: cs.BinaryExpression, context: Context) {
    const left = yield* actualValue(node.left, context)
    const right = yield* actualValue(node.right, context)
    const error = rttc.checkBinaryExpression(node, node.operator, left, right)
    if (error) {
      return handleRuntimeError(context, error)
    }
    return evaluateBinaryExpression(node.operator, left, right)
  },

  ConditionalExpression: function* (node: cs.ConditionalExpression, context: Context) {
    return yield* this.IfStatement(node, context)
  },

  LogicalExpression: function* (node: cs.LogicalExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  VariableDeclaration: function* (node: cs.VariableDeclaration, context: Context) {
    const len = node.declarations.length
    for (let i = 0; i < len; i++) {
      const declaration = node.declarations[i]
      const identifier = declaration.id as cs.Identifier
      const symbol = identifier.name
      const init = (declaration.init == null || isUndefined(declaration.init))
          ? undefined
          : yield* actualValue(declaration.init, context)
      makeVar(context, symbol, init)
    }
    return undefined
  },

  ContinueStatement: function* (_node: cs.ContinueStatement, _context: Context) {
    throw new Error(`not supported yet: ${_node.type}`)
  },

  BreakStatement: function* (_node: cs.BreakStatement, _context: Context) {
    throw new Error(`not supported yet: ${_node.type}`)
  },

  ForStatement: function* (node: cs.ForStatement, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },


  AssignmentExpression: function* (node: cs.AssignmentExpression, context: Context) {
    if (node.left.type === "Identifier") {
      const id = node.left as cs.Identifier
      const name = id.name
      const value = yield* evaluate(node.right, context)
      switch (node.operator) {
        case "=": {
          setVar(context, name, value)
          return value
        }
        case "+=": {
          const currVal = getVar(context, name)
          const newVal = evaluateBinaryExpression("+", currVal, value)
          setVar(context, name, newVal)
          return newVal
        }
        case "-=": {
          const currVal = getVar(context, name)
          const newVal = evaluateBinaryExpression("-", currVal, value)
          setVar(context, name, newVal)
          return newVal
        }
        case "*=": {
          const currVal = getVar(context, name)
          const newVal = evaluateBinaryExpression("*", currVal, value)
          setVar(context, name, newVal)
          return newVal
        }
        case "/=": {
          const currVal = getVar(context, name)
          const newVal = evaluateBinaryExpression("/", currVal, value)
          setVar(context, name, newVal)
          return newVal
        }
        case "%=": {
          const currVal = getVar(context, name)
          const newVal = evaluateBinaryExpression("%", currVal, value)
          setVar(context, name, newVal)
          return newVal
        }
        // TODO add more of the assignment stuff
        default: {
          // ! not sure if this is correctly set
          return undefined
        }
      }
    }
  },

  FunctionDeclaration: function* (node: cs.FunctionDeclaration, context: Context) {
    const id = node.id
    if (id === null) {
      throw new Error("This should have been caught during parsing.")
    }
    const closure = new Closure(node.params as Identifier[], node.body, currEnv(context), context)
    makeVar(context, id.name, closure)
  },

  IfStatement: function* (node: cs.IfStatement | cs.ConditionalExpression, context: Context) {
    const result = yield* reduceIf(node, context)
    if (result === null) {
      return undefined
    }
    return yield* evaluate(result, context)
  },

  ExpressionStatement: function* (node: cs.ExpressionStatement, context: Context) {
    return yield* evaluate(node.expression, context)
  },

  ReturnStatement: function* (node: cs.ReturnStatement, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  WhileStatement: function* (node: cs.WhileStatement, context: Context) {
    let value: any
    while (
      ((yield* actualValue(node.test, context)) !== 0) &&
      !(value instanceof BreakValue)
    ) {
      value = yield* actualValue(node.body, context)
    }
    if (value instanceof BreakValue) {
      return undefined
    }
    return value
  },

  DoWhileStatement: function* (node: cs.DoWhileStatement, context: Context) {
    let value: any
    value = yield* actualValue(node.body, context)
    while (
      ((yield* actualValue(node.test, context)) !== 0) &&
      !(value instanceof BreakValue)
    ) {
      value = yield* actualValue(node.body, context)
    }
    if (value instanceof BreakValue) {
      return undefined
    }
    return value
  },

  BlockStatement: function* (node: cs.BlockStatement, context: Context) {
    const env = createBlockEnv(context, 'blockEnvironment')
    pushEnvironment(context, env)
    const result = yield* evaluateBlockSatement(context, node)
    popEnvironment(context)
    return result
  },

  Program: function* (node: cs.BlockStatement, context: Context) {
    context.numberOfOuterEnvironments++
    const env = createGlobalEnvironment()
    pushEnvironment(context, env)
    const result = yield* forceIt(yield* evaluateBlockSatement(context, node), context);
    return result;
  }
}
// tslint:enable:object-literal-shorthand

export function* evaluate(node: cs.Node, context: Context) {
  console.log('current node:--------')
  console.log(node)
  console.log('---------------------')
  const result = yield* evaluators[node.type](node, context)
  yield* leave(context)
  return result
}

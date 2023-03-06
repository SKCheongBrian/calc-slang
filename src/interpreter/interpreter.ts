import { BinaryOperator } from 'estree'
/* tslint:disable:max-classes-per-file */
import * as es from 'estree'
import { isUndefined, uniqueId } from 'lodash'

import { createGlobalEnvironment } from '../createContext'
import * as errors from '../errors/errors'
import { RuntimeSourceError } from '../errors/runtimeSourceError'
import { Context, Environment, Frame, Value } from '../types'
import { evaluateBinaryExpression, evaluateUnaryExpression } from '../utils/operators'
import * as rttc from '../utils/rttc'
import { createEmptyContext } from './../createContext'

class Thunk {
  public value: Value
  public isMemoized: boolean
  constructor(public exp: es.Node, public env: Environment) {
    this.isMemoized = false
    this.value = null
  }
}

let A: any[]
let S: any[]

// ? Commenting out since it calls evaluate
// function* forceIt(val: any, context: Context): Value {
//   if (val instanceof Thunk) {
//     if (val.isMemoized) return val.value

//     pushEnvironment(context, val.env)
//     const evalRes = yield* actualValue(val.exp, context)
//     popEnvironment(context)
//     val.value = evalRes
//     val.isMemoized = true
//     return evalRes
//   } else return val
// }

// ? Commenting out since it calls evaluate
// export function* actualValue(exp: es.Node, context: Context): Value {
//   const evalResult = yield* evaluate(exp, context)
//   const forced = yield* forceIt(evalResult, context)
//   return forced
// }

const handleRuntimeError = (context: Context, error: RuntimeSourceError): never => {
  context.errors.push(error)
  context.runtime.environments = context.runtime.environments.slice(
    -context.numberOfOuterEnvironments
  )
  throw error
}

function* visit(context: Context, node: es.Node) {
  context.runtime.nodes.unshift(node)
  yield context
}

function* leave(context: Context) {
  context.runtime.break = false
  context.runtime.nodes.shift()
  yield context
}

export type Evaluator<T extends es.Node> = (node: T, context: Context) => IterableIterator<Value>

// function* evaluateBlockSatement(context: Context, node: es.BlockStatement) {
//   let result
//   for (const statement of node.body) {
//     result = yield* evaluate(statement, context)
//   }
//   return result
// }

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

const UNASSIGNED = { type: 'not_initialized' }

const create_unassigned = (locals: any[], context: Context) => {
  const env = currEnv(context)
  for (let i = 0; i < locals.length; i++) {
    const name = locals[i]
    makeVar(context, name, UNASSIGNED)
  }
}

/* -------------------------------------------------------------------------- */
/*                                    Body                                    */
/* -------------------------------------------------------------------------- */

const scan = (body_arr: any) => {
  const res = []
  for (let i = 0; i < body_arr.length; i++) {
    const statement: any = body_arr[i]
    if (statement.type === 'VariableDeclaration') {
      const len = statement.declarations.length
      for (let i = 0; i < len; i++) {
        const declaration = statement.declarations[i]
        const identifier = declaration.id as es.Identifier
        res.push(identifier.name)
      }
    } else if (statement.type === 'FunctionDeclaration') {
      res.push(statement.id.name)
    }
  }
  return res
}

const handle_body = (body: any, context: Context) => {
  if (body.length === 0) {
    return [[{ type: 'Literal', value: undefined }, context]]
  }
  const res = []
  let first = true
  for (const cmd of body) {
    first ? (first = false) : res.push([{ type: 'Pop_i' }, context])
    res.push([cmd, context])
  }
  return res.reverse()
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

/* -------------------------------------------------------------------------- */
/*                                  Microcode                                 */
/* -------------------------------------------------------------------------- */

export const evaluators: { [nodeType: string]: Evaluator<es.Node> } = {
  Pop_i: function* (node: any, _context: Context) {
    S.pop()
  },

  Pop_env: function* (node: any, context: Context) {
    popEnvironment(context)
  },
  /** Simple Values */
  Literal: function* (node: es.Literal, _context: Context) {
    S.push(node.value)
  },

  TemplateLiteral: function* (node: es.TemplateLiteral) {
    // Expressions like `${1}` are not allowed, so no processing needed
    return node.quasis[0].value.cooked
  },

  ThisExpression: function* (node: es.ThisExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  ArrayExpression: function* (node: es.ArrayExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },


  FunctionExpression: function* (node: es.FunctionExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  ArrowFunctionExpression: function* (node: es.ArrowFunctionExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  Identifier: function* (node: es.Identifier, context: Context) {
    S.push(getVar(context, node.name))
  },

  CallExpression: function* (node: es.CallExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  NewExpression: function* (node: es.NewExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  UnaryExpression: function* (node: es.UnaryExpression, context: Context) {
    A.push([{ type: "UnaryExpression_i", operator: node.operator }, context], [node.argument, context])
  },

  UnaryExpression_i: function* (node: any, context: Context) {
    const result = evaluateUnaryExpression(node.operator, S.pop())
    S.push(result)
  },

  BinaryExpression: function* (node: es.BinaryExpression, context: Context) {
    A.push([{ type: "BinaryExpression_i", operator: node.operator }, context], [node.left, context], [node.right, context])
  },

  // TODO: I'm not sure the type of node should be here since its a weird one
  BinaryExpression_i: function* (node: any, context: Context) {
    const result = evaluateBinaryExpression(node.operator, S.pop(), S.pop())
    console.log("result: " + result)
    S.push(result)
  },

  ConditionalExpression: function* (node: es.ConditionalExpression, context: Context) {
    A.push(
        [{type: 'Conditional_i', cons: node.consequent, alt: node.alternate}, context],
        [node.test, context]
      )
  },

  LogicalExpression: function* (node: es.LogicalExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  VariableDeclaration: function* (node: es.VariableDeclaration, context: Context) {
    const len = node.declarations.length
    for (let i = 0; i < len; i++) {
      const declaration = node.declarations[i]
      const identifier = declaration.id as es.Identifier
      // const symbol = identifier.name
      const init = (declaration.init == null || isUndefined(declaration.init))
        ? undefined
        : declaration.init
      A.push(
        [{type: 'Literal', value: undefined}, context],
        [{ type: "Pop_i" }, context],
        [{type: "AssignmentExpression", left: identifier, right: init, operator: "="}, context],
      )
    }
  },

  VarDec_i: function* (node: any, context: Context) {
    makeVar(context, node.symbol, S[S.length-1])
  },

  ContinueStatement: function* (_node: es.ContinueStatement, _context: Context) {
    throw new Error(`not supported yet: ${_node.type}`)
  },

  BreakStatement: function* (_node: es.BreakStatement, _context: Context) {
    throw new Error(`not supported yet: ${_node.type}`)
  },

  ForStatement: function* (node: es.ForStatement, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },


  AssignmentExpression: function* (node: es.AssignmentExpression, context: Context) {
    A.push([{ type: "Assignment_i", symbol: node.left }, context])
    console.log(node.operator);
    
    switch (node.operator) {
      case "=": {
        A.push([node.right, context])
        break
      }
      case "+=": {
        A.push([{ type: "BinaryExpression", operator: "+", left: node.left, right: node.right}, context])
        break
      }
      case "-=": {
        A.push([{ type: "BinaryExpression", operator: "-", left: node.left, right: node.right}, context])
        break
      }
      case "*=": {
        A.push([{ type: "BinaryExpression", operator: "*", left: node.left, right: node.right}, context])
        break
      }
      case "/=": {
        A.push([{ type: "BinaryExpression", operator: "/", left: node.left, right: node.right}, context])
        break
      }
      case "%=": {
        A.push([{ type: "BinaryExpression", operator: "%", left: node.left, right: node.right}, context])
        break
      }
      // TODO add more of the assignment stuff
      default: {
        // ! not sure if this is correctly set
        throw new Error(`yo there not such thing amigo`)
        break
      }
    }
  },

  Assignment_i: function* (node: any, context: Context) {
    console.log(node)
    setVar(context, node.symbol.name, S[S.length-1])
  },

  FunctionDeclaration: function* (node: es.FunctionDeclaration, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  IfStatement: function* (node: es.IfStatement | es.ConditionalExpression, context: Context) {
    A.push(
        [{type: 'Conditional_i', cons: node.consequent, alt: node.alternate}, context],
        [node.test, context]
      )
  },

  Conditional_i: function* (node: any, context: Context) {
    A.push(S.pop() !== 0 ? [node.cons, context] : [node.alt, context])
  },

  ExpressionStatement: function* (node: es.ExpressionStatement, context: Context) {
    A.push([node.expression, context])
  },

  ReturnStatement: function* (node: es.ReturnStatement, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  WhileStatement: function* (node: es.WhileStatement, context: Context) {
    A.push(
      [{ type: "Literal", value: undefined }, context],
      [{ type: "While_i", test: node.test, body: node.body }, context],
      [node.test, context]
    )
  },

  While_i: function* (node: any, context: Context) {
    const test = S.pop()
    if (test > 0) {
      A.push(
        [node, context],
        [node.test, context],
        [{ type: "Pop_i" }, context],
        [node.body, context],
      )
    }
  },

  DoWhileStatement: function* (node: es.DoWhileStatement, context: Context) {
    A.push(
      [{ type: "WhileStatement", test: node.test, body: node.body }, context],
      [{ type: "Pop_i" }, context],
      [node.body, context]
    )
  },

  BlockStatement: function* (node: es.BlockStatement, context: Context) {
    const env = createBlockEnv(context, 'blockEnvironment')
    pushEnvironment(context, env)
    const locals = scan(node.body)
    console.log("LOCALS:-----------------------")
    console.log(locals)
    create_unassigned(locals, context)
    A.push([{ type: "Pop_env" }, context])
    A.push(...handle_body(node.body, context))
  },

  Program: function* (node: es.BlockStatement, context: Context) {
    const env = createBlockEnv(context, 'programEnvironment')
    pushEnvironment(context, env)
    const locals = scan(node.body)
    console.log("LOCALS:-----------------------")
    console.log(locals)
    create_unassigned(locals, context)
    A.push(...handle_body(node.body, context))
  }
}
// tslint:enable:object-literal-shorthand

const step_limit = 100
export function* evaluate(node: es.Node, context: Context) {
  context.numberOfOuterEnvironments++
  const env = createGlobalEnvironment()
  pushEnvironment(context, env)
  A = [[node, context]]
  console.log(A.slice(0))
  S = []
  let i: number = 0
  while (i < step_limit) {
    if (A.length === 0) break
    console.log('A before popping')
    console.log(A.slice(0))
    const curr = A.pop()
    const cmd = curr[0]
    const ctxt = curr[1]
    console.log('A after popping')
    console.log(A.slice(0))
    console.log(cmd)
    console.log(i)
    console.log(S.slice(0))
    if (evaluators.hasOwnProperty(cmd.type)) yield* evaluators[cmd.type](cmd, ctxt)
    else throw new Error('unknown command')
    console.log('A after executing command')
    console.log(A.slice(0))
    console.log('---------------')
    i++
  }
  if (i === step_limit) {
    throw new Error('step limit exceeded')
  }
  console.log(S.slice(0))
  return S[0]
}

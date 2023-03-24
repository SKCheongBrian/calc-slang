/* tslint:disable:max-classes-per-file */
import { isUndefined, uniqueId } from 'lodash'

import { createGlobalEnvironment } from '../createContext'
import * as errors from '../errors/errors'
import { RuntimeSourceError } from '../errors/runtimeSourceError'
import { is_number } from '../stdlib/misc'
/* tslint:disable:max-classes-per-file */
import * as cs from '../tree/ctree'
import { Context, Environment, Frame, Value } from '../types'
import { evaluateBinaryExpression, evaluateUnaryExpression } from '../utils/operators'
import Closure from './closure'
import { RuntimeStack } from './memory'

class Thunk {
  public value: Value
  public isMemoized: boolean
  constructor(public exp: cs.Node, public env: Environment) {
    this.isMemoized = false
    this.value = null
  }
}

let A: any[]
let S: any[]
let global_context: Context

let RTS: RuntimeStack

let functions: any[]
let functionIndex: number

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

function* visit(context: Context, node: cs.Node) {
  context.runtime.nodes.unshift(node)
  yield context
}

function* leave(context: Context) {
  context.runtime.break = false
  context.runtime.nodes.shift()
  yield context
}

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

const addFunction = (closure: Closure) => {
  functions[functionIndex] = closure
  return functionIndex++
}

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
    value: RTS.free,
    writable: true
  })
  env.lastUsed = RTS.free
  RTS.allocate(val)
}

const getVar = (context: Context, name: string) => {
  let env: Environment | null = currEnv(context)
  let index: number = -1
  while (env) {
    if (env.head.hasOwnProperty(name)) {
      console.log('from env head(env mappings):-----')
      console.log(env.head)
      console.log('-------------------')
      // TODO change to heap look up address
      index = env.head[name]
      break
    }
    env = env.tail
  }
  return index !== -1
    ? RTS.get_word_at_index(index)
    : handleRuntimeError(context, new errors.UndefinedVariable(name, context.runtime.nodes[0]))
}

const setVar = (context: Context, name: string, value: any) => {
  let env: Environment | null = currEnv(context)
  let index: number = -1
  // look through environment frames
  while (env) {
    if (env.head.hasOwnProperty(name)) {
      index = env.head[name]
      break
    }
    env = env.tail
  }
  return index !== -1
    ? RTS.set_word_at_index(index, value)
    : handleRuntimeError(context, new errors.UndefinedVariable(name, context.runtime.nodes[0]))
}

/* -------------------------------------------------------------------------- */
/*                                 Environment                                */
/* -------------------------------------------------------------------------- */

const currEnv = (c: Context) => c.runtime.environments[0]

// TODO update free pointer :)
const popEnvironment = (context: Context) => {
  context.runtime.environments.shift()
  RTS.free = currEnv(context).lastUsed + 1
}

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
    id: uniqueId(),
    lastUsed: RTS.free - 1
  }
}

export type Evaluator<T extends cs.Node> = (node: T, context: Context) => IterableIterator<Value>

// TODO: prolly need to change this too
const UNASSIGNED = 0

const create_unassigned = (locals: any[], context: Context) => {
  const env = currEnv(context)
  for (let i = 0; i < locals.length; i++) {
    const name = locals[i]
    makeVar(context, name, UNASSIGNED)
  }
}

const extend = (names: cs.Identifier[], values: any[], context: Context) => {
  const env = createBlockEnv(context)
  pushEnvironment(context, env)
  for (let i = 0; i < names.length; i++) {
    const name = names[i].name
    const value = values[i]
    makeVar(context, name, value)
  }
}

/* -------------------------------------------------------------------------- */
/*                                    Body                                    */
/* -------------------------------------------------------------------------- */

const scan = (body_arr: any) => {
  const res: any[] = []
  for (let i = 0; i < body_arr.length; i++) {
    const statement: any = body_arr[i]
    if (statement.type === 'VariableDeclaration') {
      const len = statement.declarations.length
      for (let i = 0; i < len; i++) {
        const declaration = statement.declarations[i]
        const identifier = declaration.id as cs.Identifier
        res.push(identifier.name)
      }
    } else if (statement.type === 'FunctionDeclaration') {
      res.push(statement.id.name)
    }
  }
  return res
}

const handle_body = (body: any) => {
  if (body.length === 0) {
    return [{ type: 'Literal', value: undefined }]
  }
  const res: any[] = []
  let first = true
  for (const cmd of body) {
    first ? (first = false) : res.push({ type: 'Pop_i' })
    res.push(cmd)
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

export const evaluators: { [nodeType: string]: Evaluator<cs.Node> } = {
  Pop_i: function* (node: any, _context: Context) {
    S.pop()
  },

  Pop_env: function* (node: any, context: Context) {
    popEnvironment(context)
  },

  /** Simple Values */
  Literal: function* (node: cs.Literal, _context: Context) {
    S.push(node.value)
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
    S.push(getVar(context, node.name))
  },

  CallExpression: function* (node: cs.CallExpression, context: Context) {
    A.push(
      {
        type: "Call_i",
        arity: node.arguments.length
      },
    )
    for (let i = node.arguments.length - 1; i >= 0; i--) { // not reversed unlike hw3 so we need to reverse it
      A.push(node.arguments[i])
    }
    A.push(node.callee)
  },

  ReturnStatement: function* (node: cs.ReturnStatement, context: Context) {
    if (node.argument) {
      A.push(
        {type: "Reset_i"},
        node.argument // TODO NOTE SURE IF THIS WILL AFFECT RETURNING NOTHING
      )
    } else {
      A.push(
        {type: "Reset_i"},
      )

    }
  },
  // TODO marki envi reseti return statement
  Env_i: function* (node: any, context: Context) {
    global_context = node.context
  },

  Reset_i: function* (node: any, context: Context) {
    if (A.pop().type === "Mark_i") {
      console.log("look for me plz")
      return
    } else {
      A.push(node)
    }
  },

  Call_i: function* (node: any, context: Context) {
    const arity = node.arity
    const args: any[] = []
    for (let i = arity - 1; i >= 0; i--) {
      args[i] = S.pop()
    }
    const sf: Closure = functions[S.pop()]
    if (A.length === 0 || A[A.length - 1].type === 'Env_i') {
      A.push({type: "Mark_i"})
    } else if (A[A.length - 1].type === 'Reset_i') {
      A.pop();
    } else {
      A.push(
        {type: "Env_i", context: context},
        {type: "Mark_i"}
      )
    }
    A.push(sf.body)
    extend(sf.params, args, context)
  },

  NewExpression: function* (node: cs.NewExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  UnaryExpression: function* (node: cs.UnaryExpression, context: Context) {
    A.push({ type: "UnaryExpression_i", operator: node.operator }, node.argument)
  },

  UnaryExpression_i: function* (node: any, context: Context) {
    const result = evaluateUnaryExpression(node.operator, S.pop())
    S.push(result)
  },

  BinaryExpression: function* (node: cs.BinaryExpression, context: Context) {
    A.push({ type: "BinaryExpression_i", operator: node.operator }, node.left, node.right)
  },

  // TODO: I'm not sure the type of node should be here since its a weird one
  BinaryExpression_i: function* (node: any, context: Context) {
    const result = evaluateBinaryExpression(node.operator, S.pop(), S.pop())
    console.log("result: " + result)
    S.push(result)
  },

  UpdateExpression: function* (node: cs.UpdateExpression, context: Context) {
    if (!node.prefix) {
      const value = getVar(context, (node.argument as cs.Identifier).name)
      A.push( [{ type: "Pop_i" }, context])
      S.push(value)
    }
    A.push(
      { 
        type: "AssignmentExpression",
        operator: "=",
        left: node.argument, 
        right: {
          type: "BinaryExpression",
          operator: node.operator.charAt(0),
          left: node.argument,
          right: {
            type: "Literal",
            value: 1
          }
        }
      }
    )
  },

  ConditionalExpression: function* (node: cs.ConditionalExpression, context: Context) {
    A.push(
        {type: 'Conditional_i', cons: node.consequent, alt: node.alternate},
        node.test
      )
  },

  LogicalExpression: function* (node: cs.LogicalExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  VariableDeclaration: function* (node: cs.VariableDeclaration, context: Context) {
    const len = node.declarations.length
    for (let i = 0; i < len; i++) {
      const declaration = node.declarations[i]
      const identifier = declaration.id as cs.Identifier
      // const symbol = identifier.name
      const init = (declaration.init == null || isUndefined(declaration.init))
        ? undefined
        : declaration.init
      A.push(
        {type: 'Literal', value: undefined},
        { type: "Pop_i" },
        {type: "AssignmentExpression", left: identifier, right: init, operator: "="},
      )
    }
  },

  VarDec_i: function* (node: any, context: Context) {
    makeVar(context, node.symbol, S[S.length-1])
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
    A.push({ type: "Assignment_i", symbol: node.left })
    console.log(node.operator);
    
    switch (node.operator) {
      case "=": {
        A.push(node.right)
        break
      }
      case "+=": {
        A.push({ type: "BinaryExpression", operator: "+", left: node.left, right: node.right})
        break
      }
      case "-=": {
        A.push({ type: "BinaryExpression", operator: "-", left: node.left, right: node.right})
        break
      }
      case "*=": {
        A.push({ type: "BinaryExpression", operator: "*", left: node.left, right: node.right})
        break
      }
      case "/=": {
        A.push({ type: "BinaryExpression", operator: "/", left: node.left, right: node.right})
        break
      }
      case "%=": {
        A.push({ type: "BinaryExpression", operator: "%", left: node.left, right: node.right})
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
    if (is_number(S[S.length - 1])) {
      setVar(context, node.symbol.name, S[S.length-1])
    } else {
      const index = addFunction(S[S.length - 1])
      setVar(context, node.symbol.name, index)
    }
  },

  FunctionDeclaration: function* (node: cs.FunctionDeclaration, context: Context) {
    const id = node.id
    A.push(
      {
        type: "VariableDeclaration",
        kind: "const", // cant change what a function is after
        declarations: [
          {
            type: "VariableDeclarator",
            id: id,
            init: {
              type: "Closure",
              params: node.params,
              body: node.body,
            }
          }
        ],
      }
    )
  },

  Closure: function* (node: any, context: Context) {
    S.push(new Closure(node.params as cs.Identifier[], node.body, context))
  },

  IfStatement: function* (node: cs.IfStatement | cs.ConditionalExpression, context: Context) {
    A.push(
        {type: 'Conditional_i', cons: node.consequent, alt: node.alternate},
        node.test
      )
  },

  Conditional_i: function* (node: any, context: Context) {
    A.push(S.pop() !== 0 ? node.cons : node.alt)
  },

  ExpressionStatement: function* (node: cs.ExpressionStatement, context: Context) {
    A.push(node.expression)
  },

  WhileStatement: function* (node: cs.WhileStatement, context: Context) {
    A.push(
      { type: "Literal", value: undefined },
      { type: "While_i", test: node.test, body: node.body },
      node.test
    )
  },

  While_i: function* (node: any, context: Context) {
    const test = S.pop()
    if (test > 0) {
      A.push(
        node, // push node back onto agenda
        node.test,
        { type: "Pop_i" }, // pop result of body
        node.body,
      )
    }
  },

  DoWhileStatement: function* (node: cs.DoWhileStatement, context: Context) {
    A.push(
      { type: "WhileStatement", test: node.test, body: node.body },
      { type: "Pop_i" }, // pop result of body
      node.body // execute body one time before doing check
    )
  },

  BlockStatement: function* (node: cs.BlockStatement, context: Context) {
    const env = createBlockEnv(context, 'blockEnvironment')
    pushEnvironment(context, env)
    const locals = scan(node.body)
    console.log("LOCALS:-----------------------")
    console.log(locals)
    create_unassigned(locals, context)
    A.push({ type: "Pop_env" })
    A.push(...handle_body(node.body))
  },

  Program: function* (node: cs.BlockStatement, context: Context) {
    const env = createBlockEnv(context, 'programEnvironment')
    pushEnvironment(context, env)
    const locals = scan(node.body)
    console.log("LOCALS:-----------------------")
    console.log(locals)
    create_unassigned(locals, context)
    A.push(...handle_body(node.body))
  }
}
// tslint:enable:object-literal-shorthand

const step_limit = 100
export function* evaluate(node: cs.Node, context: Context) {
  context.numberOfOuterEnvironments++
  const env = createGlobalEnvironment()
  pushEnvironment(context, env)
  global_context = context
  A = [node]
  console.log(A.slice(0))
  S = []
  RTS = new RuntimeStack(10)
  functions = []
  functionIndex = 0
  // HEAP = new ArrayBuffer(10 * MEGA)
  let i: number = 0
  while (i < step_limit) {
    if (A.length === 0) break
    console.log('A before popping')
    console.log(A.slice(0))
    const cmd = A.pop()
    console.log('A after popping')
    console.log(A.slice(0))
    console.log('the command V')
    console.log(cmd)
    console.log(i)
    console.log(S.slice(0))
    if (evaluators.hasOwnProperty(cmd.type)) yield* evaluators[cmd.type](cmd, global_context)
    else throw new Error(`unknown command ${JSON.stringify(cmd.type)}`)
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

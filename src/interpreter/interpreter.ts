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
import { Identifier } from './../tree/ctree'
import { identifier } from './../utils/astCreator'
import Closure from './closure'
import { Heap, RuntimeStack } from './memory'

class Thunk {
  public value: Value
  public isMemoized: boolean
  constructor(public exp: cs.Node, public env: Environment) {
    this.isMemoized = false
    this.value = null
  }
}

enum Type {
  Int,
  Char
}

enum Location {
  Stack,
  Heap
}

let A: any[]
let S: any[]
let global_context: Context

let RTS: RuntimeStack
export let H: Heap

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

const getKind = (type: any) => {
  let kind: any
  let pointerType: any
  switch (type.kind) {
    case 'primitive':
      switch (type.name) {
        case 'int':
          kind = 'int'
          break
        case 'char':
          kind = 'char'
          break
      }
      break
    case 'function':
      kind = 'function'
      break
    case 'pointer':
      kind = 'pointer'
      pointerType = getKind(type.type)
      break
    default:
      throw new Error(`ERROR at makeVar, type unknown ${type?.kind}`)
  }
  if (pointerType) {
    return kind.concat('/', pointerType)
  }
  return kind
}

const makeVar = (context: Context, identifier: cs.Identifier, val: any) => {
  const env = currEnv(context)
  console.log('context:-----')
  console.log(context)
  console.log('-------------')
  console.log('env:---------')
  console.log(env)
  console.log('-------------')
  const datatype = identifier.datatype
  const symbol = identifier.name

  const type = getKind(datatype)
  Object.defineProperty(env.head, symbol, {
    value: [RTS.free, type],
    writable: true
  })
  env.lastUsed = RTS.free
  RTS.allocate(val)
}

const isBuiltin = (context: Context, name: string): boolean => {
  const builtins: Map<string, Value> = context.nativeStorage.builtins
  return builtins.has(name)
}

const getVar = (context: Context, identifier: cs.Identifier) => {
  const name = identifier.name
  const type: String = getKind(identifier.datatype)
  if (isBuiltin(context, name)) {
    return context.nativeStorage.builtins.get(name)
  }

  const env: Environment | null = currEnv(context)
  const index: number = getIndex(name, env)

  console.log(`FINDING ${name}, ${type}, ${index}`)
  if (index === -1) {
    return handleRuntimeError(context, new errors.UndefinedVariable(name, context.runtime.nodes[0]))
  } else if (isNaN(RTS.get_word_at_index(index))) {
    return handleRuntimeError(
      context,
      new errors.UnassignedVariable(name, context.runtime.nodes[0])
    )
  } else if (type == 'char') {
    return String.fromCharCode(RTS.get_word_at_index(index))
  } else {
    // TODO maybe use a switch here
    return RTS.get_word_at_index(index)
  }
}

const setVar = (context: Context, identifier: cs.Identifier) => {
  const name = identifier.name
  const dataType = identifier.datatype
  let value = S[S.length - 1]

  switch (dataType?.kind) {
    case 'function':
      value = addFunction(value)
      break
    case 'primitive':
      if (dataType.name == 'char') {
        value = value.charCodeAt(1)
      }
      break
  }

  const env: Environment | null = currEnv(context)
  const index: number = getIndex(name, env)

  console.log(`Setting for ${name}, value: ${value}, index: ${index}`)
  return index !== -1
    ? RTS.set_word_at_index(index, value)
    : handleRuntimeError(context, new errors.UndefinedVariable(name, context.runtime.nodes[0]))
}

const derefByIndex = (index: number) => {
  return RTS.get_word_at_index(RTS.get_word_at_index(index))
}

const derefFindName = (node: any) => {
  while (node.type === "UnaryExpression") {
    node = node.argument
  }
  return node.name
}

/* -------------------------------------------------------------------------- */
/*                                 Environment                                */
/* -------------------------------------------------------------------------- */

const currEnv = (c: Context) => c.runtime.environments[0]

const getIndex = (name: string, env: Environment | null) => {
  let index = -1
  while (env) {
    if (env.head.hasOwnProperty(name)) {
      console.log('from env head(env mappings):-----')
      console.log(env.head)
      console.log('-------------------')
      index = env.head[name][0]
      break
    }
    env = env.tail
  }
  return index
}

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

const create_unassigned = (locals: cs.Identifier[], context: Context) => {
  const env = currEnv(context)
  for (let i = 0; i < locals.length; i++) {
    const currIdentifier: cs.Identifier = locals[i]
    makeVar(context, currIdentifier, NaN)
  }
}

const extend = (names: cs.Identifier[], values: any[], context: Context) => {
  const env = createBlockEnv(context)
  pushEnvironment(context, env)
  for (let i = 0; i < names.length; i++) {
    makeVar(context, names[i], values[i])
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
        res.push(identifier)
      }
    } else if (statement.type === 'FunctionDeclaration') {
      res.push(statement.id as cs.Identifier)
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

const create_main = (): cs.ExpressionStatement => {
    const callee: cs.Identifier = {
      type: 'Identifier',
      name: 'main', 
      datatype: {
        kind: "function", 
        parameterTypes: [],
        returnType: {
          kind: 'primitive', 
          name: 'int'
        }
      } 
    }

    // Parse args
    const args: cs.Expression[] = []

    return {
      type: "ExpressionStatement", 
      expression: { 
        type: 'CallExpression',
        optional: false,
        callee,
        arguments: args,
        datatype: {
          kind: 'primitive', 
          name: 'int'
        } 
      },
      datatype: {
        kind: 'primitive', 
        name: 'int'
      }
    }
}

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
    S.push(getVar(context, node))
  },

  CallExpression: function* (node: cs.CallExpression, context: Context) {
    A.push({
      type: 'Call_i',
      arity: node.arguments.length
    })
    for (let i = node.arguments.length - 1; i >= 0; i--) {
      // not reversed unlike hw3 so we need to reverse it
      A.push(node.arguments[i])
    }
    A.push(node.callee)
  },

  ReturnStatement: function* (node: cs.ReturnStatement, context: Context) {
    if (node.argument) {
      A.push(
        { type: 'Reset_i' },
        node.argument // TODO NOTE SURE IF THIS WILL AFFECT RETURNING NOTHING
      )
    } else {
      A.push({ type: 'Reset_i' })
    }
  },
  Env_i: function* (node: any, context: Context) {
    global_context = node.context
  },

  Reset_i: function* (node: any, context: Context) {
    if (A.pop().type === 'Mark_i') {
      console.log('look for me plz')
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
    const fun = S.pop()
    console.log(`fun is ${fun}`)

    if (fun.tag === 'builtin') {
      S.push(fun(...args))
      return
    }
    const sf: Closure | Value = functions[fun]
    if (A.length === 0 || A[A.length - 1].type === 'Env_i') {
      A.push({ type: 'Mark_i' })
    } else if (A[A.length - 1].type === 'Reset_i') {
      A.pop()
    } else {
      A.push({ type: 'Env_i', context: context }, { type: 'Mark_i' })
    }
    A.push(sf.body)
    extend(sf.params, args, context)
  },

  NewExpression: function* (node: cs.NewExpression, context: Context) {
    throw new Error(`not supported yet: ${node.type}`)
  },

  UnaryExpression: function* (node: cs.UnaryExpression, context: Context) {
    switch (node.operator) {
      case '&':
        A.push({ type: 'Reference_i', node: node.argument as cs.Identifier })
        return
      case '*':
        A.push({ type: 'Dereference_i', node: node.argument as cs.Identifier })
        return
      default:
        A.push({ type: 'UnaryExpression_i', operator: node.operator }, node.argument)
        return
    }
  },

  Reference_i: function* (instr: any, context: Context) {
    const node = instr.node
    const name = node.name
    const env: Environment | null = currEnv(context)
    const index: number = getIndex(name, env)
    if (index === -1) {
      return handleRuntimeError(
        context,
        new errors.UndefinedVariable(name, context.runtime.nodes[0])
      )
    } else {
      S.push(index)
      return
    }
  },

  Dereference_i: function* (instr: any, context: Context) {
    let node = instr.node
    const name: string = derefFindName(node)
    const env: Environment | null = currEnv(context)
    let index: number = getIndex(name, env)
    while (node.type === "UnaryExpression") {
      console.log(node)
      index = RTS.get_word_at_index(index)
      node = node.argument
    }
    S.push(derefByIndex(index))
  },

  UnaryExpression_i: function* (node: any, context: Context) {
    const result = evaluateUnaryExpression(node.operator, S.pop())
    S.push(result)
  },

  BinaryExpression: function* (node: cs.BinaryExpression, context: Context) {
    A.push({ type: 'BinaryExpression_i', operator: node.operator }, node.left, node.right)
  },

  BinaryExpression_i: function* (node: any, context: Context) {
    const result = evaluateBinaryExpression(node.operator, S.pop(), S.pop())
    console.log('result: ' + result)
    S.push(result)
  },

  UpdateExpression: function* (node: cs.UpdateExpression, context: Context) {
    if (!node.prefix) {
      const value = getVar(context, node.argument as cs.Identifier)
      A.push({ type: 'Pop_i' })
      S.push(value)
    }
    A.push({
      type: 'AssignmentExpression',
      operator: '=',
      left: node.argument,
      right: {
        type: 'BinaryExpression',
        operator: node.operator.charAt(0),
        left: node.argument,
        right: {
          type: 'Literal',
          value: 1
        }
      }
    })
  },

  ConditionalExpression: function* (node: cs.ConditionalExpression, context: Context) {
    A.push({ type: 'Conditional_i', cons: node.consequent, alt: node.alternate }, node.test)
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
      const init =
        declaration.init == null || isUndefined(declaration.init) ? undefined : declaration.init
      A.push(
        { type: 'Literal', value: undefined },
        { type: 'Pop_i' },
        { type: 'InitialAssignmentExpression', left: identifier, right: init, operator: '=' }
      )
    }
  },

  VarDec_i: function* (node: any, context: Context) {
    makeVar(context, node.symbol, S[S.length - 1])
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

  InitialAssignmentExpression: function* (node: any, context: Context) {
    A.push({ type: 'Assignment_i', symbol: node.left })
    A.push(node.right)
  },

  AssignmentExpression: function* (node: cs.AssignmentExpression, context: Context) {
    // this is just a check to make sure that it is properly initialised
    getVar(context, node.left as cs.Identifier)
    A.push({ type: 'Assignment_i', symbol: node.left })

    switch (node.operator) {
      case '=': {
        A.push(node.right)
        break
      }
      case '+=': {
        A.push({ type: 'BinaryExpression', operator: '+', left: node.left, right: node.right })
        break
      }
      case '-=': {
        A.push({ type: 'BinaryExpression', operator: '-', left: node.left, right: node.right })
        break
      }
      case '*=': {
        A.push({ type: 'BinaryExpression', operator: '*', left: node.left, right: node.right })
        break
      }
      case '/=': {
        A.push({ type: 'BinaryExpression', operator: '/', left: node.left, right: node.right })
        break
      }
      case '%=': {
        A.push({ type: 'BinaryExpression', operator: '%', left: node.left, right: node.right })
        break
      }
      default: {
        // ! not sure if this is correctly set
        throw new Error(`yo there not such thing amigo`)
        break
      }
    }
  },

  Assignment_i: function* (node: any, context: Context) {
    console.log(node)
    const identifier = node.symbol as cs.Identifier
    setVar(context, identifier)
  },

  FunctionDeclaration: function* (node: cs.FunctionDeclaration, context: Context) {
    const id = node.id
    A.push({
      type: 'VariableDeclaration',
      kind: 'const', // cant change what a function is after
      declarations: [
        {
          type: 'VariableDeclarator',
          id: id,
          init: {
            type: 'Closure',
            params: node.params,
            body: node.body
          }
        }
      ]
    })
  },

  Closure: function* (node: any, context: Context) {
    S.push(new Closure(node.params as cs.Identifier[], node.body, context))
  },

  IfStatement: function* (node: cs.IfStatement | cs.ConditionalExpression, context: Context) {
    A.push({ type: 'Conditional_i', cons: node.consequent, alt: node.alternate }, node.test)
  },

  Conditional_i: function* (node: any, context: Context) {
    A.push(S.pop() !== 0 ? node.cons : node.alt)
  },

  ExpressionStatement: function* (node: cs.ExpressionStatement, context: Context) {
    A.push(node.expression)
  },

  WhileStatement: function* (node: cs.WhileStatement, context: Context) {
    A.push(
      { type: 'Literal', value: undefined },
      { type: 'While_i', test: node.test, body: node.body },
      node.test
    )
  },

  While_i: function* (node: any, context: Context) {
    const test = S.pop()
    if (test > 0) {
      A.push(
        node, // push node back onto agenda
        node.test,
        { type: 'Pop_i' }, // pop result of body
        node.body
      )
    }
  },

  DoWhileStatement: function* (node: cs.DoWhileStatement, context: Context) {
    A.push(
      { type: 'WhileStatement', test: node.test, body: node.body },
      { type: 'Pop_i' }, // pop result of body
      node.body // execute body one time before doing check
    )
  },

  BlockStatement: function* (node: cs.BlockStatement, context: Context) {
    const env = createBlockEnv(context, 'blockEnvironment')
    pushEnvironment(context, env)
    const locals = scan(node.body)
    // for (let i = 0; i < locals.length; i++) {
    //   RTS.allocate(locals[i])
    // }
    console.log('LOCALS:-----------------------')
    console.log(locals)
    create_unassigned(locals, context)
    A.push({ type: 'Pop_env' })
    A.push(...handle_body(node.body))
  },

  Program: function* (node: cs.BlockStatement, context: Context) {
    const env = createBlockEnv(context, 'programEnvironment')
    pushEnvironment(context, env)
    const locals = scan(node.body)
    console.log('LOCALS:-----------------------')
    console.log(locals)
    node.body.push(create_main())
    create_unassigned(locals, context)
    A.push(...handle_body(node.body))
    // A.push({type: "ExpressionStatement", expression: {arguments: [], callee: {name: "main"}, datatype: {name: 'int'}}})
    // A.push({type: "CallExpression", callee: {type: 'Identifier', name: "main", datatype: {}}, datatype: {kind: 'primitive', name: 'int'}})
  }
}
// tslint:enable:object-literal-shorthand

const step_limit = 100
export function* evaluate(node: cs.Node, context: Context) {
  context.numberOfOuterEnvironments++
  const env = createGlobalEnvironment()
  pushEnvironment(context, env)
  console.log('PRINTING CONTEXT', context)
  global_context = context
  A = [node]
  console.log(A.slice(0))
  S = []
  RTS = new RuntimeStack(10)
  H = new Heap(10)
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

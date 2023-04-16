/* tslint:disable:max-classes-per-file */
import { isUndefined, uniqueId } from 'lodash'
import { cloneDeep } from 'lodash'

import { createGlobalEnvironment } from '../createContext'
import * as errors from '../errors/errors'
import { RuntimeSourceError } from '../errors/runtimeSourceError'
/* tslint:disable:max-classes-per-file */
import * as cs from '../tree/ctree'
import { Context, Environment, Frame, Value } from '../types'
import { evaluateBinaryExpression, evaluateUnaryExpression } from '../utils/operators'
import Closure from './closure'
import { Heap, RuntimeStack } from './memory'


let A: any[]
let S: any[]
export let global_context: Context

export let RTS: RuntimeStack
let RTS_LAST_INDEX: number
export let H: Heap

let functions: any[]
let functionIndex: number


const handleRuntimeError = (context: Context, error: RuntimeSourceError): never => {
  context.errors.push(error)
  context.runtime.environments = context.runtime.environments.slice(
    -context.numberOfOuterEnvironments
  )
  throw error
}


/* -------------------------------------------------------------------------- */
/*                                  Variables                                 */
/* -------------------------------------------------------------------------- */

const addFunction = (closure: Closure) => {
  functions[functionIndex] = closure
  return functionIndex++
}

const getKind = (type: any) => {
  let kind: any
  let pointerType: any
  let arrayType: any
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
    case 'array':
      kind = 'array'
      arrayType = getKind(type.elementType)
      break
    default:
      throw new Error(`ERROR at makeVar, type unknown ${type?.kind}`)
  }
  if (pointerType) {
    return kind.concat('/', pointerType)
  }
  if (arrayType) {
    return kind.concat('/', arrayType)
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
    writable: true,
    enumerable: true
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
  // if is builtin
  if (isBuiltin(context, name)) {
    return context.nativeStorage.builtins.get(name)
  }

  const type: String = getKind(identifier.datatype)
  const env: Environment | null = currEnv(context)
  const index: number = getIndex(name, env)
  const is_stack: boolean = index <= RTS_LAST_INDEX

  if (index === -1) {
    return handleRuntimeError(context, new errors.UndefinedVariable(name, context.runtime.nodes[0]))
  } else if (isNaN(memory_get_word_at_index(index))) {
    return handleRuntimeError(
      context,
      new errors.UnassignedVariable(name, context.runtime.nodes[0])
    )
  } else if (type == 'char') {
    const is_stack: boolean = index <= RTS_LAST_INDEX
    return String.fromCharCode(memory_get_word_at_index(index))
  } else {
    return memory_get_word_at_index(index)
  }
}

const setVarByIndex = (index: number, isStack: boolean, kind: string) => {
  let value = S[S.length - 1]

  switch (kind) {
    case 'char':
      value = value.charCodeAt(1)
      break
  }
  return index !== -1
    ? isStack
      ? RTS.set_word_at_index(index, value)
      : H.set_word_at_index(index - RTS_LAST_INDEX - 1, value)
    : new Error(`Error at setVarByIndex`)
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

  const is_stack: boolean = index <= RTS_LAST_INDEX

  return index !== -1
    ? is_stack
      ? RTS.set_word_at_index(index, value)
      : H.set_word_at_index(index - RTS_LAST_INDEX - 1, value)
    : handleRuntimeError(context, new errors.UndefinedVariable(name, context.runtime.nodes[0]))
}

const derefByIndex = (index: number, is_stack: boolean, type: string) => {
  return type === 'char'
    ? String.fromCharCode(memory_get_word_at_index(memory_get_word_at_index(index)))
    : memory_get_word_at_index(memory_get_word_at_index(index))
}

const memory_get_word_at_index = (index: number) => {
  if (index <= RTS_LAST_INDEX - 1) {
    return RTS.get_word_at_index(index)
  } else {
    return H.get_word_at_index(index - RTS_LAST_INDEX - 1)
  }
}

const derefFindName = (node: any) => {
  while (node.type === 'UnaryExpression') {
    node = node.argument
  }
  return node.name
}

/* -------------------------------------------------------------------------- */
/*                                 Environment                                */
/* -------------------------------------------------------------------------- */

export const currEnv = (c: Context) => c.runtime.environments[0]

const find_malloc_vars = (env: Environment) => {
  const res: string[] = []
  // alphabetical order
  const l = env.head
  const o = Object.keys(env.head)
  for (let i = 0; i < o.length; i++) {
    const curr_type = l[o[i]][2]
    if (curr_type.includes('pointer')) {
      res.push(o[i])
    }
  }
  return res
}

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


const create_unassigned = (locals: cs.Identifier[], context: Context) => {
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
  global_context = context
  console.log(currEnv(global_context))
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
    A.push({ type: 'Array_i', datatype: node.datatype })
    A.push(node.length)
    A.push(...node.elements)
  },

  Array_i: function* (node: any, context: Context) {
    const length = S.pop()
    const firstIndex = RTS.free
    const env = currEnv(context)
    if (length == 0) {
      env.lastUsed++
      RTS.allocate(0)
    } else {
      for (let i = 0; i < length; i++) {
        let currElement = S.pop()
        env.lastUsed++
        if (
          node.datatype.elementType.kind === 'primitive' &&
          node.datatype.elementType.name === 'char'
        ) {
          currElement = currElement.charCodeAt(1)
        }
        RTS.allocate(currElement)
      }
    }
    S.push(firstIndex)
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
        node.argument
      )
      // }
    } else {
      A.push({ type: 'Reset_i' })
    }
  },

  Env_i: function* (node: any, context: Context) {
    global_context = node.context
  },

  Reset_i: function* (node: any, context: Context) {
    if (A.pop().type === 'Mark_i') {
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

    if (fun.tag === 'builtin') {
      if (fun.name == 'malloc') {
        const malloc_res = fun(...args)
        S.push(malloc_res + RTS_LAST_INDEX + 1)
      } else if (fun.name == 'free') {
        args[0] = args[0] - RTS_LAST_INDEX - 1
        S.push(fun(...args))
      } else {
        S.push(fun(...args))
      }
      return
    }
    const sf: Closure | Value = functions[fun]
    if (A.length === 0 || A[A.length - 1].type === 'Env_i') {
      A.push({ type: 'Mark_i' })
    } else if (A[A.length - 1].type === 'Reset_i') {
      A.pop()
    } else {
      A.push({ type: 'Env_i', context: cloneDeep(context) }, { type: 'Mark_i' })
    }
    A.push(sf.body)
    extend(sf.params, args, sf.closure_context)
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
        const pointerType = getKind(node.datatype)
        A.push({
          type: 'Dereference_i',
          node: node.argument as cs.Identifier,
          pointerType: pointerType
        })
        return
      default:
        A.push({ type: 'UnaryExpression_i', operator: node.operator }, node.argument)
        return
    }
  },

  MemberExpression: function* (node: cs.MemberExpression, context: Context) {
    A.push({ type: 'Member_i', dataType: node.datatype })
    A.push(node.object)
    A.push(node.property)
  },

  Member_i: function* (instr: any, context: Context) {
    const address = S.pop()
    const offset = S.pop()
    const newAddress = address + offset
    const result =
      instr.dataType?.name === 'char'
        ? String.fromCharCode(memory_get_word_at_index(newAddress))
        : memory_get_word_at_index(newAddress)
    S.push(result)
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
    while (node.type === 'UnaryExpression') {
      index = memory_get_word_at_index(index)
      node = node.argument
    }
    const is_stack: boolean = index <= RTS_LAST_INDEX
    S.push(derefByIndex(index, is_stack, instr.pointerType))
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

  InitialAssignmentExpression: function* (node: any, context: Context) {
    A.push({ type: 'Assignment_i', symbol: node.left })
    A.push(node.right)
  },

  AsstExprDeref_i: function* (instr: any, context: Context) {
    let node = instr.node
    const pointerType = getKind(node.datatype)
    const name = derefFindName(node)
    const env: Environment | null = currEnv(context)
    let index: number = getIndex(name, env)
    while (node.type === 'UnaryExpression') {
      index = memory_get_word_at_index(index)
      node = node.argument
    }

    const is_stack: boolean = index <= RTS_LAST_INDEX
    A.push({
      type: 'AsstExprDerefSet_i',
      index: index,
      pointerType: pointerType,
      is_stack: is_stack
    })
  },

  AsstExprDerefSet_i: function* (instr: any, context: Context) {
    setVarByIndex(instr.index, instr.is_stack, instr.pointerType)
  },

  AsstMem_i: function* (instr: any, context: Context) {
    const node = instr.node
    A.push({ type: 'Mem_i_set', arrayType: getKind(node.datatype) })
    A.push({ type: 'Mem_i_helper' })
    A.push(node.object)
    A.push(node.property)
  },

  Mem_i_helper: function* (instr: any, context: Context) {
    const index = S.pop()
    const offset = S.pop()

    S.push(index + offset)
  },

  Mem_i_set: function* (instr: any, context: Context) {
    const index_to_set = S.pop()
    const is_stack: boolean = index_to_set <= RTS_LAST_INDEX
    setVarByIndex(index_to_set, is_stack, instr.arrayType)
  },

  AssignmentExpression: function* (node: cs.AssignmentExpression, context: Context) {
    // this is just a check to make sure that it is properly initialised
    if (node.left.type === 'UnaryExpression') {
      A.push({ type: 'AsstExprDeref_i', node: node.left })
    } else if (node.left.type === 'MemberExpression') {
      A.push({ type: 'AsstMem_i', node: node.left })
    } else {
      getVar(context, node.left as cs.Identifier)
      A.push({ type: 'Assignment_i', symbol: node.left })
    }

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
      }
    }
  },

  Assignment_i: function* (node: any, context: Context) {
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
    A.push(
      S.pop() !== 0
        ? node.cons
        : isUndefined(node.alt)
        ? { type: 'Literal', value: undefined }
        : node.alt
    )
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

const step_limit = 100000
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
  RTS_LAST_INDEX = 10 * 2 ** 17 - 1
  H = new Heap(10)
  functions = []
  functionIndex = 0
  // HEAP = new ArrayBuffer(10 * MEGA)
  let i: number = 0
  while (i < step_limit) {
    if (A.length === 0) break
    console.log('A before popping', A.slice(0))
    const cmd = A.pop()
    console.log('A after popping', A.slice(0))
    console.log('the command V')
    console.log(cmd)
    console.log(i)
    console.log('slice', S.slice(0))
    if (evaluators.hasOwnProperty(cmd.type)) yield* evaluators[cmd.type](cmd, global_context)
    else throw new Error(`unknown command ${JSON.stringify(cmd.type)}`)
    console.log('A after executing command', A.slice(0))
    console.log('---------------')
    i++
  }
  if (i === step_limit) {
    throw new Error('step limit exceeded')
  }
  console.log(S.slice(0))
  return S[0]
}

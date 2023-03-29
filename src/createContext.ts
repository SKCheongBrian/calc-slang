// Variable determining chapter of Source is contained in this file.

import * as misc from './stdlib/misc'
import { Context, CustomBuiltIns, Environment, NativeStorage, Value, Variant } from './types'

export class LazyBuiltIn {
  func: (...arg0: any) => any
  evaluateArgs: boolean
  constructor(func: (...arg0: any) => any, evaluateArgs: boolean) {
    this.func = func
    this.evaluateArgs = evaluateArgs
  }
}

export class EnvTree {
  private _root: EnvTreeNode | null = null
  private map = new Map<Environment, EnvTreeNode>()

  get root(): EnvTreeNode | null {
    return this._root
  }

  public insert(environment: Environment): void {
    const tailEnvironment = environment.tail
    if (tailEnvironment === null) {
      if (this._root === null) {
        this._root = new EnvTreeNode(environment, null)
        this.map.set(environment, this._root)
      }
    } else {
      const parentNode = this.map.get(tailEnvironment)
      if (parentNode) {
        const childNode = new EnvTreeNode(environment, parentNode)
        parentNode.addChild(childNode)
        this.map.set(environment, childNode)
      }
    }
  }

  public getTreeNode(environment: Environment): EnvTreeNode | undefined {
    return this.map.get(environment)
  }
}

export class EnvTreeNode {
  private _children: EnvTreeNode[] = []

  constructor(readonly environment: Environment, public parent: EnvTreeNode | null) {}

  get children(): EnvTreeNode[] {
    return this._children
  }

  public resetChildren(newChildren: EnvTreeNode[]): void {
    this.clearChildren()
    this.addChildren(newChildren)
    newChildren.forEach(c => (c.parent = this))
  }

  private clearChildren(): void {
    this._children = []
  }

  private addChildren(newChildren: EnvTreeNode[]): void {
    this._children.push(...newChildren)
  }

  public addChild(newChild: EnvTreeNode): EnvTreeNode {
    this._children.push(newChild)
    return newChild
  }
}

const createEmptyRuntime = () => ({
  break: false,
  debuggerOn: true,
  isRunning: false,
  environmentTree: new EnvTree(),
  environments: [],
  value: undefined,
  nodes: []
})

export const createGlobalEnvironment = (): Environment => ({
  tail: null,
  name: 'global',
  head: {},
  id: '-1',
  lastUsed: 0
})

const createNativeStorage = (): NativeStorage => ({
  builtins: new Map()
})

export const createEmptyContext = <T>(
  variant: Variant,
  externalSymbols: string[],
  externalContext?: T
): Context<T> => {
  return {
    externalSymbols,
    errors: [],
    externalContext,
    runtime: createEmptyRuntime(),
    numberOfOuterEnvironments: 1,
    nativeStorage: createNativeStorage(),
    prelude: null,
    executionMethod: 'auto',
    variant,
    moduleContexts: {},
    unTypecheckedCode: [],
    previousCode: []
  }
}

export const ensureGlobalEnvironmentExist = (context: Context) => {
  if (!context.runtime) {
    context.runtime = createEmptyRuntime()
  }
  if (!context.runtime.environments) {
    context.runtime.environments = []
  }
  if (!context.runtime.environmentTree) {
    context.runtime.environmentTree = new EnvTree()
  }
  if (context.runtime.environments.length === 0) {
    const globalEnvironment = createGlobalEnvironment()
    context.runtime.environments.push(globalEnvironment)
    context.runtime.environmentTree.insert(globalEnvironment)
  }
}

export const defineSymbol = (context: Context, name: string, value: Value) => {
  const globalEnvironment = context.runtime.environments[0]
  Object.defineProperty(globalEnvironment.head, name, {
    value,
    writable: false,
    enumerable: true
  })
  context.nativeStorage.builtins.set(name, value)
}

export function defineBuiltin(
  context: Context,
  name: string, // enforce minArgsNeeded
  value: Value,
  minArgsNeeded: number
): void
export function defineBuiltin(
  context: Context,
  name: string,
  value: Value,
  minArgsNeeded?: number
): void
// Defines a builtin in the given context
// If the builtin is a function, wrap it such that its toString hides the implementation
export function defineBuiltin(
  context: Context,
  name: string,
  value: Value,
  minArgsNeeded: undefined | number = undefined
) {
  if (typeof value === 'function') {
    const funName = name.split('(')[0].trim()
    const repr = `function ${name} {\n\t[implementation hidden]\n}`
    value.tag = 'builtin'
    value.toString = () => repr
    value.minArgsNeeded = minArgsNeeded

    defineSymbol(context, funName, value)
  } else {
    defineSymbol(context, name, value)
  }
}

/**
 * Imports builtins from standard and external libraries.
 */
export const importBuiltins = (context: Context, externalBuiltIns: CustomBuiltIns) => {
  ensureGlobalEnvironmentExist(context)
  const rawDisplay = (v: Value) =>
    externalBuiltIns.rawDisplay(v)

  // defineBuiltin(context, 'display(val, prepend = undefined)', display, 1)
  defineBuiltin(context, 'print(str, prepend = undefined)', rawDisplay, 1)
}

const defaultBuiltIns: CustomBuiltIns = {
  rawDisplay: misc.rawDisplay
}

const createContext = <T>(
  variant: Variant = Variant.DEFAULT,
  externalSymbols: string[] = [],
  externalContext?: T,
  externalBuiltIns: CustomBuiltIns = defaultBuiltIns
): Context => {
  const context = createEmptyContext(variant, externalSymbols, externalContext)

  importBuiltins(context, externalBuiltIns)
  return context
}

export default createContext

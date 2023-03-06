// import * as cs from 'estree'
import * as cs from '../tree/ctree'
import { Context, Environment } from './../types'
import { blockStatement } from './../utils/astCreator'

export default class Closure {
  public closure_params: cs.Identifier[]
  public closure_body: cs.BlockStatement
  public current_environment: Environment
  public closure_context: Context

  constructor(
    public params: cs.Identifier[],
    public body: cs.BlockStatement,
    public environment: Environment,
    context: Context
  ) {
    this.closure_params = params
    this.closure_body = body
    this.current_environment = environment
    this.closure_context = context
  }
}

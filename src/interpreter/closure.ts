import * as es from 'estree'

import { Context, Environment } from './../types'
import { blockStatement } from './../utils/astCreator'

export default class Closure {
  public closure_params: es.Identifier[]
  public closure_body: es.BlockStatement
  public current_environment: Environment
  public closure_context: Context

  constructor(
    public params: es.Identifier[],
    public body: es.BlockStatement,
    public environment: Environment
  ) {
    this.closure_params = params
    this.closure_body = body
    this.current_environment = environment
  }
}

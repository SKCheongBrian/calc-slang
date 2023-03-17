import * as es from 'estree'
import { cloneDeep } from 'lodash'

import { Context } from './../types'

export default class Closure {
  public closure_params: es.Identifier[]
  public closure_body: es.BlockStatement
  public closure_context: Context

  constructor(
    public params: es.Identifier[],
    public body: es.BlockStatement,
    public context: Context
  ) {
    this.closure_params = params
    this.closure_body = body
    this.closure_context = cloneDeep(context)
  }
}

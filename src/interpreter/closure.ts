// import * as cs from 'estree'
import { cloneDeep } from 'lodash'

import * as cs from '../tree/ctree'
import { Context } from './../types'

export default class Closure {
  public closure_params: cs.Identifier[]
  public closure_body: cs.BlockStatement
  public closure_context: Context

  constructor(public params: cs.Identifier[], public body: cs.BlockStatement, context: Context) {
    this.closure_params = params
    this.closure_body = body
    this.closure_context = cloneDeep(context)
  }
}

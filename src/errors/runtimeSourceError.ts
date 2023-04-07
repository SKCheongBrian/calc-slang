// import * as cs from 'estree'
import { UNKNOWN_LOCATION } from '../constants'
import * as cs from '../tree/ctree'
import { ErrorSeverity, ErrorType, SourceError } from '../types'

export class RuntimeSourceError implements SourceError {
  public type = ErrorType.RUNTIME
  public severity = ErrorSeverity.ERROR
  public location: cs.SourceLocation

  constructor(node?: cs.Node) {
    this.location = node ? node.loc! : UNKNOWN_LOCATION
  }

  public explain() {
    return ''
  }

  public elaborate() {
    return this.explain()
  }
}

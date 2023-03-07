import _ from 'lodash'
import * as t from '../types'

export class TypeChecker {
  static isEqual(left: t.Type | undefined, right: t.Type | undefined): boolean {
    return _.isEqual(left, right)
  }
}

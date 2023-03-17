declare module 'acorn-loose' {
  import { Options as AcornOptions } from 'acorn'
  import * as cs from 'estree'
  // import * as cs from '../tree/ctree'

  export function parse(source: string, options: AcornOptions): cs.Program
}

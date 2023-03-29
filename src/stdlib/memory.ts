import { H } from '../interpreter/interpreter'
import { Value } from '../types'

/**
 * A function that mirrors C-like behaviour of `malloc`.
 *
 * @param size the size (in bytes) to allocate to the heap.
 */
export function malloc(size: Value) {
  // tslint:disable-next-line:no-console
  console.log('H before malloc', H)
  const index: number = H.allocate(size)
  console.log('[builtin] malloc', size.toString())
  console.log('H after malloc', H)
  return index
}

/**
 * A function that mirrors C-like behaviour of `free`.
 *
 * @param index the address to be deallocated from the heap.
 */
export function free(index: Value) {
  // tslint:disable-next-line:no-console
  console.log('H before free', H)
  H.deallocate(index)
  console.log('[builtin] free', index.toString())
  console.log('H after free', H)
  return index
}

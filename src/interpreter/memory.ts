import Interval from './interval'
import IntervalList from './IntervalList'
import IntervalTree from './IntervalTree'

class Memory {
  public memory: DataView
  public MEGA: number = 2 ** 20
  public WORD_SIZE: number = 8

  public constructor(size: number) {
    const data = new ArrayBuffer(size * this.MEGA)
    this.memory = new DataView(data)
  }

  public get_word_at_index(index: number) {
    return this.memory.getFloat64(index * this.WORD_SIZE)
  }

  public set_word_at_index(index: number, value: number) {
    this.memory.setFloat64(index * this.WORD_SIZE, value)
  }

  public set_bit(i: number) {
    const byte_index = Math.floor(i / 8)
    const current_byte = this.memory.getUint8(byte_index)
    const bit_index = 7 - (i % 8)
    this.memory.setUint8(byte_index, current_byte | (1 << bit_index))
  }

  public unset_bit(i: number) {
    const byte_index = Math.floor(i / 8)
    const current_byte = this.memory.getUint8(byte_index)
    const bit_index = 7 - (i % 8)
    this.memory.setUint8(byte_index, current_byte & ~(1 << bit_index))
  }

  public interpret_word(index: number) {
    return this.memory.getInt32(index * this.WORD_SIZE + 4)
  }

  public toString(): string {
    const size = this.MEGA / this.WORD_SIZE
    let str = ''
    for (let i = 0; i < size; i++) {
      str += `${i}: ${this.get_word_at_index(i)}\n`
    }
    return str
  }
}

export class RuntimeStack extends Memory {
  public free: number
  constructor(size: number) {
    super(size)
    this.free = 0
  }

  public allocate(value: number) {
    this.set_word_at_index(this.free, value)
    this.free++
  }
}

export class Heap extends Memory {
  private tree: IntervalTree
  private list: IntervalList
  private indexToSize: object

  constructor(size: number) {
    super(size)
    this.indexToSize = {}
    const startingInterval: Interval = new Interval(0, size * 2 ** 17 - 1)
    this.tree = new IntervalTree()
    this.tree.insert_node(startingInterval)
    this.list = new IntervalList()
    this.list.add(startingInterval)
  }

  /**
   * Allocates the `size` amount of words onto the heap
   * @param size the size in words to allocate
   * @returns the index on the heap where the allocated memory begins
   */
  public allocate(size: number): number {
    const interval: Interval | null = this.tree.search_size(size)
    if (!interval) {
      throw new Error(`No more space to allocate memory of size: ${size}`)
    }

    this.indexToSize[interval.get_begin()] = size

    const newInterval: Interval | null = interval.allocate_with_size(size)
    this.tree.delete_node(interval)
    this.list.remove(interval)
    if (newInterval) {
      this.tree.insert_node(newInterval)
      this.list.add(newInterval)
    }
    return interval.get_begin()
  }

  /**
   * Deallocates and frees the memory on the heap given an index onto the heap
   * @param index the index onto the heap to be freed
   */
  public deallocate(index: number): void {
    const size: number = this.indexToSize[index]

    let restoredInterval: Interval = new Interval(index, index + size - 1)
    const [left, right] = this.list.find_neighbours(restoredInterval)
    if (left) {
      restoredInterval = restoredInterval.merge(left)
      this.list.remove(left)
      this.tree.delete_node(left)
    }
    if (right) {
      restoredInterval = restoredInterval.merge(right)
      this.list.remove(right)
      this.tree.delete_node(right)
    }
    this.list.add(restoredInterval)
    this.tree.insert_node(restoredInterval)
    delete this.indexToSize[index]
  }
}

export default class Interval {
  private begin: number
  private end: number
  private size: number

  public constructor(begin: number, end: number) {
    this.begin = begin
    this.end = end
    this.size = end - begin + 1
  }

  public get_begin(): number {
    return this.begin
  }

  public get_end(): number {
    return this.end
  }

  public get_size(): number {
    return this.size
  }

  /**
   * Allocates to an index,
   * @param index the start of the remaining free interval
   * @returns the new interval after allocating the interval, returns null if no more interval left
   */
  private allocate_to(index: number): Interval | null {
    if (index == this.end + 1) {
      return null
    }
    if (index > this.end) {
      throw new Error('Index cannot be more than end')
    }
    if (index <= this.begin) {
      throw new Error('Index cannot be less than or equal to begin')
    }
    return new Interval(index, this.end)
  }

  /**
   * Allocates `size` number of words
   * @param size the size of the data to be allocated
   * @returns the remaining interval after allocating, returns null if no more interval left
   */
  public allocate_with_size(size: number): Interval | null {
    if (size == 0) {
      throw new Error('cannot allocate size 0')
    }
    if (size > this.end - this.begin + 1) {
      throw new Error('The size allocated is bigger than the interval :(')
    }
    return this.allocate_to(this.begin + size)
  }

  public merge(other: Interval): Interval {
    const new_begin: number = Math.min(this.begin, other.begin)
    const new_end: number = Math.max(this.end, other.end)

    return new Interval(new_begin, new_end)
  }

  // 0: same
  // -1: x < y
  // 1: x > y
  public compare(x: Interval): number {
    if (this.get_size() == x.get_size()) {
      if (this.get_begin() < x.get_begin()) {
        return -1
      }
      // This shouldn't happen actually
      // 1:2 vs 1:3
      else if (this.get_begin() == x.get_begin()) {
        if (this.get_end() < x.get_end()) {
          return -1
        } else if (this.get_end() == x.get_end()) {
          return 0
        }
      }
      return 1
    } else if (this.get_size() < x.get_size()) {
      return -1
    }
    return 1
  }
}

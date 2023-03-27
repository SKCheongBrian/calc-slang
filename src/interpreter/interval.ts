export default class Interval {
  private begin: number
  private end: number
  private size: number

  public constructor(begin: number, end: number, size: number) {
    this.begin = begin
    this.end = end
    this.size = size
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
      throw new Error('noob index cannot be more than end')
    }
    if (index <= this.begin) {
      throw new Error('Noob index cannot be less than or equal to begin')
    }
    return new Interval(index, this.end, this.end - index + 1)
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

  public can_merge(other: Interval): boolean {
    return other.begin == this.end + 1 || other.end == this.end - 1
  }
  
  public merge(other: Interval): Interval {
    const new_begin: number = Math.min(this.begin, other.begin)
    const new_end: number = Math.max(this.end, other.end)
    const new_size: number = new_end - new_begin + 1;

    return new Interval(new_begin, new_end, new_size)
  }
}

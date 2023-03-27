import Interval from './interval'

export default class IntervalPriorityQueue {
  private heap: Interval[]

  constructor(interval: Interval) {
    this.heap.push(interval)
  }

  public size(): number {
    return this.heap.length
  }

  private parent_index(index: number): number {
    return ((index + 1) >>> 1) - 1
  }

  private left_index(index: number): number {
    return (index << 1) + 1
  }

  private right_index(index: number): number {
    return (index + 1) << 1
  }

  private smaller_than(i: number, j: number): boolean {
    const interval1: Interval = this.heap[i]
    const interval2: Interval = this.heap[j]

    return interval1.get_size() < interval2.get_size()
  }

  private swap(i: number, j: number): void {
    const temp: Interval = this.heap[i]
    this.heap[i] = this.heap[j]
    this.heap[j] = temp
  }

  private bubble_up(): void {
    let curr: number = this.size() - 1
    while (curr > 0 && this.smaller_than(curr, this.parent_index(curr))) {
      this.swap(curr, this.parent_index(curr))
      curr = this.parent_index(curr)
    }
  }

  private bubble_down(): void {
    let curr: number = 0
    while (
      (this.left_index(curr) && this.smaller_than(curr, this.left_index(curr))) ||
      (this.right_index(curr) && this.smaller_than(curr, this.right_index(curr)))
    ) {
      const min_child =
        this.right_index(curr) < this.size() &&
        this.smaller_than(this.right_index(curr), this.left_index(curr))
          ? this.right_index(curr)
          : this.left_index(curr)
      this.swap(curr, min_child)
      curr = min_child
    }
  }

  public add(...values: Interval[]): void {
    values.forEach(v => {
      this.heap.push(v)
      this.bubble_up()
    })
  }

  public remove(): Interval {
    const ret = this.heap[0]

    this.swap(0, this.size() - 1)
    this.heap.pop()
    this.bubble_down()

    return ret
  }
}

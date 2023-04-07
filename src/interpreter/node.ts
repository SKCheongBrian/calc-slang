import Interval from './interval'

export default class Node {
  private item: Interval
  private height: number
  private left: Node | null
  private right: Node | null

  constructor(item: Interval) {
    this.item = item
    this.height = 1
    this.left = null
    this.right = null
  }

  public set_item(item: Interval) {
    this.item = item
  }

  public set_height(height: number) {
    this.height = height
  }

  public set_left(left: Node | null) {
    this.left = left
  }

  public set_right(right: Node | null) {
    this.right = right
  }

  public get_item(): Interval {
    return this.item
  }

  public get_height(): number {
    return this.height
  }

  public get_left(): Node | null {
    return this.left
  }

  public get_right(): Node | null {
    return this.right
  }
}

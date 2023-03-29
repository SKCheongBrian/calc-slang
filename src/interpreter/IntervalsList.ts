import Interval from './interval'

export default class IntervalsList {
  private list: Interval[]

  public constructor() {
    this.list = []
  }

  public add(x: Interval) {
    this.list.push(x)
  }

  public remove(x: Interval) {
    const index = this.list.indexOf(x)
    if (index !== -1) {
      this.list.splice(index, 1)
    } else {
      throw new Error("cannot remove something you didn't add")
    }
  }

  public find_neighbours(curr: Interval): (Interval | null)[] {
    let left: Interval | null = null
    let right: Interval | null = null

    const begin = curr.get_begin()
    const end = curr.get_end()

    for (let i = 0; i < this.list.length; i++) {
      const curr: Interval = this.list[i]
      if (curr.get_end() == begin - 1) {
        left = curr
      }

      if (curr.get_begin() == end + 1) {
        right = curr
      }
    }
    return [left, right]
  }
}

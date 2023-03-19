export default class Memory {
  public memory: DataView
  private MEGA: number = 2 ** 20
  private WORD_SIZE: number = 8

  private free: number

  public constructor(size: number) {
    const data = new ArrayBuffer(size * this.MEGA)
    this.memory = new DataView(data)
    this.free = 0
  }

  public get_word_at_index(index: number) {
    this.memory.getFloat64(index * this.WORD_SIZE)
  }

  public set_word_at_index(index: number, value: number) {
    this.memory.setFloat64(index * this.WORD_SIZE, value)
  }
}

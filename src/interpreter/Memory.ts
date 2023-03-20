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

  // TODO: right now this is assuming that it's an integer and not any other data type
  public interpret_word(index: number) {
    return this.memory.getInt32(index * this.WORD_SIZE + 4)
  }
}

export class RuntimeStack extends Memory {
  public fp: number
  public sp: number
  constructor(size: number) {
    super(size)
    this.fp = 0
    this.sp = 0
  }

  public allocate(value: number) {
    this.set_word_at_index(this.sp++, value)
  }

  public get_in_frame(offset: number) {
    return this.get_word_at_index(this.fp + offset)
  }

  // TODO: I think we can pass in 'return pc' as a parameter to this function?
  public extend_frame() {
    // TODO: Allocate return pc
    this.allocate(this.fp)
    this.allocate(this.sp)
    this.fp = this.sp
  }

  public tear_down() {
    this.sp = this.get_word_at_index(this.fp - 1)
    this.fp = this.get_word_at_index(this.fp - 2)
    // TODO return 'return pc'? 
  }
}

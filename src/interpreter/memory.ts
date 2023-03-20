import { stringify } from "../utils/stringify"

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
  public frame_counter: number
  public name_to_offset: object
  constructor(size: number) {
    super(size)
    this.fp = 0
    this.sp = 0
    this.frame_counter = 0
    this.name_to_offset = {}
  }

  public add_name(name: string, offset: number) {
    this.name_to_offset[name + stringify(this.frame_counter)] = offset
  }

  public get_name(name: string) {
    return this.name_to_offset[name + stringify(this.frame_counter)]
  }

  public allocate(value: number) {
    this.set_word_at_index(this.sp++, value)
  }

  public get_in_frame(offset: number) {
    return this.get_word_at_index(this.fp + offset)
  }

  public extend_frame() {
    this.frame_counter++
  }

  public exit_frame() {
    this.frame_counter--
  }

  public entering_function() {
    this.allocate(this.fp)
    this.fp = this.sp
  }

  public tear_down() {
    this.sp = this.get_word_at_index(this.fp - 1)
    this.fp = this.get_word_at_index(this.fp - 1)
  }
}

import Interval from './interval'
import Node from './node'

export default class IntervalTree {
  private root: Node | null

  public constructor() {
    this.root = null
  }

  //return height of the node
  public get_height(N: Node | null): number {
    if (N === null) {
      return 0
    }
    return N.get_height()
  }

  //right rotate
  public right_rotate(y: Node): Node | null {
    const x: Node | null = y.get_left()
    if (!x) {
      return null
    }
    const T2 = x.get_right()
    x.set_right(y)
    y.set_left(T2)
    y.set_height(Math.max(this.get_height(y.get_left()), this.get_height(y.get_right())) + 1)
    x.set_height(Math.max(this.get_height(x.get_left()), this.get_height(x.get_right())) + 1)
    return x
  }

  //right rotate
  public left_rotate(x: Node): Node | null {
    const y: Node | null = x.get_right()
    if (!y) {
      return null
    }
    const T2 = y.get_left()
    y.set_left(x)
    x.set_right(T2)
    x.set_height(Math.max(this.get_height(x.get_left()), this.get_height(x.get_right())) + 1)
    y.set_height(Math.max(this.get_height(y.get_left()), this.get_height(y.get_right())) + 1)
    return y
  }

  // get balance factor of a node
  public get_balance_factor(N: Node): number {
    if (N == null) {
      return 0
    }
    return this.get_height(N.get_left()) - this.get_height(N.get_right())
  }

  // helper function to insert a node
  public insert_node_helper(node: Node | null, item: Interval) {
    // find the position and insert the node
    if (node === null) {
      return new Node(item)
    }

    if (item.compare(node.get_item()) == -1) {
      node.set_left(this.insert_node_helper(node.get_left(), item))
    } else if (item.compare(node.get_item()) == 1) {
      node.set_right(this.insert_node_helper(node.get_right(), item))
    } else {
      return node
    }

    // update the balance factor of each node
    // and, balance the tree
    node.set_height(
      1 + Math.max(this.get_height(node.get_left()), this.get_height(node.get_right()))
    )

    const balanceFactor = this.get_balance_factor(node)

    if (balanceFactor > 1) {
      const node_left = node.get_left()
      if (node_left) {
        if (item.compare(node_left.get_item()) == -1) {
          return this.right_rotate(node)
        } else if (item.compare(node_left.get_item()) == 1) {
          node.set_left(this.left_rotate(node_left))
          return this.right_rotate(node)
        }
      }
    }

    if (balanceFactor < -1) {
      const node_right = node.get_right()
      if (node_right) {
        if (item.compare(node_right.get_item()) == 1) {
          return this.left_rotate(node)
        } else if (item.compare(node_right.get_item()) == -1) {
          node.set_right(this.right_rotate(node_right))
          return this.left_rotate(node)
        }
      }
    }
    return node
  }

  // insert a node
  public insert_node(item: Interval) {
    // console.log(root);
    this.root = this.insert_node_helper(this.root, item)
  }

  //get node with minimum value
  public node_with_mimum_value(node: Node | null) {
    if (node == null) {
      return null
    }
    let current = node
    let curr_left = current.get_left()
    while (curr_left !== null) {
      current = curr_left
      curr_left = current.get_left()
    }
    return current
  }

  // delete helper
  public delete_node_helper(root: Node | null, item: Interval) {
    // find the node to be deleted and remove it
    if (root == null) {
      return root
    }
    if (item.compare(root.get_item()) == -1) {
      root.set_left(this.delete_node_helper(root.get_left(), item))
    } else if (item.compare(root.get_item()) == 1) {
      root.set_right(this.delete_node_helper(root.get_right(), item))
    } else {
      if (root.get_left() === null || root.get_right() === null) {
        let temp: Node | null = null
        if (temp == root.get_left()) {
          temp = root.get_right()
        } else {
          temp = root.get_left()
        }

        if (temp == null) {
          temp = root
          root = null
        } else {
          root = temp
        }
      } else {
        const temp = this.node_with_mimum_value(root.get_right())
        if (temp) {
          root.set_item(temp.get_item())
          root.set_right(this.delete_node_helper(root.get_right(), temp.get_item()))
        }
      }
    }
    if (root == null) {
      return root
    }

    // Update the balance factor of each node and balance the tree
    root.set_height(
      Math.max(this.get_height(root.get_left()), this.get_height(root.get_right())) + 1
    )

    const balanceFactor = this.get_balance_factor(root)
    if (balanceFactor > 1) {
      const root_left = root.get_left()
      if (root_left) {
        if (this.get_balance_factor(root_left) >= 0) {
          return this.right_rotate(root)
        } else {
          root.set_left(this.left_rotate(root_left))
          return this.right_rotate(root)
        }
      }
    }
    if (balanceFactor < -1) {
      const root_right = root.get_right()
      if (root_right) {
        if (this.get_balance_factor(root_right) <= 0) {
          return this.left_rotate(root)
        } else {
          root.set_right(this.right_rotate(root_right))
          return this.left_rotate(root)
        }
      }
    }
    return root
  }

  //delete a node
  public delete_node(item: Interval) {
    this.root = this.delete_node_helper(this.root, item)
  }

  // print the tree in pre - order
  public in_order() {
    this.in_order_helper(this.root)
  }

  public in_order_helper(node: Node | null) {
    if (node) {
      this.in_order_helper(node.get_left())
      console.log(node.get_item())
      this.in_order_helper(node.get_right())
    }
  }

  public search_size(size: number): Interval | null {
    if (this.root) {
      return this.search_size_helper(size, this.root)
    }
    return null
  }

  public search_size_helper(size: number, curr: Node | null): Interval | null {
    if (curr === null) {
      return null
    }

    if (size > curr.get_item().get_size()) {
      return this.search_size_helper(size, curr.get_right())
    }

    const curr_left = curr.get_left()

    if (curr_left === null || curr_left.get_item().get_size() < size) {
      return curr.get_item()
    } else {
      return this.search_size_helper(size, curr.get_left())
    }
  }
}

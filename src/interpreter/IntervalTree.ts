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
  public rightRotate(y: Node): Node | null {
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
  public leftRotate(x: Node): Node | null {
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
  public getBalanceFactor(N: Node): number {
    if (N == null) {
      return 0
    }
    return this.get_height(N.get_left()) - this.get_height(N.get_right())
  }

  // helper function to insert a node
  public insertNodeHelper(node: Node | null, item: Interval) {
    // find the position and insert the node
    if (node === null) {
      return new Node(item)
    }

    if (item.compare(node.get_item()) == -1) {
      node.set_left(this.insertNodeHelper(node.get_left(), item))
    } else if (item.compare(node.get_item()) == 1) {
      node.set_right(this.insertNodeHelper(node.get_right(), item))
    } else {
      return node
    }

    // update the balance factor of each node
    // and, balance the tree
    node.set_height(
      1 + Math.max(this.get_height(node.get_left()), this.get_height(node.get_right()))
    )

    const balanceFactor = this.getBalanceFactor(node)

    if (balanceFactor > 1) {
      const node_left = node.get_left()
      if (node_left) {
        if (item.compare(node_left.get_item()) == -1) {
          return this.rightRotate(node)
        } else if (item.compare(node_left.get_item()) == 1) {
          node.set_left(this.leftRotate(node_left))
          return this.rightRotate(node)
        }
      }
    }

    if (balanceFactor < -1) {
      const node_right = node.get_right()
      if (node_right) {
        if (item.compare(node_right.get_item()) == 1) {
          return this.leftRotate(node)
        } else if (item.compare(node_right.get_item()) == -1) {
          node.set_right(this.rightRotate(node_right))
          return this.leftRotate(node)
        }
      }
    }
    return node
  }

  // insert a node
  public insertNode(item: Interval) {
    // console.log(root);
    this.root = this.insertNodeHelper(this.root, item)
  }

  //get node with minimum value
  public nodeWithMimumValue(node: Node | null) {
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
  public deleteNodeHelper(root: Node | null, item: Interval) {
    // find the node to be deleted and remove it
    if (root == null) {
      return root
    }
    if (item.compare(root.get_item()) == -1) {
      root.set_left(this.deleteNodeHelper(root.get_left(), item))
    } else if (item.compare(root.get_item()) == 1) {
      root.set_right(this.deleteNodeHelper(root.get_right(), item))
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
        const temp = this.nodeWithMimumValue(root.get_right())
        if (temp) {
          root.set_item(temp.get_item())
          root.set_right(this.deleteNodeHelper(root.get_right(), temp.get_item()))
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

    const balanceFactor = this.getBalanceFactor(root)
    if (balanceFactor > 1) {
      const root_left = root.get_left()
      if (root_left) {
        if (this.getBalanceFactor(root_left) >= 0) {
          return this.rightRotate(root)
        } else {
          root.set_left(this.leftRotate(root_left))
          return this.rightRotate(root)
        }
      }
    }
    if (balanceFactor < -1) {
      const root_right = root.get_right()
      if (root_right) {
        if (this.getBalanceFactor(root_right) <= 0) {
          return this.leftRotate(root)
        } else {
          root.set_right(this.rightRotate(root_right))
          return this.leftRotate(root)
        }
      }
    }
    return root
  }

  //delete a node
  public deleteNode(item: Interval) {
    this.root = this.deleteNodeHelper(this.root, item)
  }

  // print the tree in pre - order
  public inOrder() {
    this.inOrderHelper(this.root)
  }

  public inOrderHelper(node: Node | null) {
    if (node) {
      this.inOrderHelper(node.get_left())
      console.log(node.get_item())
      this.inOrderHelper(node.get_right())
    }
  }

  public searchSize(size: number): Interval | null {
    if (this.root) {
      return this.searchSizeHelper(size, this.root)
    }
    return null
  }

  public searchSizeHelper(size: number, curr: Node | null): Interval | null {
    if (curr === null) {
      return null
    }

    if (size > curr.get_item().get_size()) {
      return this.searchSizeHelper(size, curr.get_right())
    }

    const curr_left = curr.get_left()

    if (curr_left === null || curr_left.get_item().get_size() < size) {
      return curr.get_item()
    } else {
      return this.searchSizeHelper(size, curr.get_left())
    }
  }
}
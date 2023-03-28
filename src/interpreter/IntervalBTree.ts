import Interval from './interval'
import Node from './node'

export default class AVLTree {
  private root: Node | null 

  public constructor() {
    this.root = null
  }
  
  //return height of the node
  public get_height(N: Node | null) : number {
    if (N === null){
      return 0;
    }
    return N.get_height();
  }
  
  //right rotate
  public rightRotate(y: Node): Node | null {
    const x : Node | null = y.get_left();
    let T2 = null
    if (!x) {
      return null
    }
    T2 = x.get_right() 
    x.set_right(y) 
    y.set_left(T2)
    y.set_height(Math.max(this.get_height(y.get_left()), this.get_height(y.get_right())) + 1)
    x.set_height(Math.max(this.get_height(x.get_left()), this.get_height(x.get_right())) + 1)
    return x;
  }

  //right rotate
  public leftRotate(x: Node): Node | null {
    const y : Node | null = x.get_right();
    if (!y) {
      return null
    }
    const T2 = y.get_left() 
    y.set_left(x) 
    x.set_right(T2)
    x.set_height(Math.max(this.get_height(x.get_left()), this.get_height(x.get_right())) + 1)
    y.set_height(Math.max(this.get_height(y.get_left()), this.get_height(y.get_right())) + 1)
    return y;
  }
  
  // get balance factor of a node
  public getBalanceFactor(N: Node) : number{
    if (N == null){
      return 0;
    }
    return this.get_height(N.get_left()) - this.get_height(N.get_right());
  }
  
  
  // helper function to insert a node
  public insertNodeHelper(node: Node | null, item: Interval) {

    // find the position and insert the node
    if (node === null){
      return (new Node(item));
    }
    
    if (item < node.get_item()){
      node.set_left(this.insertNodeHelper(node.get_left(), item))
    }else if (item > node.get_item()){
      node.set_right(this.insertNodeHelper(node.get_right(), item))
    }else{
      return node;
    }
    
    // update the balance factor of each node
    // and, balance the tree
    node.set_height(1 + Math.max(this.get_height(node.get_left()), this.get_height(node.get_right())))
    
    let balanceFactor = this.getBalanceFactor(node);
    
    if (balanceFactor > 1) {
      const node_left = node.get_left()
      if (node_left) {
        if (item < node_left.get_item()) {
          return this.rightRotate(node);
        } else if (item > node_left.get_item()) {
          node.set_left(this.leftRotate(node_left))
          return this.rightRotate(node);
        }
      }
    }
    
    if (balanceFactor < -1) {
      const node_right = node.get_right()
      if (node_right) {
        if (item > node_right.get_item()) {
          return this.leftRotate(node);
        } else if (item < node_right.get_item()) {
          node.set_right(this.rightRotate(node_right))
          return this.leftRotate(node);
        }
      }
    }
    return node;
  }
  
  // insert a node
  public insertNode(item : Interval) {
    // console.log(root);
    this.root = this.insertNodeHelper(this.root, item);
  }
  
  //get node with minimum value
  public nodeWithMimumValue (node: Node | null) {
    if (node == null) {
      return null
    }
    let current = node;
    let curr_left = current.get_left()
    while (curr_left !== null){
      current = curr_left;
      curr_left = current.get_left()
    }
    return current;
  }
  
  // delete helper
  public deleteNodeHelper(root: Node | null, item: Interval)  {

    // find the node to be deleted and remove it
    if (root == null){
      return root;
    }
    if (item < root.get_item()){
      root.set_left(this.deleteNodeHelper(root.get_left(), item))
    }else if (item > root.get_item()){
      root.set_right(this.deleteNodeHelper(root.get_right(), item))
    }else {
      if ((root.get_left() === null) || (root.get_right() === null)) {
        let temp = null;
        if (temp == root.get_left()){
          temp = root.get_right();
        }else{
          temp = root.get_left();
        }
        
        if (temp == null) {
          temp = root;
          root = null;
        } else{
          root = temp;
        }
      } else {
        let temp = this.nodeWithMimumValue(root.get_right());
        if (temp) {
          root.set_item(temp.get_item())
          root.set_right(this.deleteNodeHelper(root.get_right(), temp.get_item()))
        }
      }
    }
    if (root == null){
      return root;
    }

    // Update the balance factor of each node and balance the tree
    root.set_height(Math.max(this.get_height(root.get_left()), this.get_height(root.get_right())) + 1)
    
    let balanceFactor = this.getBalanceFactor(root);
    if (balanceFactor > 1) {
      const root_left = root.get_left()
      if (root_left) {
        if (this.getBalanceFactor(root_left) >= 0) {
          return this.rightRotate(root);
        } else {
          root.set_left(this.leftRotate(root_left))
          return this.rightRotate(root);
        }
      }
    }
    if (balanceFactor < -1) {
      const root_right = root.get_right()
      if (root_right) {
      if (this.getBalanceFactor(root_right) <= 0) {
        return this.leftRotate(root);
      } else {
        root.set_right(this.rightRotate(root_right))
        return this.leftRotate(root);
      }
      }
    }
    return root;
  }
  
  //delete a node
  public deleteNode (item: Interval) {
    this.root = this.deleteNodeHelper(this.root, item);
  }
  
  // print the tree in pre - order
  public preOrder = () => {
    this.preOrderHelper(this.root);
  }
  
  public preOrderHelper = (node: Node | null) => {
    if (node) {
      console.log(node.get_item());
      this.preOrderHelper(node.get_left());
      this.preOrderHelper(node.get_right());
    }
  }
}
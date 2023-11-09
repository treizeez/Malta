import Stack from "./Stack";
import enhanceNode from "./utils/enhanceNode";
import { MaltaComponent, MaltaElementBase } from "./types";
import checkIfComponent from "./utils/checkIfComponent";
import getComponent from "./utils/getComponent";

class Cache {
  public size: number = 0;
  private _cached: Map<number, any> = new Map();

  public get cached() {
    return this._cached;
  }

  public setState(index: number, value: any): void {
    this._cached.set(index, value);
  }
}

export class MemoizedComponent<T = any, K extends MaltaElementBase<K> = {}> {
  private _vNode: MaltaElementBase<K>;
  private _node: T;
  public mounted: boolean = false;
  public component: MaltaComponent;

  private _memoized: {
    state: Cache;
  } = {
    state: new Cache(),
  };

  public get memoized() {
    return this._memoized;
  }

  public get vNode() {
    return this._vNode;
  }

  public get node() {
    return this._node;
  }

  constructor(vNode: MaltaElementBase<K>) {
    this._vNode = vNode;
  }

  public updateVNode(vNode: K): void {
    this._vNode = enhanceNode(vNode);
  }

  public updateNode(node: T): void {
    this._node = node;
  }

  public updateComponent(component: MaltaComponent) {
    this.component = component;
  }

  public mount() {
    this.mounted = true;
  }
}

export class Memo {
  private static _stack: Map<MaltaComponent, MemoizedComponent> = new Map();
  public static last: null | MaltaComponent = null;
  private static _globalStack: Stack[] = [];

  public static registerStack(stack: Stack) {
    this._globalStack.push(stack);
  }

  public static resetStack() {
    Memo.last = null;
    this._globalStack.forEach((stack) => stack.reset());
  }

  public static setStackContext(context: MaltaComponent) {
    this._globalStack.forEach((stack) => stack.setContext(context));
  }

  public static get stack(): Map<MaltaComponent, MemoizedComponent> {
    return this._stack;
  }

  public static get(component: MaltaComponent): MemoizedComponent | undefined {
    return this._stack.get(component);
  }

  public static push<K extends MaltaElementBase<K> = {}>(
    componentFunc: MaltaComponent,
    vNode: MaltaElementBase<K>
  ): void {
    const memoized = new MemoizedComponent(vNode);
    this._stack.set(componentFunc, memoized);
  }

  public static replace(
    prevComponentFunc: MaltaComponent,
    updatedComponentFunc: MaltaComponent,
    component?: MaltaComponent
  ) {
    const memoized = this._stack.get(prevComponentFunc);
    this._stack.delete(prevComponentFunc);
    if (memoized) {
      if (component) {
        memoized.component = component;
      }
      this._stack.set(updatedComponentFunc, memoized);
    }
  }

  public static delete(component: MaltaComponent): void {
    const memoizedComponent = this._stack.get(component);

    if (memoizedComponent && Array.isArray(memoizedComponent.vNode.content)) {
      memoizedComponent.vNode.content.forEach(
        (component) =>
          checkIfComponent(component) &&
          this.delete(getComponent(component as MaltaComponent))
      );
    }

    this._stack.delete(component);
  }
}

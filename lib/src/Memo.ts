import { MaltaComponent, MaltaElement } from "./types";
import enhanceNode from "./utils/enhannceNode";

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

export class MemoizedComponent {
  private _vNode: MaltaElement;
  private _node: HTMLElement;
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

  constructor(
    vNode: MaltaElement,
    node: HTMLElement,
    component: MaltaComponent
  ) {
    this._node = node;
    this._vNode = vNode;
    this.component = component;
    this.mounted = true;
  }

  public updateNode(vNode: MaltaElement): void {
    this._vNode = enhanceNode(vNode);
  }
}

export class Memo {
  private static _stack: Map<MaltaComponent, MemoizedComponent> = new Map();
  public static last: null | MaltaComponent = null;

  public static get stack(): Map<MaltaComponent, MemoizedComponent> {
    return this._stack;
  }

  public static get(component: MaltaComponent): MemoizedComponent | undefined {
    return this._stack.get(component);
  }

  public static push(
    component: MaltaComponent,
    componentFunc: MaltaComponent,
    node: HTMLElement,
    vNode: MaltaElement
  ): void {
    const memoized = new MemoizedComponent(vNode, node, component);
    this._stack.set(componentFunc, memoized);
  }

  public static replace(
    component: MaltaComponent,
    prevComponentFunc: MaltaComponent,
    updatedComponentFunc: MaltaComponent
  ) {
    const memoized = this._stack.get(prevComponentFunc);
    console.log(this._stack.get(updatedComponentFunc));
    this._stack.delete(prevComponentFunc);
    if (memoized) {
      memoized.component = component;
      this._stack.set(updatedComponentFunc, memoized);
    }
  }

  public static delete(component: MaltaComponent): void {
    this._stack.delete(component);
  }
}

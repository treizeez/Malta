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

  constructor(vNode: MaltaElement, node: HTMLElement) {
    this._vNode = vNode;
    this._node = node;
  }

  public updateNode(vNode: MaltaElement): void {
    this._vNode = enhanceNode(vNode);
  }

  public mount() {
    this.mounted = true;
    this._memoized.state.size = this._memoized.state.cached.size;
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
    vNode: MaltaElement,
    node: HTMLElement
  ): void {
    const memoized = new MemoizedComponent(vNode, node);
    this._stack.set(component, memoized);
  }

  public static replace(
    prevComponent: MaltaComponent,
    updatedComponent: MaltaComponent
  ) {
    const memoized = this._stack.get(prevComponent);
    this._stack.delete(prevComponent);
    if (memoized) {
      this._stack.set(updatedComponent, memoized);
    }
  }

  public static delete(component: MaltaComponent): void {
    this._stack.delete(component);
  }
}

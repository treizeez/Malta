import { Memo, MemoizedComponent } from "./Memo";
import { VDom } from "./VDom";
import { MaltaComponent } from "./types";
import enhanceNode from "./utils/enhannceNode";

export class StateStack {
  private static data: Set<Function> = new Set();
  private static _index: number = -1;

  public static get stack(): Set<Function> {
    return this.data;
  }

  public static increaseIndex(): number {
    this._index++;
    return this._index;
  }

  public static push(component: Function): void {
    this.data.add(component);
  }

  public static reset(): void {
    this.data.clear();
    this._index = -1;
  }

  public static get index() {
    return this._index;
  }

  public static setContext(context: MaltaComponent): void {
    for (const state of this.data) {
      state.apply(context);
    }
  }
}

export function State<T>(
  arg: T
): [() => T, (value: T | ((prev: T) => T)) => void] {
  const subscribers: Set<MaltaComponent> = new Set();

  let initialValue: T = arg;

  const index = StateStack.increaseIndex();

  let invoked = false;

  function setState(value: T | ((prev: T) => T)) {
    if (value !== initialValue) {
      if (typeof value === "function") {
        initialValue = (value as (prev: T) => T)(initialValue);
      } else {
        initialValue = value;
      }

      for (const component of subscribers) {
        const memoizedComponent = Memo.get(component);
        if (memoizedComponent) {
          memoizedComponent?.memoized.state.setState(index, initialValue);
          Memo.last = component;
          const prevVirtualNode = memoizedComponent.vNode;
          const updatedVirtualNode = enhanceNode(component());
          StateStack.setContext(component);
          StateStack.reset();
          Memo.last = null;

          VDom.update({
            updatedVirtualNode,
            prevVirtualNode,
            node: memoizedComponent?.node,
          });

          memoizedComponent?.updateNode(updatedVirtualNode);
        }
      }
    }
  }

  function getState(): T {
    if (!invoked) {
      StateStack.push(getState);
    }
    if (this) {
      const component: MaltaComponent = this;
      subscribers.add(component);
      const memoizedComponent = Memo.get(component);
      if (!memoizedComponent?.mounted) {
        const state = memoizedComponent?.memoized.state;
        state?.setState(index, arg);
      }
      invoked = true;
    }

    if (Memo.last) {
      const memoizedComponent = Memo.get(Memo.last);
      const val = memoizedComponent?.memoized.state.cached.get(index) as T;
      initialValue = val;
    }

    return initialValue;
  }

  return [getState, setState];
}

import { Memo } from "./Memo";
import { VDom } from "./VDom";
import { MaltaComponent } from "./types";

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

export function State<T>(arg: T): [T, (value: T | ((prev: T) => T)) => void] {
  const subscribers: Set<MaltaComponent> = new Set();

  let initialValue: T = arg;

  const index = StateStack.increaseIndex();

  function setState(value: T | ((prev: T) => T)) {
    if (value !== initialValue) {
      if (typeof value === "function") {
        initialValue = (value as (prev: T) => T)(initialValue);
      } else {
        initialValue = value;
      }

      for (const componentFunc of subscribers) {
        const memoizedComponent = Memo.get(componentFunc);
        if (memoizedComponent) {
          memoizedComponent.memoized.state.setState(index, initialValue);
          const prevVirtualNode = memoizedComponent.vNode;
          const updatedVirtualNode = memoizedComponent.component();

          VDom.update({
            updatedVirtualNode,
            prevVirtualNode,
            node: memoizedComponent?.node,
          });
        }
      }
    }
  }

  function getState(): T {
    StateStack.push(getState);
    if (this) {
      const component: MaltaComponent = this;
      subscribers.add(component);
    }

    if (Memo.last) {
      const memoizedComponent = Memo.get(Memo.last);
      const val = memoizedComponent?.memoized.state.cached.get(index) as T;
      if (val) {
        initialValue = val;
      }
    }

    return initialValue;
  }

  return [getState(), setState];
}

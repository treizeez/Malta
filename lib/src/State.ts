import { Memo, MemoizedComponent } from "./Memo";
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

export class StateMemo {
  private _value: any;

  constructor(value: any) {
    this._value = value;
  }

  public get value() {
    return this._value;
  }

  public updateValue(newValue: any): void {
    this._value = newValue;
  }
}

export function State<T>(
  arg: T
): [() => T, (value: T | ((prev: T) => T)) => void] {
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

      for (const component of subscribers) {
        const memoizedComponent = Memo.get(component);
        if (memoizedComponent) {
          memoizedComponent?.memoized.state.setState(index, initialValue);
          Memo.last = component;
          const prevVirtualNode = memoizedComponent.vNode;
          const updatedVirtualNode = component();
          StateStack.setContext(component);

          VDom.update({
            updatedVirtualNode,
            prevVirtualNode,
            node: memoizedComponent?.node,
          });

          memoizedComponent?.updateNode(updatedVirtualNode);
          StateStack.reset();
          Memo.last = null;
        }
      }
    }
  }

  function getState(): T {
    StateStack.push(getState);
    if (this) {
      const component: MaltaComponent = this;
      subscribers.add(component);
      const memoizedComponent = Memo.get(component);
      if (!memoizedComponent?.mounted) {
        const state = memoizedComponent?.memoized.state;
        state?.setState(index, arg);
      }
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

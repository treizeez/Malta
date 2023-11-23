import UI from "./UI";
import Stack from "./Stack";
import { Memo } from "./Memo";
import { MaltaComponent } from "./types";
import enhanceNode from "./utils/enhanceNode";

const StateStack = new Stack();

Memo.registerStack(StateStack);

function State<T>(arg: T): [T, (value: T | ((prev: T) => T)) => void] {
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
          const prevVirtualNode = enhanceNode(memoizedComponent.vNode);
          const updatedVirtualNode = memoizedComponent.component();
          UI.update({
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
      const memoizedComponent = Memo.get(component);
      if (!memoizedComponent?.mounted) {
        memoizedComponent?.memoized.state.setState(index, arg);
      }
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

export default State;

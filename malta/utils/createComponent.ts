import { Memo } from "../Memo";
import enhanceNode from "./enhanceNode";
import { MaltaComponent, MaltaElementBase } from "../types";

function createComponent<T extends MaltaElementBase<T>>(): MaltaElementBase<T> {
  const componentFunc: MaltaComponent<T> = this;

  Memo.resetStack();
  const memoized = Memo.get(componentFunc);

  if (memoized?.mounted) {
    Memo.last = componentFunc;
  }

  const vNode = componentFunc();

  const enhancedNode = enhanceNode(vNode);

  if (!vNode) {
    throw new Error("Component must return a valid MaltaElement");
  }

  if (!memoized) {
    Memo.push<T>(componentFunc, enhancedNode);
  }

  Memo.setStackContext(componentFunc);

  if (memoized?.mounted) {
    memoized.updateVNode(enhancedNode);
  }

  return enhancedNode;
}

export default createComponent;

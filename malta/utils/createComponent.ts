import { Memo } from "../Memo";
import enhanceNode from "./enhanceNode";
import { MaltaComponent, MaltaElementBase } from "../types";

function createComponent<
  T extends MaltaElementBase<T["content"]>
>(): MaltaElementBase<T["content"]> {
  const componentFunc: MaltaComponent<T> = this;

  Memo.resetStack();
  const memoized = Memo.get(componentFunc);

  if (memoized?.mounted) {
    Memo.last = componentFunc;
  }

  const vNode = componentFunc();

  if (!vNode) {
    throw new Error("Component must return a valid MaltaElement");
  }

  if (!memoized) {
    Memo.push<T>(componentFunc, vNode);
  }

  Memo.setStackContext(componentFunc);

  if (memoized?.mounted) {
    memoized.updateVNode(vNode);
  }

  return enhanceNode(vNode);
}

export default createComponent;

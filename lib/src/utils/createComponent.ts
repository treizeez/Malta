import { Memo } from "../Memo";
import { StateStack } from "../State";
import { MaltaComponent, MaltaElement } from "../types";
import enhanceNode from "./enhannceNode";

const createComponent = (componentFunc: MaltaComponent): MaltaElement => {
  Memo.last = null;
  StateStack.reset();
  const memoized = Memo.get(componentFunc);

  if (memoized?.mounted) {
    Memo.last = componentFunc;
  }

  const vNode = componentFunc();
  StateStack.setContext(componentFunc);
  Memo.last = null;
  StateStack.reset();

  if (memoized?.mounted) {
    memoized.updateNode(vNode);
  }

  return enhanceNode(vNode);
};

export default createComponent;

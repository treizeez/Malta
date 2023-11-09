import { MaltaElementBase } from "../types";

const enhanceNode = <T extends MaltaElementBase<T["content"]>>(vNode: T): T => {
  if (vNode.content && !Array.isArray(vNode.content)) {
    return {
      ...vNode,
      content: [vNode.content],
    };
  }
  if (vNode.content && Array.isArray(vNode.content)) {
    vNode.content = vNode.content.flat(Infinity);
  }

  return vNode;
};

export default enhanceNode;

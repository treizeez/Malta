import { MaltaElementBase } from "../types";

const enhanceNode = <T extends MaltaElementBase<T>>(vNode: T): T => {
  if (vNode?.body && !Array.isArray(vNode.body)) {
    return {
      ...vNode,
      body: [vNode.body],
    };
  }
  if (vNode?.body && Array.isArray(vNode.body)) {
    vNode.body = vNode.body.flat(Infinity);
  }

  return vNode;
};

export default enhanceNode;

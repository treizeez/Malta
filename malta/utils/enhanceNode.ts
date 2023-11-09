import { MaltaElementBase } from "../types";

const enhanceNode = <T extends MaltaElementBase<T["content"]>>(
  vNode: MaltaElementBase<T["content"]>
): MaltaElementBase<T["content"]> => {
  if (vNode.content && !Array.isArray(vNode.content)) {
    return {
      ...vNode,
      content: [vNode.content],
    };
  }

  return vNode;
};

export default enhanceNode;

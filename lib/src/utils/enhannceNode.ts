import { MaltaElement } from "../types";

const enhanceNode = (vNode: MaltaElement): MaltaElement => {
  if (vNode.content && !Array.isArray(vNode.content)) {
    return { ...vNode, content: [vNode.content as MaltaElement] };
  }

  return vNode;
};

export default enhanceNode;

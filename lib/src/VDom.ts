import { Dom } from "./Dom";
import { Memo, MemoizedComponent } from "./Memo";
import { StateStack } from "./State";
import { MaltaComponent, MaltaElement } from "./types";
import { isFunction } from "./utils/isFunction";

type mountInput = MaltaComponent | MaltaElement;

export class VDom {
  public static mount(input: mountInput): HTMLElement {
    const vNode: MaltaElement = isFunction<mountInput>(input);
    const dom = new Dom(vNode);

    dom.create();
    dom.initEvents();
    dom.setAttributes();
    dom.textNode();

    if (typeof input === "function") {
      Memo.push(input, vNode, dom.node);
      StateStack.setContext(input);
      StateStack.reset();
      Memo.get(input)?.mount();
    }

    if (vNode?.content) {
      if (!Array.isArray(vNode?.content)) {
        vNode.content = [vNode?.content];
      }
      vNode.content.map((content) => {
        if (typeof content !== "boolean") {
          const mounted = this.mount(content);
          mounted && dom.node.appendChild(mounted);
        }
      });
    }

    return dom.node;
  }

  public static update({
    updatedVirtualNode,
    prevVirtualNode,
    node,
  }: {
    updatedVirtualNode: MaltaElement;
    prevVirtualNode: MaltaElement;
    node: HTMLElement;
  }) {
    const { content: updatedContent } = updatedVirtualNode;
    const { content: prevContent } = prevVirtualNode;

    if (prevVirtualNode.tag !== updatedVirtualNode?.tag) {
      const newNode = this.mount(updatedVirtualNode);
      newNode && node.replaceWith(newNode);
    }

    const updatedNode = new Dom(updatedVirtualNode, node);

    if (Array.isArray(updatedContent) && Array.isArray(prevContent)) {
      for (let index = 0; index < node.children.length; index++) {
        const updatedVirtualNodeContent = updatedContent[index];
        const prevVirtualNodeContent = prevContent[index];

        while (!updatedVirtualNodeContent && node.children[index]) {
          node.children[index].remove();
        }

        if (node.children[index]) {
          const memoizedPrev =
            typeof prevVirtualNodeContent === "function" &&
            Memo.get(prevVirtualNodeContent);

          if (
            typeof prevVirtualNodeContent === "function" &&
            typeof updatedVirtualNodeContent === "function"
          ) {
            if (memoizedPrev) {
              Memo.replace(prevVirtualNodeContent, updatedVirtualNodeContent);
              Memo.last = updatedVirtualNodeContent;
            }
            StateStack.reset();
          }

          const updatedVNode = isFunction(updatedVirtualNodeContent);

          if (typeof updatedVirtualNodeContent === "function") {
            Memo.get(updatedVirtualNodeContent)?.updateNode(updatedVNode);
            StateStack.setContext(updatedVirtualNodeContent);
          }

          this.update({
            node: node.children[index] as HTMLElement,
            prevVirtualNode: memoizedPrev
              ? memoizedPrev.vNode
              : isFunction(prevVirtualNodeContent),
            updatedVirtualNode: updatedVNode,
          });
        }
      }

      for (const index in updatedContent) {
        if (!node.children[index]) {
          const mounted = this.mount(updatedContent[index]);

          mounted && node.appendChild(mounted);
        }
      }
    }

    updatedNode.initEvents();
    updatedNode.setAttributes();

    if (prevVirtualNode.textNode !== updatedVirtualNode.textNode) {
      const nodes = node?.childNodes;
      for (const i in nodes) {
        if (nodes[i].nodeName === "#text") {
          nodes[i].nodeValue = String(updatedVirtualNode.textNode);
        }
      }
    }
  }

  public static unmount(component: MaltaComponent) {
    Memo.delete(component);
  }
}

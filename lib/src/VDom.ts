import { Dom } from "./Dom";
import { Memo } from "./Memo";
import enhanceNode from "./utils/enhannceNode";
import createComponent from "./utils/createComponent";
import { MaltaComponent, MaltaElement } from "./types";

type mountInput = MaltaComponent | MaltaElement;

export class VDom {
  public static mount(input: mountInput): HTMLElement {
    const component: MaltaComponent =
      typeof input === "function" && createComponent.bind(null, input);

    const vNode: MaltaElement = component
      ? component()
      : enhanceNode(input as MaltaElement);
    const dom = new Dom(vNode);

    dom.create();
    dom.initEvents();
    dom.setAttributes();
    dom.textNode();

    if (typeof input === "function") {
      Memo.push(component, input, dom.node, vNode);
    }

    if (Array.isArray(vNode.content)) {
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
    componentFunc,
    node,
    prevVirtualNode,
    updatedVirtualNode,
  }: {
    componentFunc?: MaltaComponent;
    node: HTMLElement;
    prevVirtualNode: MaltaElement;
    updatedVirtualNode: MaltaElement;
  }) {
    const { content: updatedContent } = updatedVirtualNode;
    const { content: prevContent } = prevVirtualNode;

    if (prevVirtualNode.tag !== updatedVirtualNode?.tag) {
      if (componentFunc) {
        const memoized = Memo.get(componentFunc);
        if (memoized?.node) {
          node.replaceWith(memoized.node);
        }
      } else {
        const newNode = this.mount(updatedVirtualNode);
        if (newNode) {
          node.replaceWith(newNode);
        }
      }
    }

    const updatedNode = new Dom(updatedVirtualNode, node);

    if (Array.isArray(updatedContent) && Array.isArray(prevContent)) {
      for (let index = 0; index < node.children.length; index++) {
        const updatedVirtualNodeContent = updatedContent[index];
        const prevVirtualNodeContent = prevContent[index];

        while (!updatedVirtualNodeContent && node.children[index]) {
          node.children[index].remove();
          if (typeof prevVirtualNodeContent === "function") {
            this.unmount(prevVirtualNodeContent);
          }
        }

        if (node.children[index]) {
          if (
            typeof updatedVirtualNodeContent === "function" &&
            typeof prevVirtualNodeContent === "function"
          ) {
            const updatedVNodeContentComponent = createComponent.bind(
              null,
              updatedVirtualNodeContent
            );
            const memoizedPrevVnode = Memo.get(prevVirtualNodeContent)?.vNode;
            Memo.replace(
              updatedVNodeContentComponent,
              prevVirtualNodeContent,
              updatedVirtualNodeContent
            );
            const updatedVNodeContent = updatedVNodeContentComponent();

            this.update({
              componentFunc: updatedVirtualNodeContent,
              node: node.children[index] as HTMLElement,
              prevVirtualNode: memoizedPrevVnode as MaltaElement,
              updatedVirtualNode: enhanceNode(updatedVNodeContent),
            });
          } else if (typeof updatedVirtualNodeContent === "function") {
            this.mount(updatedVirtualNodeContent);
            const updatedVNode = Memo.get(updatedVirtualNodeContent);
            if (updatedVNode) {
              this.update({
                componentFunc: updatedVirtualNodeContent,
                node: node.children[index] as HTMLElement,
                prevVirtualNode: prevVirtualNodeContent as MaltaElement,
                updatedVirtualNode: updatedVNode.vNode,
              });
            }
          } else if (typeof prevVirtualNodeContent === "function") {
            const memoPrevNode = Memo.get(prevVirtualNodeContent);
            if (memoPrevNode) {
              this.update({
                node: node.children[index] as HTMLElement,
                prevVirtualNode: memoPrevNode.vNode as MaltaElement,
                updatedVirtualNode: updatedVirtualNodeContent,
              });
            }
          } else {
            this.update({
              node: node.children[index] as HTMLElement,
              prevVirtualNode: prevVirtualNodeContent as MaltaElement,
              updatedVirtualNode: updatedVirtualNodeContent,
            });
          }
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

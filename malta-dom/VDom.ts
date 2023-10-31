import { Dom } from "./Dom";
import { Memo } from "../malta/Memo";
import enhanceNode from "../malta/utils/enhanceNode";
import createComponent from "../malta/utils/createComponent";
import { MaltaComponent, MaltaElement } from "../malta/types";
import checkIfComponent from "../malta/utils/checkIfComponent";
import getComponent from "../malta/utils/getComponent";

type mountInput = MaltaComponent | MaltaElement;

export class VDom {
  public static mount(input: mountInput): HTMLElement {
    const component: MaltaComponent =
      checkIfComponent(input) &&
      createComponent.bind(getComponent(input as MaltaComponent));

    const vNode: MaltaElement = component
      ? component()
      : enhanceNode(input as MaltaElement);
    const dom = new Dom(vNode);

    dom.create();
    dom.initEvents();
    dom.setAttributes();
    dom.textNode();

    if (checkIfComponent(input)) {
      const memoized = Memo.get(getComponent(input as MaltaComponent));
      memoized?.updateComponent(component);
      memoized?.updateNode(dom.node);
      memoized?.mount();
    }

    if (Array.isArray(vNode.content)) {
      vNode.content.map((content) => {
        const mounted = VDom.mount(content);
        if (mounted) {
          dom.node.appendChild(mounted);
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
      let cleanPrevContent = prevContent;

      if (prevContent.length > updatedContent.length) {
        while (cleanPrevContent.length !== updatedContent.length) {
          const indicesToRemove: number[] = [];

          cleanPrevContent.forEach((prev, index) => {
            const fragmentIndex = updatedContent.findIndex(
              (next) => next.key === prev.key
            );

            if (fragmentIndex === -1) {
              indicesToRemove.push(index);
            }
          });

          if (indicesToRemove.length === 0) {
            break;
          }

          indicesToRemove.reverse().forEach((index) => {
            VDom.unmount(getComponent(prevContent[index] as MaltaComponent));
            cleanPrevContent.splice(index, 1);
            node.children[index].remove();
          });
        }
      }

      if (updatedContent.length > prevContent.length) {
        for (const index in updatedContent) {
          if (!prevContent[index]) {
            const mounted = this.mount(updatedContent[index]);

            if (mounted) {
              const keyToInsert = updatedContent[index].key;
              const insertIndex = prevContent.findIndex(
                (item) => item.key === keyToInsert
              );

              if (insertIndex >= 0) {
                node.insertBefore(mounted, node.children[insertIndex]);
              } else {
                node.appendChild(mounted);
              }
            }
          }
        }
      }

      for (let index = 0; index < cleanPrevContent.length; index++) {
        if (cleanPrevContent[index] && updatedContent[index]) {
          if (
            checkIfComponent(updatedContent[index]) &&
            checkIfComponent(cleanPrevContent[index])
          ) {
            const prevFunc = getComponent(
              cleanPrevContent[index] as MaltaComponent
            );
            const updatedFunc = getComponent(
              updatedContent[index] as MaltaComponent
            );

            Memo.replace(
              prevFunc as MaltaComponent,
              updatedFunc as MaltaComponent,
              createComponent.bind(updatedFunc)
            );

            const memoizedComponent = Memo.get(updatedFunc as MaltaComponent);

            const prevNode = memoizedComponent?.vNode;

            const updatedNode = memoizedComponent?.component();

            VDom.update({
              componentFunc: updatedFunc as MaltaComponent,
              node: node.children[index] as HTMLElement,
              prevVirtualNode: prevNode as MaltaElement,
              updatedVirtualNode: updatedNode as MaltaElement,
            });
          } else if (checkIfComponent(updatedContent[index])) {
            const updatedFunc = getComponent(
              updatedContent[index] as MaltaComponent
            );
            this.mount(updatedFunc);
            const updatedVNode = Memo.get(updatedFunc as MaltaComponent);
            if (updatedVNode) {
              VDom.update({
                componentFunc: updatedFunc as MaltaComponent,
                node: node.children[index] as HTMLElement,
                prevVirtualNode: cleanPrevContent[index] as MaltaElement,
                updatedVirtualNode: updatedVNode.vNode,
              });
            }
          } else if (checkIfComponent(cleanPrevContent[index])) {
            const prevFunc = checkIfComponent(cleanPrevContent[index]);
            const memoPrevNode = Memo.get(prevFunc as MaltaComponent);
            if (memoPrevNode) {
              VDom.update({
                node: node.children[index] as HTMLElement,
                prevVirtualNode: memoPrevNode.vNode as MaltaElement,
                updatedVirtualNode: updatedContent[index] as MaltaElement,
              });
            }
          } else {
            VDom.update({
              node: node.children[index] as HTMLElement,
              prevVirtualNode: cleanPrevContent[index] as MaltaElement,
              updatedVirtualNode: updatedContent[index] as MaltaElement,
            });
          }
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

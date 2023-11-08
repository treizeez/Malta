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
        if (content) {
          const mounted = VDom.mount(content);
          if (mounted) {
            dom.node.appendChild(mounted);
          }
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
        const newNode = VDom.mount(updatedVirtualNode);
        if (newNode) {
          node.replaceWith(newNode);
        }
      }
    }

    const updatedNode = new Dom(updatedVirtualNode, node);

    if (Array.isArray(updatedContent) && Array.isArray(prevContent)) {
      let cleanPrevContent = prevContent.filter(Boolean);
      let cleanUpdatedContent = updatedContent.filter(Boolean);

      const toInsert: {
        index: number;
        mounted: HTMLElement;
      }[] = [];

      if (updatedContent.length > cleanPrevContent.length) {
        const indiciesToRemove: number[] = [];
        for (let index = 0; index < updatedContent.length; index++) {
          if (!prevContent[index] && typeof prevContent[index] === "boolean") {
            if (updatedContent[index]) {
              indiciesToRemove.push(index);
              const mounted = VDom.mount(updatedContent[index]);
              toInsert.push({ index, mounted });
            }
          }
        }
        indiciesToRemove.reverse().forEach((index) => {
          cleanUpdatedContent.splice(index, 1);
        });
      }

      if (prevContent.length > cleanUpdatedContent.length) {
        const indiciesToRemove: number[] = [];
        for (let index = 0; index < prevContent.length; index++) {
          if (
            !updatedContent[index] &&
            typeof updatedContent[index] === "boolean"
          ) {
            if (prevContent[index]) {
              indiciesToRemove.push(index);
            }
          }
        }
        indiciesToRemove.reverse().forEach((index) => {
          cleanPrevContent.splice(index, 1);
          node.children[index].remove();
          VDom.unmount(getComponent(prevContent[index] as MaltaComponent));
        });
      }

      if (cleanPrevContent.length > cleanUpdatedContent.length) {
        while (cleanPrevContent.length !== cleanUpdatedContent.length) {
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

      if (cleanUpdatedContent.length > cleanPrevContent.length) {
        for (const index in cleanUpdatedContent) {
          if (!cleanPrevContent[index]) {
            const mounted = VDom.mount(cleanUpdatedContent[index]);

            if (mounted) {
              const keyToInsert = cleanUpdatedContent[index].key;
              const insertIndex = cleanPrevContent.findIndex(
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
        if (cleanPrevContent[index] && cleanUpdatedContent[index]) {
          if (
            checkIfComponent(cleanUpdatedContent[index]) &&
            checkIfComponent(cleanPrevContent[index])
          ) {
            const prevFunc = getComponent(
              cleanPrevContent[index] as MaltaComponent
            );
            const updatedFunc = getComponent(
              cleanUpdatedContent[index] as MaltaComponent
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
          } else if (checkIfComponent(cleanUpdatedContent[index])) {
            const updatedFunc = getComponent(
              cleanUpdatedContent[index] as MaltaComponent
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
                updatedVirtualNode: cleanUpdatedContent[index] as MaltaElement,
              });
            }
          } else {
            VDom.update({
              node: node.children[index] as HTMLElement,
              prevVirtualNode: cleanPrevContent[index] as MaltaElement,
              updatedVirtualNode: cleanUpdatedContent[index] as MaltaElement,
            });
          }
        }
      }

      toInsert.forEach(({ index, mounted }) => {
        node.insertBefore(mounted, node.children[index]);
      });
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

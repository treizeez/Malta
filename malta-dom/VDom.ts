import { Dom } from "./Dom";
import { Memo } from "../malta/Memo";
import enhanceNode from "../malta/utils/enhanceNode";
import createComponent from "../malta/utils/createComponent";
import { MaltaComponent, MaltaFragment } from "../malta/types";
import checkIfComponent from "../malta/utils/checkIfComponent";
import getComponent from "../malta/utils/getComponent";
import { MaltaElement } from "./types";

type mountInput =
  | MaltaComponent<MaltaElement>
  | MaltaElement
  | MaltaFragment<MaltaElement>;

export class VDom {
  public static mount(input: mountInput): HTMLElement {
    const component: MaltaComponent<MaltaElement> =
      checkIfComponent(input) &&
      createComponent.bind(getComponent(input as MaltaComponent));

    const vNode = component
      ? component()
      : enhanceNode<MaltaElement>(input as MaltaElement);
    const dom = new Dom(vNode as MaltaElement);

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
    componentFunc?: MaltaComponent<MaltaElement>;
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

      if (prevContent.length === updatedContent.length) {
        if (updatedContent.length > cleanPrevContent.length) {
          const dirtyPrevContent = prevContent.map((item, i) => {
            return item === false && updatedContent[i] === false ? item : 0;
          });

          const shallow = [...updatedContent];
          for (const index in dirtyPrevContent) {
            if (dirtyPrevContent[index] === 0 && updatedContent[index]) {
              const mounted = VDom.mount(
                updatedContent[index] as
                  | MaltaComponent<MaltaElement>
                  | MaltaElement
              );

              shallow.splice(Number(index), 1, null);
              toInsert.push({ index: Number(index), mounted });
            }
          }

          cleanUpdatedContent = shallow.filter(Boolean);
        }

        if (prevContent.length > cleanUpdatedContent.length) {
          const indiciesToRemove: number[] = [];
          const shallow = [...prevContent];
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
            shallow.splice(index, 1);
            cleanPrevContent = shallow.filter(Boolean);
            node.children[index].remove();
            VDom.unmount(getComponent(prevContent[index] as MaltaComponent));
          });
        }
      }

      if (cleanPrevContent.length > cleanUpdatedContent.length) {
        const indicesToRemove: number[] = [];
        cleanPrevContent.forEach((prev, index) => {
          const fragmentIndex = cleanUpdatedContent.findIndex(
            (next) =>
              (next as MaltaFragment<MaltaElement>).key ===
              (prev as MaltaFragment<MaltaElement>).key
          );

          if (fragmentIndex === -1) {
            indicesToRemove.push(index);
          }
        });
        indicesToRemove.reverse().forEach((index) => {
          const componentToRemove = cleanPrevContent[index];
          const domElementToRemove = node.children[index];

          if (componentToRemove && domElementToRemove) {
            VDom.unmount(getComponent(componentToRemove as MaltaComponent));
            cleanPrevContent.splice(index, 1);
            node.removeChild(domElementToRemove);
          }
        });
      }

      if (cleanUpdatedContent.length > cleanPrevContent.length) {
        const dirtyPrevContent = cleanUpdatedContent.map((item, i) => {
          const foundKey = cleanPrevContent.find(
            (prev) =>
              (prev as MaltaFragment<MaltaElement>).key ===
              (item as MaltaFragment<MaltaElement>).key
          );
          return foundKey ? item : null;
        });

        for (const index in dirtyPrevContent) {
          if (dirtyPrevContent[index] === null) {
            const mounted = VDom.mount(
              cleanUpdatedContent[index] as MaltaComponent<MaltaElement>
            );
            cleanUpdatedContent.splice(Number(index), 1, null);
            toInsert.push({ index: Number(index), mounted });
          }
        }

        cleanUpdatedContent = cleanUpdatedContent.filter(Boolean);
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
              componentFunc: updatedFunc as MaltaComponent<MaltaElement>,
              node: node.children[index] as HTMLElement,
              prevVirtualNode: prevNode as MaltaElement,
              updatedVirtualNode: updatedNode as MaltaElement,
            });
          } else if (checkIfComponent(cleanUpdatedContent[index])) {
            const updatedFunc = getComponent(
              cleanUpdatedContent[index] as MaltaComponent
            );
            this.mount(updatedFunc as MaltaComponent<MaltaElement>);
            const memoUpdated = Memo.get(updatedFunc as MaltaComponent);
            if (memoUpdated) {
              VDom.update({
                componentFunc: updatedFunc as MaltaComponent<MaltaElement>,
                node: node.children[index] as HTMLElement,
                prevVirtualNode: cleanPrevContent[index] as MaltaElement,
                updatedVirtualNode: memoUpdated?.vNode as MaltaElement,
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

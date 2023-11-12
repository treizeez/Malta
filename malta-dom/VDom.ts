import { Dom } from "./Dom";
import { Memo } from "../malta/Memo";
import enhanceNode from "../malta/utils/enhanceNode";
import createComponent from "../malta/utils/createComponent";
import { MaltaComponent, MaltaFragment } from "../malta/types";
import checkIfComponent from "../malta/utils/checkIfComponent";
import getComponent from "../malta/utils/getComponent";
import { MaltaElement, MaltaNode } from "./types";
import checkIfText from "./utils/checkIfText";

const TO_INSERT = "toInsert";
const TO_DELETE = "toDelete";

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

    if (checkIfComponent(input)) {
      const memoized = Memo.get(getComponent(input as MaltaComponent));
      memoized?.updateComponent(component);
      memoized?.updateNode(dom.node);
      memoized?.mount();
    }

    if (Array.isArray(vNode.body)) {
      vNode.body.map((body) => {
        if ((typeof body === "number" && String(body)) || body) {
          if (typeof body === "string" || typeof body === "number") {
            dom.node.appendChild(dom.textNode(String(body)));
          } else {
            const mounted = VDom.mount(body);
            if (mounted) {
              dom.node.appendChild(mounted);
            }
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
    prevVirtualNode: MaltaElement | string;
    updatedVirtualNode: MaltaElement | string;
  }) {
    if (checkIfText(updatedVirtualNode)) {
      const textNode = document.createTextNode(updatedVirtualNode as string);
      node.replaceWith(textNode);
      return;
    }

    const { body: updatedBody } = updatedVirtualNode as MaltaElement;
    const { body: prevBody } = prevVirtualNode as MaltaElement;

    const updatedNode = new Dom(updatedVirtualNode as MaltaElement, node);

    if (
      (prevVirtualNode as MaltaElement)?.tag !==
      (updatedVirtualNode as MaltaElement)?.tag
    ) {
      if (componentFunc) {
        const memoized = Memo.get(componentFunc);
        if (memoized?.node) {
          node.replaceWith(memoized.node);
        }
      } else {
        const newNode = VDom.mount(updatedVirtualNode as MaltaElement);
        if (newNode) {
          node.replaceWith(newNode);
        }
      }
    }

    if (Array.isArray(updatedBody) && Array.isArray(prevBody)) {
      let cleanPrevBody = prevBody.filter(Boolean);
      let cleanUpdatedBody = updatedBody.filter(Boolean);

      const toInsert: {
        index: number;
        mounted: HTMLElement;
      }[] = [];

      if (prevBody.length === updatedBody.length) {
        if (updatedBody.length > cleanPrevBody.length) {
          const dirtyPrevBody = prevBody
            .map((item, i) => {
              return item === false && updatedBody[i] ? TO_INSERT : item;
            })
            .filter(Boolean);

          const shallow = [...cleanUpdatedBody];
          for (const index in dirtyPrevBody) {
            if (dirtyPrevBody[index] === TO_INSERT && cleanUpdatedBody[index]) {
              const mounted = VDom.mount(
                cleanUpdatedBody[index] as
                  | MaltaComponent<MaltaElement>
                  | MaltaElement
              );

              shallow.splice(Number(index), 1, null);
              toInsert.push({ index: Number(index), mounted });
            }
          }

          cleanUpdatedBody = shallow.filter(Boolean);
        }

        if (prevBody.length > cleanUpdatedBody.length) {
          const indiciesToRemove: number[] = [];
          const dirtyUpdatedBody = updatedBody
            .map((item, i) => {
              return item === false && prevBody[i] ? TO_DELETE : item;
            })
            .filter(Boolean);
          for (const index in dirtyUpdatedBody) {
            if (dirtyUpdatedBody[index] === TO_DELETE) {
              indiciesToRemove.push(Number(index));
            }
          }
          indiciesToRemove.reverse().forEach((index) => {
            VDom.unmount(getComponent(cleanPrevBody[index] as MaltaComponent));
            cleanPrevBody.splice(index, 1);
            node.childNodes[index].remove();
          });
        }
      }

      if (cleanPrevBody.length > cleanUpdatedBody.length) {
        const indicesToRemove: number[] = [];
        cleanPrevBody.forEach((prev, index) => {
          const fragmentIndex = cleanUpdatedBody.findIndex(
            (next) =>
              (next as MaltaFragment<MaltaElement>).key ===
              (prev as MaltaFragment<MaltaElement>).key
          );

          if (fragmentIndex === -1) {
            indicesToRemove.push(index);
          }
        });
        indicesToRemove.reverse().forEach((index) => {
          const componentToRemove = cleanPrevBody[index];
          const domElementToRemove = node.childNodes[index];

          if (componentToRemove && domElementToRemove) {
            VDom.unmount(getComponent(componentToRemove as MaltaComponent));
            cleanPrevBody.splice(index, 1);
            node.removeChild(domElementToRemove);
          }
        });
      }

      if (cleanUpdatedBody.length > cleanPrevBody.length) {
        const dirtyPrevBody = cleanUpdatedBody.map((item, i) => {
          const foundKey = cleanPrevBody.find(
            (prev) =>
              (prev as MaltaFragment<MaltaElement>).key ===
              (item as MaltaFragment<MaltaElement>).key
          );
          return foundKey ? item : null;
        });

        for (const index in dirtyPrevBody) {
          if (dirtyPrevBody[index] === null) {
            const mounted = VDom.mount(
              cleanUpdatedBody[index] as MaltaComponent<MaltaElement>
            );
            cleanUpdatedBody.splice(Number(index), 1, null);
            toInsert.push({ index: Number(index), mounted });
          }
        }

        cleanUpdatedBody = cleanUpdatedBody.filter(Boolean);
      }

      for (let index = 0; index < cleanPrevBody.length; index++) {
        if (cleanPrevBody[index] && cleanUpdatedBody[index]) {
          if (
            checkIfComponent(cleanUpdatedBody[index]) &&
            checkIfComponent(cleanPrevBody[index])
          ) {
            const prevFunc = getComponent(
              cleanPrevBody[index] as MaltaComponent
            );
            const updatedFunc = getComponent(
              cleanUpdatedBody[index] as MaltaComponent
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
              node: node.childNodes[index] as HTMLElement,
              prevVirtualNode: enhanceNode<MaltaElement>(
                prevNode as MaltaElement
              ),
              updatedVirtualNode: updatedNode as MaltaElement,
            });
          } else if (checkIfComponent(cleanUpdatedBody[index])) {
            const updatedFunc = getComponent(
              cleanUpdatedBody[index] as MaltaComponent
            );
            this.mount(updatedFunc as MaltaComponent<MaltaElement>);
            const memoUpdated = Memo.get(updatedFunc as MaltaComponent);
            if (memoUpdated) {
              VDom.update({
                componentFunc: updatedFunc as MaltaComponent<MaltaElement>,
                node: node.childNodes[index] as HTMLElement,
                prevVirtualNode: enhanceNode<MaltaElement>(
                  cleanPrevBody[index] as MaltaElement
                ),
                updatedVirtualNode: memoUpdated?.vNode as MaltaElement,
              });
            }
          } else if (checkIfComponent(cleanPrevBody[index])) {
            const prevFunc = checkIfComponent(cleanPrevBody[index]);
            const memoPrevNode = Memo.get(prevFunc as MaltaComponent);
            if (memoPrevNode) {
              VDom.update({
                node: node.childNodes[index] as HTMLElement,
                prevVirtualNode: memoPrevNode.vNode as MaltaElement,
                updatedVirtualNode: enhanceNode<MaltaElement>(
                  cleanUpdatedBody[index] as MaltaElement
                ),
              });
            }
          } else if (checkIfText(cleanUpdatedBody[index])) {
            if (
              String(cleanPrevBody[index]) !== String(cleanUpdatedBody[index])
            ) {
              const textNode = updatedNode.textNode(
                String(cleanUpdatedBody[index])
              );
              node.childNodes[index].replaceWith(textNode);
            }
          } else {
            VDom.update({
              node: node.childNodes[index] as HTMLElement,
              prevVirtualNode: enhanceNode<MaltaElement>(
                cleanPrevBody[index] as MaltaElement
              ),
              updatedVirtualNode: enhanceNode<MaltaElement>(
                cleanUpdatedBody[index] as MaltaElement
              ),
            });
          }
        }
      }

      toInsert.forEach(({ index, mounted }) => {
        node.insertBefore(mounted, node.childNodes[index]);
      });
    }

    updatedNode.initEvents();
    updatedNode.setAttributes();
  }

  public static unmount(component: MaltaComponent) {
    Memo.delete(component);
  }
}

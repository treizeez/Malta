import { MaltaElement } from "../malta/types";

export class Dom {
  private _vNode: MaltaElement;
  private _node: HTMLElement;

  constructor(vNode: MaltaElement, node?: HTMLElement) {
    this._vNode = vNode;
    if (node) {
      this._node = node;
    }
  }

  public get node(): HTMLElement {
    return this._node;
  }

  create() {
    this._node = document.createElement(this._vNode.tag);
  }

  setAttributes() {
    const attributes = this._vNode?.attrs;
    if (attributes) {
      for (const attribute in attributes) {
        this._node.setAttribute(attribute, attributes[attribute]);
      }
    }
  }

  textNode() {
    const textNode = this._vNode?.textNode;
    if (textNode && typeof textNode !== "boolean") {
      const text = document.createTextNode(String(textNode));
      this._node.appendChild(text);
    }
  }

  initEvents() {
    for (const key in this._vNode) {
      if (key.startsWith("on")) {
        const event = key.toLowerCase();
        const func: (event?: Event) => any = this._vNode[key];
        this._node[event] = func;
      }
    }
  }
}

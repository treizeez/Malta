import { MaltaElement, MaltaNode } from "./types";

const reservedKeys: string[] = ["tag", "body"];

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
    if ((this._vNode as MaltaElement)?.tag) {
      this._node = document.createElement((this._vNode as MaltaElement).tag);
    }
  }

  setAttributes() {
    if (this._vNode && typeof this._vNode === "object") {
      for (const attribute in this._vNode) {
        if (!attribute.startsWith("on") && !reservedKeys.includes(attribute)) {
          this._node.setAttribute(attribute, this._vNode[attribute]);
        }
      }
    }
  }

  textNode(text: string) {
    const textNode = document.createTextNode(text);
    return textNode;
  }

  initEvents() {
    for (const key in this._vNode) {
      if (key?.startsWith("on")) {
        const event = key.toLowerCase();
        const func: (event?: Event) => any = this._vNode[key];
        this._node[event] = func;
      }
    }
  }
}

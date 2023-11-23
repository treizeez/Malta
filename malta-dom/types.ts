import {
  MaltaComponent,
  MaltaElementBase,
  MaltaFragment,
} from "../malta/types";

export declare type MaltaNode =
  | boolean
  | boolean[]
  | MaltaComponent<MaltaElement>
  | MaltaComponent<MaltaElement>[]
  | MaltaFragment<MaltaElement>
  | MaltaFragment<MaltaElement>[]
  | MaltaElement
  | MaltaElement[]
  | null
  | string
  | string[];

export declare interface MaltaElement
  extends MaltaElementBase<{ body?: MaltaNode }> {
  tag: keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap;
  textNode?: string | boolean | Number;
  attrs?:
    | Partial<
        | HTMLElement
        | HTMLHyperlinkElementUtils
        | HTMLIFrameElement
        | HTMLImageElement
        | HTMLInputElement
        | HTMLLIElement
        | HTMLLabelElement
        | HTMLLegendElement
        | HTMLLinkElement
        | HTMLMapElement
        | HTMLMediaElement
        | HTMLMenuElement
        | HTMLMetaElement
        | HTMLMeterElement
        | HTMLModElement
        | HTMLOListElement
        | HTMLObjectElement
        | HTMLOptGroupElement
        | HTMLOptionElement
        | HTMLOptionsCollection
        | HTMLOrSVGElement
        | HTMLOutputElement
        | HTMLParagraphElement
        | HTMLParagraphElement
        | HTMLPictureElement
        | HTMLPreElement
        | HTMLProgressElement
        | HTMLVideoElement
        | HTMLVideoElementEventMap
        | HTMLUnknownElement
        | HTMLUListElement
        | HTMLUListElement
        | HTMLTrackElement
        | HTMLTitleElement
        | HTMLTimeElement
        | HTMLTextAreaElement
        | HTMLTemplateElement
        | HTMLSourceElement
      >
    | { [key: string]: string };
  style?: {
    [key in keyof CSSStyleDeclaration]?:
      | keyof CSSStyleDeclaration
      | string
      | number;
  };
}

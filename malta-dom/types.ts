import { MaltaComponent, MaltaFragment } from "../malta/types";

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
  | null[]
  | string
  | string[];

export declare type MaltaElement =
  | {
      [key in `on${keyof GlobalEventHandlersEventMap}`]?: (event: Event) => any;
    } & {
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
      content?: MaltaNode;
      style?: {
        [key in keyof CSSStyleDeclaration]?:
          | keyof CSSStyleDeclaration
          | string
          | number;
      };
    };

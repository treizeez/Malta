import UI from "../malta/UI";
import { VDom } from "./VDom";
import { MaltaComponent, MaltaElement } from "../malta/types";

type MaltaRenderInput =
  | MaltaElement
  | MaltaComponent
  | MaltaElement[]
  | MaltaComponent[];

export const Render = (
  input: MaltaRenderInput,
  root: HTMLElement = document.body
): void => {
  UI.init<HTMLElement>(VDom.update);
  if (Array.isArray(input)) {
    input.forEach((node) => {
      if (node) {
        const mounted = VDom.mount(node);
        if (mounted) {
          root.appendChild(mounted);
        } else {
          throw new Error("Nothing was mounted");
        }
      }
    });
    return;
  }

  if (input) {
    const mounted = VDom.mount(input);
    mounted && root.appendChild(mounted);
  } else {
    throw new Error("Nothing was passed into the Render function");
  }
};

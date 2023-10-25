import { VDom } from "./VDom";
import { MaltaComponent, MaltaElement } from "./types";

type MaltaRenderInput =
  | MaltaElement
  | MaltaComponent
  | MaltaElement[]
  | MaltaComponent[];

export const Render = (
  input: MaltaRenderInput,
  root: HTMLElement = document.body
): void => {
  if (Array.isArray(input)) {
    input.forEach((node) => {
      const mounted = VDom.mount(node);
      mounted && root.appendChild(mounted);
    });
    return;
  }

  const mounted = VDom.mount(input);
  mounted && root.appendChild(mounted);
};

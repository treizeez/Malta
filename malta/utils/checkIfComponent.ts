import { MaltaComponent, MaltaElement } from "../../malta/types";

const checkIfComponent = (draft: MaltaElement | MaltaComponent) =>
  typeof draft === "function" || draft.component;

export default checkIfComponent;

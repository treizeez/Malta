import { MaltaComponent } from "../../malta/types";

const checkIfComponent = (draft: any) =>
  typeof draft === "function" || draft.component;

export default checkIfComponent;

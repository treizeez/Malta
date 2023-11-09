import { MaltaComponent, MaltaFragment } from "../../malta/types";

const getComponent = (draft: MaltaComponent | MaltaFragment) =>
  (draft as MaltaFragment).component || draft;

export default getComponent;

import { MaltaComponent } from "../../malta/types";

const getComponent = (draft: MaltaComponent) => draft.component || draft;

export default getComponent;

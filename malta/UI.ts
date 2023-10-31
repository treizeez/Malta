import { MaltaComponent, MaltaElement } from "./types";

type Update<T = any> = (val: {
  componentFunc?: MaltaComponent;
  node: T;
  prevVirtualNode: MaltaElement;
  updatedVirtualNode: MaltaElement;
}) => void;

class UI {
  public static update: Update = (_) => undefined;
  public static init<T>(update: Update<T>) {
    this.update = update;
  }
}

export default UI;

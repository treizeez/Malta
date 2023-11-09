import { MaltaComponent } from "./types";

type Update<T = any, K = {}> = (val: {
  componentFunc?: MaltaComponent;
  node: T;
  prevVirtualNode: K;
  updatedVirtualNode: K;
}) => void;

class UI {
  public static update: Update = (_) => undefined;
  public static init<T, K = {}>(update: Update<T, K>) {
    this.update = update;
  }
}

export default UI;

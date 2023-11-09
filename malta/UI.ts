import { MaltaComponent, MaltaElementBase } from "./types";

type Update<
  T extends {} = {},
  K extends MaltaElementBase<K["content"]> = {}
> = (val: {
  componentFunc?: MaltaComponent<K>;
  node: T;
  prevVirtualNode: K;
  updatedVirtualNode: K;
}) => void;

class UI {
  public static update;
  public static init<
    T extends {} = {},
    K extends MaltaElementBase<K["content"]> = {}
  >(update: Update<T, K>) {
    this.update = update;
  }
}

export default UI;

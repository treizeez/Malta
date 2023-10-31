import { MaltaComponent } from "./types";

export class Stack {
  private data: Set<Function> = new Set();
  private _index: number = -1;

  public get stack(): Set<Function> {
    return this.data;
  }

  public increaseIndex(): number {
    this._index++;
    return this._index;
  }

  public push(component: Function): void {
    this.data.add(component);
  }

  public reset(): void {
    this.data.clear();
    this._index = -1;
  }

  public get index() {
    return this._index;
  }

  public setContext(context: MaltaComponent): void {
    for (const state of this.data) {
      state.apply(context);
    }
  }
}

export default Stack;

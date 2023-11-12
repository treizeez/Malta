import { MaltaNode } from "../types";

const checkIfText = (node: MaltaNode | undefined) =>
  typeof node === "string" || typeof node === "number";

export default checkIfText;

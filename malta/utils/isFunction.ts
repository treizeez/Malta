export const isFunction = <T>(func: T) =>
  typeof func === "function" ? func() : func;

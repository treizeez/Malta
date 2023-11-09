type PseudoClass =
  | ":active"
  | "::after"
  | "::backdrop"
  | ":before"
  | "::before"
  | ":checked"
  | ":default"
  | ":defined"
  | ":dir"
  | ":disabled"
  | ":empty"
  | ":enabled"
  | "::first-letter"
  | "::first-line"
  | ":first-of-type"
  | ":focus"
  | ":focus-visible"
  | ":focus-within"
  | "::grammar-error"
  | ":hover"
  | ":in-range"
  | "::marker"
  | ":not"
  | ":nth-child"
  | ":nth-last-child"
  | ":nth-last-of-type"
  | ":nth-of-type"
  | ":only-child"
  | ":only-of-type"
  | ":optional"
  | "::placeholder"
  | ":read-only"
  | ":read-write"
  | "::selection"
  | ":target"
  | ":valid"
  | ":visited";

export declare type MaltaCss =
  | {
      [key in keyof CSSStyleDeclaration]?:
        | keyof CSSStyleDeclaration
        | string
        | number;
    }
  | {
      [key: string]: MaltaCss;
    }
  | {
      [key in `&${PseudoClass}`]: MaltaCss;
    }
  | {
      inline?: boolean;
    };

export declare interface MaltaElementBase<T = {}> {
  content?: T | T[];
}

export declare type MaltaFragment<
  T extends MaltaElementBase<T["content"]> = {}
> = {
  key: string | number;
  component: () => T;
};

export declare type MaltaComponent<
  T extends MaltaElementBase<T["content"]> = {}
> = () => T;

import React, { useContext, useMemo } from "react";

export type Shelf<Hooks extends {}> = Readonly<Partial<Hooks>>;

export type ShelfProvider<Hooks extends {}> = React.FC<Readonly<{ shelf: Shelf<Hooks> }>>;

export type UseShelf<Hooks extends {}> = <K extends keyof Hooks>(
  key: K,
  ...params: UseShelfParameters<Hooks, K>
) => UseShelfReturnType<Hooks, K>;

type UseShelfParameters<Hooks extends {}, K extends keyof Hooks> = Hooks[K] extends (
  ...params: infer P
) => unknown
  ? P
  : never;

type UseShelfReturnType<Hooks extends {}, K extends keyof Hooks> = Hooks[K] extends (
  ...params: never
) => infer R
  ? R
  : never;

export function createShelf<Hooks extends {}>(): [ShelfProvider<Hooks>, UseShelf<Hooks>] {
  const ShelfContext = React.createContext<Shelf<Hooks> | undefined>(undefined);

  const ShelfProvider: ShelfProvider<Hooks> = ({ shelf, children }) => {
    const parentShelf = useContext(ShelfContext);
    const childShelf = useMemo(
      () => ({
        ...parentShelf,
        ...shelf,
      }),
      [parentShelf, shelf]
    );
    return <ShelfContext.Provider value={childShelf}>{children}</ShelfContext.Provider>;
  };

  const useShelf = <K extends keyof Hooks>(
    key: K,
    ...params: UseShelfParameters<Hooks, K>
  ): UseShelfReturnType<Hooks, K> => {
    const shelf = useContext(ShelfContext);
    const useHook = shelf?.[key];
    if (typeof useHook !== "function") {
      throw new Error(
        `hook '${String(key)}' is not in the shelf or not a function: ${String(useHook)}`
      );
    }
    return useHook(...params) as UseShelfReturnType<Hooks, K>;
  };

  return [ShelfProvider, useShelf];
}

import React, { useContext, useMemo } from "react";

type AbstractHooks = Readonly<{ [key: string]: (...params: never[]) => unknown }>;

export type Shelf<Hooks extends AbstractHooks> = Partial<Hooks>;

export type UseShelf<Hooks extends AbstractHooks> = <K extends keyof Hooks>(key: K) => Hooks[K];

export type ShelfProvider<Hooks extends AbstractHooks> = React.FC<
  Readonly<{ shelf: Shelf<Hooks> }>
>;

export function createShelf<Hooks extends AbstractHooks>(
  defaultHooks: Hooks
): [UseShelf<Hooks>, ShelfProvider<Hooks>] {
  const ShelfContext = React.createContext<Shelf<Hooks>>(defaultHooks);

  const useShelf = <K extends keyof Hooks>(key: K): Hooks[K] => {
    const shelf = useContext(ShelfContext);
    const useHook = shelf[key];
    if (typeof useHook !== "function") {
      throw new Error(
        `hook '${String(key)}' is not in the shelf or not a function: ${String(useHook)}`
      );
    }
    return useHook as Hooks[K];
  };

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

  return [useShelf, ShelfProvider];
}

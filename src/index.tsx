import React, { useContext, useMemo } from "react";

export type Shelf<Hooks extends {}> = Readonly<Partial<Hooks>>;

export type ShelfProvider<Hooks extends {}> = React.FC<Readonly<{ shelf: Shelf<Hooks> }>>;

export type UseShelf<Hooks extends {}> = <K extends keyof Hooks>(key: K) => Hooks[K];

export function createShelf<Hooks extends {}>(
  defaultShelf?: Shelf<Hooks>
): [UseShelf<Hooks>, ShelfProvider<Hooks>] {
  const ShelfContext = React.createContext<Shelf<Hooks> | undefined>(defaultShelf);

  const useShelf = <K extends keyof Hooks>(key: K): Hooks[K] => {
    const shelf = useContext(ShelfContext);
    const useHook = shelf?.[key];
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

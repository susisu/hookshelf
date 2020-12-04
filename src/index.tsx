import React, { useContext, useMemo } from "react";

type AbstractHooks = Readonly<{ [key: string]: (...params: never[]) => unknown }>;

export type Shelf<Hooks extends AbstractHooks> = Partial<Hooks>;

export type ShelfProvider<Hooks extends AbstractHooks> = React.FC<
  Readonly<{ shelf: Shelf<Hooks> }>
>;

export type UseShelf<Hooks extends AbstractHooks> = <K extends keyof Hooks>(key: K) => Hooks[K];

export function createShelf<Hooks extends AbstractHooks>(
  defaultHooks: Hooks
): [ShelfProvider<Hooks>, Hooks, UseShelf<Hooks>] {
  const ShelfContext = React.createContext<Shelf<Hooks>>(defaultHooks);

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

  // Create proxy hooks.
  // This operation is unsafe in general, because `defaultHooks` may have keys that is not listed in
  // `keyof Hooks`, and even have members that is not a function.
  // However, it is safe in most use cases.
  const proxyHooks: Partial<Hooks> = {};
  for (const key of Object.keys(defaultHooks)) {
    const useHook = {
      // Set the same name as that in `defaultHooks`.
      [key]: (...params: never[]): unknown => {
        const useHook = useShelf(key);
        return useHook(...params);
      },
    }[key];
    proxyHooks[key as keyof Hooks] = useHook as Hooks[keyof Hooks];
  }

  return [ShelfProvider, proxyHooks as Hooks, useShelf];
}

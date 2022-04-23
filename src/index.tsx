import React, { createContext, useContext, useMemo } from "react";

type AbstractHooks = Readonly<{ [key: string]: (...params: never[]) => unknown }>;

export type HooksProviderComponent<Hooks extends AbstractHooks> = React.FC<
  React.PropsWithChildren<Readonly<{ hooks: Readonly<Partial<Hooks>> }>>
>;

/**
 * Create a `React.Context` (= shelf) that can store hooks.
 * @param defaultHooks A set of hooks that is in the shelf by default.
 * @returns A pair of
 * - a provider component that provides hooks to the shelf, and
 * - a set of proxy hooks that will invoke hooks in the shelf when called.
 */
export function createHookshelf<Hooks extends AbstractHooks>(
  defaultHooks: Readonly<Hooks>
): [HooksProviderComponent<Hooks>, Hooks] {
  const Hookshelf = createContext<Readonly<Hooks>>(defaultHooks);

  const HooksProvider: HooksProviderComponent<Hooks> = ({ hooks, children }) => {
    const parentHooks = useContext(Hookshelf);
    const childHooks = useMemo(
      () => ({
        ...parentHooks,
        ...hooks,
      }),
      [parentHooks, hooks]
    );
    return <Hookshelf.Provider value={childHooks}>{children}</Hookshelf.Provider>;
  };

  const useHook = <K extends keyof Hooks>(key: K): Hooks[K] => {
    const hooks = useContext(Hookshelf);
    const useX = hooks[key];
    if (typeof useX !== "function") {
      throw new Error(
        `hook '${String(key)}' is not in the shelf or not a function: ${String(useX)}`
      );
    }
    return useX;
  };

  const proxyHooks: Partial<Hooks> = {};
  for (const key of Object.keys(defaultHooks)) {
    const useXProxy = {
      // Set the same name as that in `defaultHooks`.
      [key]: (...params: never[]): unknown => {
        const useX = useHook(key);
        return useX(...params);
      },
    }[key];
    proxyHooks[key as keyof Hooks] = useXProxy as Hooks[keyof Hooks];
  }

  return [HooksProvider, proxyHooks as Hooks];
}

import React, { useContext, useMemo } from "react";

type AbstractHooks = Readonly<{ [key: string]: (...params: never[]) => unknown }>;

export type HooksProviderComponent<Hooks extends AbstractHooks> = React.FC<
  Readonly<{ hooks: Readonly<Partial<Hooks>> }>
>;

export type UseHook<Hooks extends AbstractHooks> = <K extends keyof Hooks>(key: K) => Hooks[K];

export function createHookshelf<Hooks extends AbstractHooks>(
  defaultHooks: Readonly<Hooks>
): [HooksProviderComponent<Hooks>, Hooks, UseHook<Hooks>] {
  const Hookshelf = React.createContext<Readonly<Hooks>>(defaultHooks);

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
    return useX as Hooks[K];
  };

  // Create proxy hooks.
  // This operation is unsafe in general, because `defaultHooks` may have keys that is not listed in
  // `keyof Hooks`, and even have members that is not a function.
  // However, it is safe in most use cases.
  const proxyHooks: Partial<Hooks> = {};
  for (const key of Object.keys(defaultHooks)) {
    const useProxyHook = {
      // Set the same name as that in `defaultHooks`.
      [key]: (...params: never[]): unknown => {
        const useX = useHook(key);
        return useX(...params);
      },
    }[key];
    proxyHooks[key as keyof Hooks] = useProxyHook as Hooks[keyof Hooks];
  }

  return [HooksProvider, proxyHooks as Hooks, useHook];
}

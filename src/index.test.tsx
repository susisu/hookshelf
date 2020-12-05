import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { HooksProviderComponent, createHookshelf } from ".";

describe("createHookshelf", () => {
  type Hooks = {
    useNumber: (id: string) => number;
    useString: (id: string) => string;
  };

  const createFixture = (): {
    defaultHooks: Hooks;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    HooksProvider: HooksProviderComponent<Hooks>;
    proxyHooks: Hooks;
  } => {
    const defaultHooks: Hooks = {
      useNumber: jest.fn(() => 0),
      useString: jest.fn((): string => ""),
    };
    const [HooksProvider, proxyHooks] = createHookshelf(defaultHooks);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { defaultHooks, HooksProvider, proxyHooks };
  };

  test("Proxy hooks can call hooks in the shelf", () => {
    const { defaultHooks, proxyHooks } = createFixture();

    const t1 = renderHook(() => proxyHooks.useNumber("answer"));
    expect(defaultHooks.useNumber).toHaveBeenCalledWith("answer");
    expect(t1.result.current).toBe(0);

    const t2 = renderHook(() => proxyHooks.useString("name"));
    expect(defaultHooks.useString).toHaveBeenCalledWith("name");
    expect(t2.result.current).toBe("");
  });

  test("A provider can override the hooks in the shelf", () => {
    const { defaultHooks, HooksProvider, proxyHooks } = createFixture();

    const hooks: Partial<Hooks> = {
      useNumber: jest.fn(() => 42),
    };
    const Wrapper: React.FC = ({ children }) => (
      <HooksProvider hooks={hooks}>{children}</HooksProvider>
    );

    const t1 = renderHook(() => proxyHooks.useNumber("answer"), { wrapper: Wrapper });
    expect(defaultHooks.useNumber).not.toHaveBeenCalled();
    expect(hooks.useNumber).toHaveBeenCalledWith("answer");
    expect(t1.result.current).toBe(42);

    const t2 = renderHook(() => proxyHooks.useString("name"), { wrapper: Wrapper });
    expect(defaultHooks.useString).toHaveBeenCalledWith("name");
    expect(t2.result.current).toBe("");
  });

  test("Hooks provided by multiple providers are merged", () => {
    const { defaultHooks, HooksProvider, proxyHooks } = createFixture();

    const hooks1: Partial<Hooks> = {
      useNumber: jest.fn(() => 42),
    };
    const hooks2: Partial<Hooks> = {
      useString: jest.fn(() => "Alice"),
    };
    const Wrapper: React.FC = ({ children }) => (
      <HooksProvider hooks={hooks1}>
        <HooksProvider hooks={hooks2}>{children}</HooksProvider>
      </HooksProvider>
    );

    const t1 = renderHook(() => proxyHooks.useNumber("answer"), { wrapper: Wrapper });
    expect(defaultHooks.useNumber).not.toHaveBeenCalled();
    expect(hooks1.useNumber).toHaveBeenCalledWith("answer");
    expect(t1.result.current).toBe(42);

    const t2 = renderHook(() => proxyHooks.useString("name"), { wrapper: Wrapper });
    expect(defaultHooks.useString).not.toHaveBeenCalled();
    expect(hooks2.useString).toHaveBeenCalledWith("name");
    expect(t2.result.current).toBe("Alice");
  });

  test("A provider can hide the hooks in the shelf but proxy hooks throw error", () => {
    const { defaultHooks, HooksProvider, proxyHooks } = createFixture();

    const hooks: Partial<Hooks> = {
      useNumber: undefined,
    };
    const Wrapper: React.FC = ({ children }) => (
      <HooksProvider hooks={hooks}>{children}</HooksProvider>
    );

    const t = renderHook(() => proxyHooks.useNumber("answer"), { wrapper: Wrapper });
    expect(defaultHooks.useNumber).not.toHaveBeenCalled();
    expect(t.result.error).toEqual(
      new Error("hook 'useNumber' is not in the shelf or not a function: undefined")
    );
  });
});

import { vi, describe, test, afterEach, expect } from "vitest";
import React from "react";
import { renderHook } from "@testing-library/react";
import { HooksProviderComponent, createHookshelf } from ".";

describe("createHookshelf", () => {
  type Hooks = {
    useNumber: (id: string) => number;
    useString: (id: string) => string;
  };

  const createFixture = (): {
    defaultHooks: Hooks;
    HooksProvider: HooksProviderComponent<Hooks>;
    proxyHooks: Hooks;
  } => {
    const defaultHooks: Hooks = {
      useNumber: vi.fn(() => 0),
      useString: vi.fn((): string => ""),
    };
    const [HooksProvider, proxyHooks] = createHookshelf(defaultHooks);
    return { defaultHooks, HooksProvider, proxyHooks };
  };

  // suppress error messages
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

  afterEach(() => {
    consoleError.mockReset();
  });

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
      useNumber: vi.fn(() => 42),
    };
    const Wrapper: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
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
      useNumber: vi.fn(() => 42),
    };
    const hooks2: Partial<Hooks> = {
      useString: vi.fn(() => "Alice"),
    };
    const Wrapper: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
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
    const Wrapper: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
      <HooksProvider hooks={hooks}>{children}</HooksProvider>
    );

    expect(() => {
      renderHook(() => proxyHooks.useNumber("answer"), { wrapper: Wrapper });
    }).toThrow(new Error("hook 'useNumber' is not in the shelf or not a function: undefined"));
    expect(defaultHooks.useNumber).not.toHaveBeenCalled();
  });
});

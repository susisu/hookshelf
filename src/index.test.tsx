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

  describe("HooksProvider", () => {
    it("should override hooks in the shelf", () => {
      const { defaultHooks, HooksProvider, proxyHooks } = createFixture();

      const useNumber: Hooks["useNumber"] = jest.fn(() => 42);
      const hooks: Partial<Hooks> = { useNumber };
      const Wrapper: React.FC = ({ children }) => (
        <HooksProvider hooks={hooks}>{children}</HooksProvider>
      );
      const t = renderHook(() => proxyHooks.useNumber("answer"), {
        wrapper: Wrapper,
      });

      expect(defaultHooks.useNumber).not.toHaveBeenCalled();
      expect(useNumber).toHaveBeenCalledWith("answer");
      expect(t.result.current).toBe(42);
    });

    it("should not override hooks in the shelf if not specified", () => {
      const { defaultHooks, HooksProvider, proxyHooks } = createFixture();

      const hooks: Partial<Hooks> = {};
      const Wrapper: React.FC = ({ children }) => (
        <HooksProvider hooks={hooks}>{children}</HooksProvider>
      );
      const t = renderHook(() => proxyHooks.useNumber("answer"), {
        wrapper: Wrapper,
      });

      expect(defaultHooks.useNumber).toHaveBeenCalledWith("answer");
      expect(t.result.current).toBe(0);
    });
  });

  describe("proxyHooks", () => {
    it("should call a hook in the shelf", () => {
      const { defaultHooks, proxyHooks } = createFixture();

      const t = renderHook(() => proxyHooks.useNumber("answer"));

      expect(defaultHooks.useNumber).toHaveBeenCalledWith("answer");
      expect(t.result.current).toBe(0);
    });

    it("should throw error if the hook is undefined in the shelf", () => {
      const { HooksProvider, proxyHooks } = createFixture();

      const hooks: Partial<Hooks> = { useNumber: undefined };
      const Wrapper: React.FC = ({ children }) => (
        <HooksProvider hooks={hooks}>{children}</HooksProvider>
      );
      const t = renderHook(() => proxyHooks.useNumber("answer"), {
        wrapper: Wrapper,
      });

      expect(t.result.error).toEqual(
        new Error("hook 'useNumber' is not in the shelf or not a function: undefined")
      );
    });
  });
});

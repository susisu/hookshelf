import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { Shelf, UseShelf, ShelfProvider, createShelf } from ".";

describe("createShelf", () => {
  type Hooks = {
    useNumber: (id: string) => number;
    useString: (id: string) => string;
  };

  const createFixture = (): {
    defaultHooks: Hooks;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ShelfProvider: ShelfProvider<Hooks>;
    proxyHooks: Hooks;
    useShelf: UseShelf<Hooks>;
  } => {
    const defaultHooks = {
      useNumber: jest.fn(() => 0),
      useString: jest.fn((): string => ""),
    };
    const [ShelfProvider, proxyHooks, useShelf] = createShelf<Hooks>(defaultHooks);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { defaultHooks, ShelfProvider, proxyHooks, useShelf };
  };

  describe("ShelfProvider", () => {
    it("should override hooks in the shelf", () => {
      const { defaultHooks, ShelfProvider, useShelf } = createFixture();

      const useNumber: Hooks["useNumber"] = jest.fn(() => 42);
      const shelf: Shelf<Hooks> = { useNumber };
      const Wrapper: React.FC = ({ children }) => (
        <ShelfProvider shelf={shelf}>{children}</ShelfProvider>
      );
      const t = renderHook(() => useShelf("useNumber")("answer"), {
        wrapper: Wrapper,
      });

      expect(defaultHooks.useNumber).not.toHaveBeenCalled();
      expect(useNumber).toHaveBeenCalledWith("answer");
      expect(t.result.current).toBe(42);
    });

    it("should not override hooks if not specified", () => {
      const { defaultHooks, ShelfProvider, useShelf } = createFixture();

      const shelf: Shelf<Hooks> = {};
      const Wrapper: React.FC = ({ children }) => (
        <ShelfProvider shelf={shelf}>{children}</ShelfProvider>
      );
      const t = renderHook(() => useShelf("useNumber")("answer"), {
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

    it("should throw error if the hook is undefined", () => {
      const { ShelfProvider, proxyHooks } = createFixture();

      const shelf: Shelf<Hooks> = { useNumber: undefined };
      const Wrapper: React.FC = ({ children }) => (
        <ShelfProvider shelf={shelf}>{children}</ShelfProvider>
      );
      const t = renderHook(() => proxyHooks.useNumber("answer"), {
        wrapper: Wrapper,
      });

      expect(t.result.error).toEqual(
        new Error("hook 'useNumber' is not in the shelf or not a function: undefined")
      );
    });
  });

  describe("useShelf", () => {
    it("should call a hook in the shelf", () => {
      const { defaultHooks, useShelf } = createFixture();

      const t = renderHook(() => useShelf("useNumber")("answer"));

      expect(defaultHooks.useNumber).toHaveBeenCalledWith("answer");
      expect(t.result.current).toBe(0);
    });

    it("should throw error if the hook is undefined", () => {
      const { ShelfProvider, useShelf } = createFixture();

      const shelf: Shelf<Hooks> = { useNumber: undefined };
      const Wrapper: React.FC = ({ children }) => (
        <ShelfProvider shelf={shelf}>{children}</ShelfProvider>
      );
      const t = renderHook(() => useShelf("useNumber")("answer"), {
        wrapper: Wrapper,
      });

      expect(t.result.error).toEqual(
        new Error("hook 'useNumber' is not in the shelf or not a function: undefined")
      );
    });
  });
});

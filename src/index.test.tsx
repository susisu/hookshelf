import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { Shelf, UseShelf, ShelfProvider, createShelf } from ".";

describe("createShelf", () => {
  type Hooks = {
    useNumber: (id: string) => number;
    useString: (id: string) => string;
    useInvalid: unknown;
  };

  const createFixture = (): {
    defaultHooks: Hooks;
    useShelf: UseShelf<Hooks>;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ShelfProvider: ShelfProvider<Hooks>;
  } => {
    const hooks = {
      useNumber: jest.fn(() => 0),
      useString: jest.fn((): string => ""),
      useInvalid: "NOT A FUNCTION",
    };
    const [useShelf, ShelfProvider] = createShelf<Hooks>(hooks);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { defaultHooks: hooks, useShelf, ShelfProvider };
  };

  describe("useShelf", () => {
    it("should call a hook in the shelf", () => {
      const { defaultHooks, useShelf } = createFixture();

      const t = renderHook(() => useShelf("useNumber")("answer"));

      expect(defaultHooks.useNumber).toHaveBeenCalledWith("answer");
      expect(t.result.current).toBe(0);
    });

    it("should throw error if the hook is undefined", () => {
      const { useShelf, ShelfProvider } = createFixture();

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

    it("should throw error if the hook is not a function", () => {
      const { useShelf } = createFixture();

      const t = renderHook(() => useShelf("useInvalid"));

      expect(t.result.error).toEqual(
        new Error("hook 'useInvalid' is not in the shelf or not a function: NOT A FUNCTION")
      );
    });
  });

  describe("ShelfProvider", () => {
    it("should override hooks in the shelf", () => {
      const { defaultHooks, useShelf, ShelfProvider } = createFixture();

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
      const { defaultHooks, useShelf, ShelfProvider } = createFixture();

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
});

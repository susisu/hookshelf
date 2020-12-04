import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { Shelf, createShelf } from ".";

describe("createShelf", () => {
  describe("without default hooks", () => {
    type Hooks = {
      useNumber: (id: string) => number;
      useString: (id: string) => string;
      useInvalid: unknown;
    };
    const [useShelf, ShelfProvider] = createShelf<Hooks>();

    describe("useShelf", () => {
      it("should call a hook provided by parents", () => {
        const useNumber: Hooks["useNumber"] = jest.fn(() => 0);
        const shelf: Shelf<Hooks> = { useNumber };

        const Wrapper: React.FC = ({ children }) => (
          <ShelfProvider shelf={shelf}>{children}</ShelfProvider>
        );
        const t = renderHook(() => useShelf("useNumber")("answer"), {
          wrapper: Wrapper,
        });

        expect(useNumber).toHaveBeenCalledWith("answer");
        expect(t.result.current).toBe(0);
      });

      it("should throw error if no hook is provided by parents", () => {
        const t = renderHook(() => useShelf("useNumber")("answer"));

        expect(t.result.error).toEqual(
          new Error("hook 'useNumber' is not in the shelf or not a function: undefined")
        );
      });

      it("should throw error if provided value is not a function", () => {
        const shelf: Shelf<Hooks> = {
          useInvalid: "NOT_A_FUNCTION",
        };

        const Wrapper: React.FC = ({ children }) => (
          <ShelfProvider shelf={shelf}>{children}</ShelfProvider>
        );
        const t = renderHook(() => useShelf("useInvalid"), {
          wrapper: Wrapper,
        });

        expect(t.result.error).toEqual(
          new Error("hook 'useInvalid' is not in the shelf or not a function: NOT_A_FUNCTION")
        );
      });
    });

    describe("ShelfProvider", () => {
      it("should provide hooks to the context", () => {
        const useNumber: Hooks["useNumber"] = jest.fn(() => 0);
        const shelf: Shelf<Hooks> = { useNumber };

        const Wrapper: React.FC = ({ children }) => (
          <ShelfProvider shelf={shelf}>{children}</ShelfProvider>
        );
        const t = renderHook(() => useShelf("useNumber")("answer"), {
          wrapper: Wrapper,
        });

        expect(useNumber).toHaveBeenCalledWith("answer");
        expect(t.result.current).toBe(0);
      });

      it("should override hooks provided by parents if defined", () => {
        const useNumber1: Hooks["useNumber"] = jest.fn(() => 0);
        const shelf1: Shelf<Hooks> = { useNumber: useNumber1 };

        const useNumber2: Hooks["useNumber"] = jest.fn(() => 42);
        const shelf2: Shelf<Hooks> = { useNumber: useNumber2 };

        const Wrapper: React.FC = ({ children }) => (
          <ShelfProvider shelf={shelf1}>
            <ShelfProvider shelf={shelf2}>{children}</ShelfProvider>
          </ShelfProvider>
        );
        const t = renderHook(() => useShelf("useNumber")("answer"), {
          wrapper: Wrapper,
        });

        expect(useNumber1).not.toHaveBeenCalled();
        expect(useNumber2).toHaveBeenCalledWith("answer");
        expect(t.result.current).toBe(42);
      });

      it("should not hide hooks provided by parents if undefined", () => {
        const useNumber: Hooks["useNumber"] = jest.fn(() => 0);
        const shelf1: Shelf<Hooks> = { useNumber };

        const shelf2: Shelf<Hooks> = {};

        const Wrapper: React.FC = ({ children }) => (
          <ShelfProvider shelf={shelf1}>
            <ShelfProvider shelf={shelf2}>{children}</ShelfProvider>
          </ShelfProvider>
        );
        const t = renderHook(() => useShelf("useNumber")("answer"), {
          wrapper: Wrapper,
        });

        expect(useNumber).toHaveBeenCalledWith("answer");
        expect(t.result.current).toBe(0);
      });
    });
  });

  describe("with default hooks", () => {
    it("should provide default hooks to the context", () => {
      const useNumber = jest.fn((_id: string): number => 0);
      const useString = jest.fn((_id: string): string => "hello");
      const defaultShelf = {
        useNumber,
        useString,
      };
      const [useShelf] = createShelf(defaultShelf);

      const t = renderHook(() => useShelf("useNumber")("answer"));

      expect(useNumber).toHaveBeenCalledWith("answer");
      expect(t.result.current).toBe(0);
    });
  });
});

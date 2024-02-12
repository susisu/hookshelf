# Hookshelf

[![CI](https://github.com/susisu/hookshelf/workflows/CI/badge.svg)](https://github.com/susisu/hookshelf/actions?query=workflow%3ACI)

Hookshelf provides React hooks through context.

``` shell
# npm
npm i @susisu/hookshelf
# yarn
yarn add @susisu/hookshelf
# pnpm
pnpm add @susisu/hookshelf
```

If we think React hooks as "effects", there are only a fixed number of effects types (i.e. build-in hooks), and they are all handled by React.
By providing hooks through context, we can extend the number of effect types to built-in hooks + custom hooks, and they can be handled by a user.

## Usage
One typical usage is mocking hooks for testing.

Suppose we have a Hook like below:

``` ts
import { hooks } from "./lib";

const { useBrowserFeature, useNetworkFetch, useComplexState } = hooks;

export function useMyHook() {
  const id = useBrowserFeature();
  const { data, error } = useNetworkFetch(id);
  const { state, dispatch } = useComplexState();
  // do something with data, error, state, and dispatch
  return ...;
}
```

Testing this hooks will be a hard work, because we first need to mock browser features and network to let `useBrowserFeature` and `useNetworkFetch` work in the test, and then we need to wait for data, change state, etc. before asserting results.

``` ts
test("It works", () => {
  ... // Mock browser features and network

  const { result } = renderHook(useMyHook);
  expect(result.current).toEqual(...);

  ... // Wait for data
  expect(result.current).toEqual(...);

  ... // Change state
  expect(result.current).toEqual(...);

  ... // And change state again, assert, ...
});
```

One way to solve this issue is separating our Hook into two parts: complex one and simple one. By doing this, we can easily test the latter part, however, we still have difficulties testing, for example, the `id` retrieved from `useBrowserFeature` is passed to `useNetworkFetch`.
Another way is using mocking facilities that the testing framework provides. This is good for some situations, but we should use it moderately because it has global effect and usually not typesafe.

Hookshelf provides a third way by providing hooks through React context.

First, create a React context using `createHookshelf`:

``` ts
import { createHookshelf } from "@susisu/hookshelf";
import { hooks } from "./lib";

export const [HooksProvider, proxyHooks] = createHookshelf(hooks);
```

Now we have a provider component which provides hooks to the context, and proxy hooks which invoke corresponding hooks in the context.

Next, replace hook invocations to proxy hooks:

``` ts
import { proxyHooks } from "./shelf";

const { useBrowserFeature, useNetworkFetch, useComplexState } = proxyHooks;

export function useMyHook() {
  const id = useBrowserFeature();
  const { data, error } = useNetworkFetch(id);
  const { state, dispatch } = useComplexState();
  // do something with data, error, state, and dispatch
  return ...;
}
```

The proxy hooks will invoke the original hooks if we don't use the provider component, so this will not change the behavior of our hook.

Mocking the hooks in tests can be easily done by providing fake hooks using the provider component:

``` tsx
import { HooksProvider } from "./shelf";

function prepare({ id, data, error, state, dispatch }) {
  const hooks = {
    useBrowserFeature: jest.fn(() => id),
    useNetworkFetch: jest.fn(() => ({ data, error })),
    useComplexState: jest.fn(() => ({ state, dispatch })),
  };
  const Wrapper = ({ children }) => (
    <HooksProvider hooks={hooks}>{children}</HooksProvider>
  );
  return { hooks, Wrapper };
}

test("It returns some data created from fetched data and state", () => {
  const { hooks, Wrapper } = prepare({
    id: 42,
    data: { ... },
    error: undefined,
    state: { ... },
    dispatch: () => {},
  });
  const { result } = renderHook(useMyHook, { wrapper: Wrapper });
  expect(result.current).toEqual(...);
});

test("It returns another data in another state", () => {
  const { hooks, Wrapper } = prepare({
    id: 42,
    data: { ... },
    error: undefined,
    state: { ... },
    dispatch: () => {},
  });
  const { result } = renderHook(useMyHook, { wrapper: Wrapper });
  expect(result.current).toEqual(...);
});
```

## Caveats
Use Hookshelf carefully not to break the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html).
For example, you should not change hooks after components are rendererd.

## License

[MIT License](http://opensource.org/licenses/mit-license.php)

## Author

Susisu ([GitHub](https://github.com/susisu), [Twitter](https://twitter.com/susisu2413))

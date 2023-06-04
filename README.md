# react-context-selector

## Why this package?

Everytime a `React context` value is changed **every** components using this 
context are rendered.
For example, if an object is the value of the context and a key changes. All 
components will render even if these components do not use this key but 
another one.

```tsx
import { createContext, useContext, useMemo, useReducer } from "react";

const CounterContext = createContext(null);

// This component will render each time the counter is incremented
// even if the component does not use the count but a function which
// has a stable reference
function CounterButton() {
    const { increment } = useContext(CounterContext);

    return (
        <button type="button" onClick={increment}>
            Increment
        </button>
    );
}

function CountDisplay() {
    const { count } = useContext(CounterContext);

    return <span>Count: {count}</span>;
}

function CounterProvider({ children }) {
    const [count, increment] = useReducer((prev) => prev + 1, 0);

    // We useMemo but in this example, not necessary
    const value = useMemo(
        () => ({
            count,
            increment,
        }),
        [count, increment],
    );

    return (
        <CounterContext.Provider value={value}>
            {children}
        </CounterContext.Provider>
    );
}

function App() {
    return (
        <CounterProvider>
            <CounterButton />
            <CountDisplay />
        </CounterProvider>
    );
}
```

If you want to avoid this you can split `count` and `increment` into 2 contexts. 
But it complicates the code.

> **Note:** If you want to know more you can read the article 
[React context, performance?](https://dev.to/romaintrotard/react-context-performance-5832).

Another solution is to use the library 
[`use-context-selector`](https://github.com/dai-shi/use-context-selector) that inspires me a lot.

But contrary to this library, `@rtrstack/react-context-selector` uses React's built in hooks 
including `useSyncExternalStore` and is smaller.

## Install

The library does not use the shim of `useSyncExternalStore` so you need the version 18 of React.

```sh
yarn add @rtrstack/react-context-selector react@^18
```

## Usage

```tsx
import { createContext, useContext, useMemo, useReducer } from "react";
import {
    createContext,
    useContextSelector,
} from "@rtrstack/react-context-selector";

const CounterContext = createContext(null);

// No more re-render
function CounterButton() {
    const increment = useContextSelector(
        CounterContext,
        (value) => value.increment,
    );

    return (
        <button type="button" onClick={increment}>
            Increment
        </button>
    );
}

function CountDisplay() {
    const count = useContextSelector(CounterContext, (value) => value.count);

    return <span>Count: {count}</span>;
}

function CounterProvider({ children }) {
    const [count, increment] = useReducer((prev) => prev + 1, 0);

    const value = useMemo(
        () => ({
            count,
            increment,
        }),
        [count, increment],
    );

    return (
        <CounterContext.Provider value={value}>
            {children}
        </CounterContext.Provider>
    );
}

function App() {
    return (
        <CounterProvider>
            <CounterButton />
            <CountDisplay />
        </CounterProvider>
    );
}
```

## API

### createContext

Function to create a React context.

#### Parameters

- `defaultValue`: The value that you want the context to have when there is no 
matching context provider in the tree above the component that reads context.


#### Examples

```tsx
const MusicContext = createContext({ artist: '', album: '', song: '' });
```

### useContextSelector

The hook returns a specific value of context by a selector.

Re-rendering will occur solely when there are referential changes to the selected value.

#### Parameters

- `context`: the context created by the `createContext` function.
- `selector`: the function to select a value of the context.


#### Examples

```tsx
const artist = useContextSelector(MusicContext, state => state.artist);
```

### useContext

The hook returns the entire context value.

### Parameters

- `context`: the context created by the `createContext` function.

#### Examples

```tsx
const music = useContext(MusicContext);
```


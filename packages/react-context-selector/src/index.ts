import {
    createElement,
    useSyncExternalStore,
    createContext as createContextOriginal,
    useMemo,
    useContext as useContextOriginal,
    useRef,
    useLayoutEffect,
    useEffect,
    type Context as ContextOriginal,
    type ReactNode,
    type Provider,
    ComponentType,
} from "react";

type Context<Value> = {
    Provider: ComponentType<{ value: Value; children: ReactNode }>;
    displayName?: string;
};

type Listener = () => void;

type OverridenContextValue<TOriginalContextValue> = {
    getValues: () => TOriginalContextValue;
    subscribe: (listener: Listener) => () => void;
};

function createProvider<T>(
    ProviderOriginal: Provider<OverridenContextValue<T>>,
) {
    // Just want to name the component in devtool
    const Provider = ({
        value,
        children,
    }: { value: any; children: ReactNode }) => {
        const listeners = useRef<Listener[]>([]);
        const valuesRef = useRef(value);

        useLayoutEffect(() => {
            valuesRef.current = value;
        });

        useEffect(() => {
            listeners.current.forEach((l) => l());
        }, [value]);

        const values = useMemo(
            () => ({
                subscribe: (listener: Listener) => {
                    listeners.current.push(listener);

                    return () => {
                        listeners.current = listeners.current.filter(
                            (l) => listener !== l,
                        );
                    };
                },
                getValues: () => valuesRef.current,
            }),
            [],
        );

        return createElement(ProviderOriginal, { value: values }, children);
    };
    return Provider;
}

function createContext<TOriginalValue>(initValues: TOriginalValue) {
    const context = createContextOriginal<
        OverridenContextValue<TOriginalValue>
    >({ getValues: () => initValues, subscribe: () => () => {} });

    (
        context as unknown as Context<OverridenContextValue<TOriginalValue>>
    ).Provider = createProvider<TOriginalValue>(context.Provider);
    // Do not support `Consumer` for the moment
    // TODO rtr look to do better?
    (context as any).Consumer = undefined;
    return context as Context<TOriginalValue>;
}

function useContextSelector<TOriginalValue, TSelectedValue>(
    context: Context<TOriginalValue>,
    selector: (value: TOriginalValue) => TSelectedValue,
) {
    // TODO rtr look to do better?
    const { subscribe, getValues } = useContextOriginal(
        context as ContextOriginal<OverridenContextValue<TOriginalValue>>,
    );

    return useSyncExternalStore<TSelectedValue>(subscribe, () =>
        selector(getValues()),
    );
}

function useContext<T>(context: Context<T>) {
    return useContextSelector(context, (value: T) => value);
}

export { createContext, useContext, useContextSelector, type Context };

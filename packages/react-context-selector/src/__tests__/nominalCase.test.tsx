import React, { useCallback, useState } from 'react';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createContext, useContextSelector } from '../index';
import { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';

test('nominal case', async () => {
    let firstRenderCount = 0;
    let secondRenderCount = 0;

    const CounterContext = createContext({
        count: 0,
        incrementCount: () => { },
        secondCount: 0,
        incrementSecondCount: () => { },
    });

    const CounterProvider = ({ children }: { children: ReactNode }) => {
        const [count, setCount] = useState(0);
        const [secondCount, setSecondCount] = useState(0);

        const incrementCount = useCallback(() => {
            setCount(prev => prev + 1);
        }, []);
        const incrementSecondCount = useCallback(() => {
            setSecondCount(prev => prev + 1);
        }, []);

        return (
            <CounterContext.Provider value={{ count, incrementCount, secondCount, incrementSecondCount }}>
                {children}
            </CounterContext.Provider>
        );
    }
    const FirstCounter = () => {
        const count = useContextSelector(CounterContext, state => state.count);
        const increment = useContextSelector(CounterContext, state => state.incrementCount);

        firstRenderCount++;

        return (
            <button type="button" onClick={increment}>Increment count: {count}</button>
        );
    }
    const SecondCounter = () => {
        const count = useContextSelector(CounterContext, state => state.secondCount);
        const increment = useContextSelector(CounterContext, state => state.incrementSecondCount);

        secondRenderCount++;

        return (
            <button type="button" onClick={increment}>Increment second count: {count}</button>
        );
    }

    const user = userEvent.setup();
    render(
        <CounterProvider>
            <FirstCounter />
            <SecondCounter />
        </CounterProvider>
    );

    const countButton = screen.getByText('Increment count: 0');
    const secondCountButton = screen.getByText('Increment second count: 0')

    expect(countButton).toBeVisible();
    expect(secondCountButton).toBeVisible();
    expect(firstRenderCount).toBe(1);
    expect(secondRenderCount).toBe(1);


    await user.click(countButton);

    expect(screen.getByText('Increment count: 1')).toBeVisible();
    expect(screen.getByText('Increment second count: 0')).toBeVisible();
    expect(firstRenderCount).toBe(2);
    expect(secondRenderCount).toBe(1);
});

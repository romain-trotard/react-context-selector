import { memo, useState } from "react";
import { createContext, useContextSelector } from "react-context-selector";
import "./App.css";

const MyContext = createContext<{ count: number; secondCount: number }>({
    count: 0,
    secondCount: 0,
});

function CountDisplay() {
    const count = useContextSelector(MyContext, (values) => values.count);

    console.log("Render CountDisplay", count);

    return <span>Count: {count}</span>;
}

const MemoCountDisplay = memo(CountDisplay);

function App() {
    const [count, setCount] = useState(0);
    const [secondCount, setSecondCount] = useState(0);

    return (
        <MyContext.Provider value={{ count, secondCount }}>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <button onClick={() => setSecondCount((count) => count + 1)}>
                    second count is {secondCount}
                </button>
                <MemoCountDisplay />
            </div>
        </MyContext.Provider>
    );
}

export default App;

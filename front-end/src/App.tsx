// src/App.tsx
import {Outlet } from "react-router-dom";

function App() {
    return (
        <div className="app">

            <main>
                {/* Les pages seront rendues ici */}
                <Outlet />
            </main>
        </div>
    );
}

export default App;
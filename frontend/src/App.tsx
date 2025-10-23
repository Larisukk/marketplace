// src/App.tsx

import React from 'react';
import Home from './pages/Home'; // Assuming Home.tsx is the main page component

const App: React.FC = () => {
    // Renders the main structure of the application.
    // When a router is added, this component will typically hold the router setup.
    return (
        <div className="App">
            {/* Currently, only the Home page is rendered */}
            <Home />
        </div>
    );
};

export default App;

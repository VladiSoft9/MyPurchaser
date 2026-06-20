import UserBar from '../components/userBar';
import Dashboard from '../components/Dashboard';
import SavedReports from '../components/SavedReports';
import { useState } from 'react';

function App() {

    const [currentView, setCurrentView] = useState('dashboard');

    const handleViewChange = () => {
        setCurrentView(currentView === 'dashboard' ? 'savedReports' : 'dashboard');
    }

    return (
    <div>
        <UserBar handleViewChange={handleViewChange} currentView={currentView} />
        {currentView === 'dashboard' ? <Dashboard /> : <SavedReports />}
    </div>
    );
}

export default App;
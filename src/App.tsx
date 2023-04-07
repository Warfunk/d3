import { useState } from 'react';
import './App.css';
import BarChart from './BarChart';
import Globe from './Globe';
import Map from './Map';

function App() {
  const [currentView, setCurrentView] = useState<'globe' | 'snow' | 'bar'>(
    'bar'
  );
  return (
    <div className='App'>
      <div className='viewButtons'>
        <button onClick={() => setCurrentView('bar')}>Resort Stats</button>
        <button onClick={() => setCurrentView('snow')}>Yearly Snow</button>
        <button onClick={() => setCurrentView('globe')}>Globe</button>
      </div>
      <div>
        {currentView === 'bar' && <BarChart />}
        {currentView === 'snow' && <Map />}
        {currentView === 'globe' && <Globe />}
      </div>
    </div>
  );
}

export default App;

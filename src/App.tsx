import { useState } from 'react';
import { HomeView } from './views/HomeView';
import { SummaryView } from './views/SummaryView';

function App() {
  const [view, setView] = useState<'home' | 'summary'>('home');
  const [summaryData, setSummaryData] = useState<string>("");

  const handleGenerateComplete = (summary: string) => {
    setSummaryData(summary);
    setView('summary');
  };

  const handleBack = () => {
    setView('home');
    setSummaryData("");
  };

  return (
    <div className="w-full h-screen bg-white">
      {view === 'home' ? (
        <HomeView onGenerateComplete={handleGenerateComplete} />
      ) : (
        <SummaryView summary={summaryData} onBack={handleBack} />
      )}
    </div>
  );
}

export default App;

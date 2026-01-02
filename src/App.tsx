import { useState } from 'react';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';
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
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#fff',
            color: '#000',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                <div className="flex-1">{message}</div>
                {t.type !== 'loading' && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="ml-2 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
    </div>
  );
}

export default App;

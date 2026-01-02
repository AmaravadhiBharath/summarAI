import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { HomeView } from './views/HomeView'
import { useTheme } from './hooks/useTheme'
import { useDynamicIcon } from './hooks/useDynamicIcon'

function App() {
  const [summaryData, setSummaryData] = useState<string>("")
  const [autoGenerate, setAutoGenerate] = useState(false)
  const { resolvedTheme } = useTheme() // Initialize theme

  // Update extension icon based on theme (Solid Black/White)
  useDynamicIcon(resolvedTheme as 'light' | 'dark');

  const handleGenerateComplete = (summary: string) => {
    setSummaryData(summary)
    // Don't switch views - stay in HomeView
  }

  const handleBack = (shouldRegenerate = false) => {
    setSummaryData("")
    if (shouldRegenerate) {
      setAutoGenerate(true)
    }
  }

  return (
    <div className="w-full h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <HomeView
        onGenerateComplete={handleGenerateComplete}
        autoGenerate={autoGenerate}
        onAutoGenerateHandled={() => setAutoGenerate(false)}
      />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 1000,
          style: {
            background: resolvedTheme === 'dark' ? '#292a2d' : '#fff',
            color: resolvedTheme === 'dark' ? '#e8eaed' : '#111',
            border: `1px solid ${resolvedTheme === 'dark' ? '#3c4043' : '#e5e7eb'}`,
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: resolvedTheme === 'dark' ? '#292a2d' : '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: resolvedTheme === 'dark' ? '#292a2d' : '#fff',
            },
          },
        }}
      />
    </div>
  )
}

export default App

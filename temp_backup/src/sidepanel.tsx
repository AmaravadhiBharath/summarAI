import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 3000,
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
        />
    </React.StrictMode>,
)

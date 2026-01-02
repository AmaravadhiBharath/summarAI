import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Standard Web Build Config (No CRX Plugin)
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'dist-web', // Separate output directory
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                mobile: path.resolve(__dirname, 'mobile.html'),
                landing02: path.resolve(__dirname, 'landing-02.html'),
            },
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'framer-motion'],
                    firebase: ['firebase/app', 'firebase/auth'],
                    ui: ['lucide-react', 'react-hot-toast']
                }
            }
        },
    },
})

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
                index: path.resolve(__dirname, 'index.html'),
                mobile: path.resolve(__dirname, 'mobile.html'),
                welcome: path.resolve(__dirname, 'welcome-web.html'),
            },
        },
    },
})

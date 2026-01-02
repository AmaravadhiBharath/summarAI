import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper for fs-extra like behavior
const emptyDir = (dir) => {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });
};

const copyDir = (src, dest) => {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
};

// Shared config generator
const getBaseConfig = (entryName, entryPath, isHtml = true) => ({
    configFile: false,
    root: '.',
    base: './',
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        emptyOutDir: false,
        outDir: 'dist',
        cssCodeSplit: false,
        modulePreload: { polyfill: false }, // DISABLE MODULE PRELOAD POLYFILL
        rollupOptions: {
            input: {
                [entryName]: resolve(__dirname, entryPath),
            },
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`,
                inlineDynamicImports: true, // FORCE INLINE EVERYTHING
                manualChunks: undefined, // DISABLE MANUAL CHUNKS
            },
        },
    },
    esbuild: {
        drop: ['console', 'debugger'],
    },
});

async function runBuild() {
    console.log('🚀 Starting Static Build...');

    // 1. Clean dist
    emptyDir('dist');

    // 2. Build Sidepanel
    console.log('📦 Building Sidepanel...');
    await build(getBaseConfig('sidepanel', 'sidepanel.html'));

    // 3. Build Welcome
    console.log('📦 Building Welcome...');
    await build(getBaseConfig('welcome', 'welcome.html'));

    // 4. Build Mobile
    console.log('📦 Building Mobile...');
    await build(getBaseConfig('mobile', 'mobile.html'));

    // 5. Build Service Worker
    console.log('📦 Building Service Worker...');
    await build(getBaseConfig('service-worker', 'src/service-worker.ts', false));

    // 6. Build Content Script
    console.log('📦 Building Content Script...');
    await build(getBaseConfig('content', 'src/content.ts', false));

    // 7. Build Docs Content Script
    console.log('📦 Building Docs Content Script...');
    await build(getBaseConfig('docsContent', 'src/docsContent.ts', false));

    // 8. Generate Manifest
    console.log('📋 Generating Manifest...');

    const manifest = {
        name: 'SummarAI',
        description: 'Surf, learn, vibe faster. AI-powered summaries of your AI conversations.',
        version: '1.0.6',
        manifest_version: 3,
        permissions: [
            'sidePanel',
            'storage',
            'activeTab',
            'identity',
            'scripting',
            'tabs',
            'alarms'
        ],
        host_permissions: [
            'https://tai-backend.amaravadhibharath.workers.dev/*',
            'https://us.i.posthog.com/*'
        ],
        icons: {
            16: 'assets/logo.png',
            48: 'assets/logo.png',
            128: 'assets/logo.png',
        },
        action: {
            default_title: 'summarai',
            default_icon: 'assets/logo.png',
        },
        side_panel: {
            default_path: 'sidepanel.html',
        },
        background: {
            service_worker: 'assets/service-worker.js',
            type: 'module',
        },
        content_scripts: [
            {
                matches: ['https://docs.google.com/document/*'],
                js: ['assets/docsContent.js'],
                run_at: 'document_idle'
            },
            {
                matches: [
                    'https://gemini.google.com/*',
                    'https://chatgpt.com/*',
                    'https://openai.com/*',
                    'https://figma.com/*',
                    'https://visily.ai/*',
                    'https://uizard.io/*',
                    'https://uxmagic.ai/*',
                    'https://banani.co/*',
                    'https://labs.google.com/*',
                    'https://app.emergent.sh/*',
                    'https://rocket.new/*',
                    'https://lovable.dev/*',
                    'https://bolt.new/*',
                    'https://base44.com/*',
                    'https://create.xyz/*',
                    'https://memex.tech/*',
                    'https://buildfire.com/*',
                    'https://glideapps.com/*',
                    'https://flatlogic.com/*',
                    'https://retool.com/*',
                    'https://uibakery.io/*',
                    'https://zoho.com/*',
                    'https://appypie.com/*',
                    'https://meta.ai/*',
                    'https://www.meta.ai/*'
                ],
                js: ['assets/content.js'],
            },
        ],
        web_accessible_resources: [
            {
                resources: ['assets/*'],
                matches: ['<all_urls>'],
            },
        ],
        oauth2: {
            client_id: '523127017746-1tt3t3mqa76l4015lj3sc45gthusm4s5.apps.googleusercontent.com',
            scopes: ['profile', 'email', 'openid']
        },
        content_security_policy: {
            extension_pages: "script-src 'self'; object-src 'self'; img-src 'self' https://*.googleusercontent.com data:;"
        }
    };

    fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));

    // 9. Copy Assets
    console.log('📋 Copying Assets...');
    // Copy src/assets to dist/assets
    if (fs.existsSync('src/assets')) {
        copyDir('src/assets', 'dist/assets');
    }

    console.log('✅ Build Complete!');
}

runBuild().catch((err) => {
    console.error('❌ Build Failed:', err);
    process.exit(1);
});

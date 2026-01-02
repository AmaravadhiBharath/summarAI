import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
    name: 'SummarAI',
    description: 'Surf, learn, vibe faster. AI-powered summaries of your AI conversations.',
    version: '2.0',
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
        'https://us.i.posthog.com/*',
        '<all_urls>'
    ],
    icons: {
        16: 'src/assets/logo.png',
        48: 'src/assets/logo.png',
        128: 'src/assets/logo.png',
    },
    action: {
        default_title: 'SummarAI',
        default_icon: 'src/assets/logo.png',
    },
    side_panel: {
        default_path: 'sidepanel.html',
    },
    background: {
        service_worker: 'src/sw.ts',
        type: 'module',
    },
    content_scripts: [
        {
            matches: ['https://docs.google.com/document/*'],
            js: ['src/docsContent.ts'],
            run_at: 'document_idle'
        },
        {
            matches: [
                'https://gemini.google.com/*',
                'https://chatgpt.com/*',
                'https://claude.ai/*',
                'https://perplexity.ai/*',
                'https://www.perplexity.ai/*',
                'https://openai.com/*',
                '<all_urls>'
            ],
            js: ['src/content.ts'],
            all_frames: true,
            run_at: 'document_start'
        },
    ],
    web_accessible_resources: [
        {
            resources: ['src/assets/*'],
            matches: ['<all_urls>'],
        },
    ],
    oauth2: {
        client_id: '523127017746-1b3k9i4ba4a2e8mtc8upli1hs9d7gh25.apps.googleusercontent.com',
        scopes: ['profile', 'email', 'openid']
    },
    content_security_policy: {
        extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; connect-src 'self' https://tai-backend.amaravadhibharath.workers.dev https://*.firebaseio.com https://*.googleapis.com https://us.i.posthog.com https://script.google.com http://localhost:* http://127.0.0.1:*"
    }
})

import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
    name: 'Summarai',
    description: 'Surf, learn, vibe faster. AI-powered summaries of your AI conversations.',
    version: '1.0.4',
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
        'https://tai-backend.amaravadhibharath.workers.dev/*'
    ],
    icons: {
        16: 'src/assets/logo.png',
        48: 'src/assets/logo.png',
        128: 'src/assets/logo.png',
    },
    action: {
        default_title: 'summarai',
        default_icon: 'src/assets/logo.png',
    },
    side_panel: {
        default_path: 'sidepanel.html',
    },
    background: {
        service_worker: 'src/service-worker.ts',
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
                'https://appypie.com/*'
            ],
            js: ['src/content.ts'],
        },
    ],
    web_accessible_resources: [
        {
            resources: ['src/assets/*'],
            matches: ['<all_urls>'],
        },
    ],
    oauth2: {
        client_id: '523127017746-1tt3t3mqa76l4015lj3sc45gthusm4s5.apps.googleusercontent.com',
        scopes: ['profile', 'email', 'openid']
    },
    content_security_policy: {
        extension_pages: "script-src 'self'; object-src 'self'"
    }
})

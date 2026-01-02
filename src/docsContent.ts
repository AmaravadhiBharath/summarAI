// Docs Content Script
// Injected into docs.google.com to help user paste summary

console.log("SummarAI Extension: Docs Helper Loaded");

const checkAndShowOverlay = async () => {
    try {
        const result = await chrome.storage.local.get(['pendingSummaryPaste']);
        if (result.pendingSummaryPaste) {
            console.log("SummarAI Extension: Pending paste found!");

            // Clear the flag immediately so it doesn't show again on reload
            await chrome.storage.local.remove(['pendingSummaryPaste']);

            // Create Overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '20px';
            overlay.style.left = '50%';
            overlay.style.transform = 'translateX(-50%)';
            overlay.style.backgroundColor = '#1a1a1a';
            overlay.style.color = 'white';
            overlay.style.padding = '12px 24px';
            overlay.style.borderRadius = '50px';
            overlay.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            overlay.style.zIndex = '99999';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.gap = '12px';
            overlay.style.fontFamily = 'Google Sans, Roboto, Arial, sans-serif';
            overlay.style.fontSize = '14px';
            overlay.style.fontWeight = '500';
            overlay.style.cursor = 'pointer';
            overlay.style.transition = 'all 0.2s ease';
            overlay.style.opacity = '0';
            overlay.style.animation = 'summarAiFadeIn 0.5s forwards';

            // Add keyframes
            const style = document.createElement('style');
            style.textContent = `
                @keyframes summarAiFadeIn {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `;
            document.head.appendChild(style);

            overlay.innerHTML = `
                <span style="font-size: 18px;">✨</span>
                <span>Summary Ready! Press <b>Cmd+V</b> to paste</span>
                <button style="background: rgba(255,255,255,0.2); border: none; color: white; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: 8px;">✕</button>
            `;

            // Close logic
            const close = () => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            };

            overlay.querySelector('button')?.addEventListener('click', (e) => {
                e.stopPropagation();
                close();
            });

            // Auto-close after 10s
            setTimeout(close, 10000);

            // Append to body
            document.body.appendChild(overlay);

            // Try to focus the editor (best effort)
            const editor = document.querySelector('.kix-appview-editor') as HTMLElement;
            if (editor) {
                editor.focus();
            }
        }
    } catch (e) {
        console.error("SummarAI Extension Error:", e);
    }
};

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndShowOverlay);
} else {
    checkAndShowOverlay();
}

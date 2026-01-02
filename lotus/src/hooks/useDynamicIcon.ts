import { useEffect, useRef } from 'react';

export const useDynamicIcon = (theme: 'light' | 'dark') => {
    // Cache the processed ImageData to make switching instant
    const iconsRef = useRef<{ light: ImageData | null; dark: ImageData | null }>({ light: null, dark: null });
    const loadedRef = useRef(false);

    useEffect(() => {
        const prepareIcons = async () => {
            if (loadedRef.current) return;

            try {
                const img = new Image();
                img.src = chrome.runtime.getURL('src/assets/logo.png');

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });

                const size = 128;
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // Draw original image
                ctx.drawImage(img, 0, 0, size, size);
                const originalData = ctx.getImageData(0, 0, size, size);

                // Generate Light Icon (Solid Black)
                const lightData = new ImageData(new Uint8ClampedArray(originalData.data), size, size);
                for (let i = 0; i < lightData.data.length; i += 4) {
                    if (lightData.data[i + 3] > 0) { // If opaque
                        lightData.data[i] = 0;     // R
                        lightData.data[i + 1] = 0; // G
                        lightData.data[i + 2] = 0; // B
                    }
                }
                iconsRef.current.light = lightData;

                // Generate Dark Icon (Solid White)
                const darkData = new ImageData(new Uint8ClampedArray(originalData.data), size, size);
                for (let i = 0; i < darkData.data.length; i += 4) {
                    if (darkData.data[i + 3] > 0) { // If opaque
                        darkData.data[i] = 255;     // R
                        darkData.data[i + 1] = 255; // G
                        darkData.data[i + 2] = 255; // B
                    }
                }
                iconsRef.current.dark = darkData;

                loadedRef.current = true;

                // Apply initial icon
                if (iconsRef.current[theme]) {
                    chrome.action.setIcon({ imageData: iconsRef.current[theme]! });
                }

            } catch (error) {
                console.error('Failed to prepare dynamic icons:', error);
            }
        };

        prepareIcons();
    }, []); // Run once on mount

    // Apply icon immediately when theme changes
    useEffect(() => {
        if (loadedRef.current && iconsRef.current[theme]) {
            chrome.action.setIcon({ imageData: iconsRef.current[theme]! });
        }
    }, [theme]);
};

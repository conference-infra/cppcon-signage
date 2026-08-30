function getUrlParams() {
    return new URLSearchParams(window.location.search);
}

function getTextFromURL(urlParams) {
    return urlParams.get('text') ?? '';
}

function getBackgroundFromURL(urlParams) {
    const raw = urlParams.get('background');
    if (!raw) return null;

    const trimmed = raw.trim();
    if (!trimmed) return null;

    const color = /^[0-9a-fA-F]{3,8}$/.test(trimmed) ? `#${trimmed}` : trimmed;
    return CSS.supports('color', color) ? color : null;
}

function getRotationFromURL(urlParams) {
    const raw = urlParams.get('rotation');
    if (raw === null || raw.trim() === '') return 0;

    const degrees = Number(raw);
    if (!Number.isFinite(degrees)) return 0;

    return Math.min(360, Math.max(0, degrees));
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = getUrlParams();

    const textEl = document.getElementById('pointer-text');
    if (textEl) {
        textEl.textContent = getTextFromURL(urlParams);
    }

    const background = getBackgroundFromURL(urlParams);
    if (background) {
        document.body.style.background = background;
    }

    const arrowEl = document.getElementById('pointer-arrow');
    if (arrowEl) {
        const rotation = getRotationFromURL(urlParams);
        arrowEl.style.transform = `rotate(${-rotation}deg)`;
    }
});

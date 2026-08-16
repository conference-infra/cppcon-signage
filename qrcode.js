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

function getQrBlobFromURL(urlParams) {
    return urlParams.get('qrblob') ?? '';
}

function createQrSvg(payload) {
    qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    const qr = qrcode(0, 'M');
    qr.addData(payload);
    qr.make();
    return qr.createSvgTag({ scalable: true });
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = getUrlParams();

    const textEl = document.getElementById('qrcode-text');
    if (textEl) {
        textEl.textContent = getTextFromURL(urlParams);
    }

    const background = getBackgroundFromURL(urlParams);
    if (background) {
        document.body.style.background = background;
    }

    const payload = getQrBlobFromURL(urlParams);
    const qrEl = document.getElementById('qrcode');
    if (qrEl && payload) {
        qrEl.innerHTML = createQrSvg(payload);
    }
});

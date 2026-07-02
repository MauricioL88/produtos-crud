window.App = window.App || {};

App.WebView = {
    isWebView: typeof window.chrome !== 'undefined' && !!window.chrome.webview,

    enviar(acao, dados) {
        if (!App.WebView.isWebView) return;
        try {
            window.chrome.webview.postMessage({ acao, ...dados });
        } catch (e) {
            console.error('Erro ao comunicar com C#:', e);
        }
    },

    onMessage(callback) {
        if (!App.WebView.isWebView) return;
        window.chrome.webview.addEventListener('message', (event) => {
            callback(event.data);
        });
    }
};

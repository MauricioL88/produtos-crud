window.App = window.App || {};

App.Toast = {
    mostrar(mensagem, tipo) {
        tipo = tipo || 'sucesso';
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast ' + (App.CORES_TOAST[tipo] || App.CORES_TOAST.sucesso) + ' text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium min-w-[250px]';
        toast.innerHTML = '<span class="material-symbols-outlined text-[20px]">' + (App.ICONES_TOAST[tipo] || App.ICONES_TOAST.sucesso) + '</span><span>' + App.Helpers.escapeHtml(mensagem) + '</span>';
        container.appendChild(toast);

        setTimeout(function() {
            toast.classList.add('saindo');
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }
};

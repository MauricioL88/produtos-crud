window.App = window.App || {};

App.Pagination = {
    renderizar(container, btnAnterior, btnProxima, totalItens, itensPorPagina, paginaAtual, onMudarPagina) {
        const totalPaginas = Math.ceil(totalItens / itensPorPagina);
        container.innerHTML = '';

        for (let i = 1; i <= totalPaginas; i++) {
            const botao = document.createElement('button');
            botao.className = 'w-8 h-8 rounded-lg ' + (i === paginaAtual ? 'bg-primary text-white' : 'hover:bg-white/30 text-on-surface-variant') + ' transition-colors text-xs font-bold';
            botao.textContent = i;
            botao.addEventListener('click', function() { onMudarPagina(i); });
            container.appendChild(botao);
        }

        btnAnterior.disabled = paginaAtual === 1;
        btnProxima.disabled = paginaAtual === totalPaginas || totalPaginas === 0;
    }
};

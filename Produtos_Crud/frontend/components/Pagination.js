window.App = window.App || {};

App.Pagination = {
    renderizar(container, btnAnterior, btnProxima, totalItens, itensPorPagina, paginaAtual, onMudarPagina, paginasPorGrupo) {
        const totalPaginas = Math.ceil(totalItens / itensPorPagina);
        paginasPorGrupo = paginasPorGrupo || 5;
        container.innerHTML = '';

        const grupoAtual = Math.ceil(paginaAtual / paginasPorGrupo);
        const inicio = (grupoAtual - 1) * paginasPorGrupo + 1;
        const fim = Math.min(grupoAtual * paginasPorGrupo, totalPaginas);

        if (grupoAtual > 1) {
            const btnPrevGroup = document.createElement('button');
            btnPrevGroup.className = 'w-8 h-8 rounded-lg hover:bg-white/30 text-on-surface-variant transition-colors text-xs font-bold';
            btnPrevGroup.textContent = '\u2039\u2039';
            btnPrevGroup.addEventListener('click', function() { onMudarPagina(inicio - paginasPorGrupo); });
            container.appendChild(btnPrevGroup);
        }

        for (let i = inicio; i <= fim; i++) {
            const botao = document.createElement('button');
            botao.className = 'w-8 h-8 rounded-lg ' + (i === paginaAtual ? 'bg-primary text-white' : 'hover:bg-white/30 text-on-surface-variant') + ' transition-colors text-xs font-bold';
            botao.textContent = i;
            botao.addEventListener('click', function() { onMudarPagina(i); });
            container.appendChild(botao);
        }

        if (fim < totalPaginas) {
            const btnNextGroup = document.createElement('button');
            btnNextGroup.className = 'w-8 h-8 rounded-lg hover:bg-white/30 text-on-surface-variant transition-colors text-xs font-bold';
            btnNextGroup.textContent = '\u203A\u203A';
            btnNextGroup.addEventListener('click', function() { onMudarPagina(inicio + paginasPorGrupo); });
            container.appendChild(btnNextGroup);
        }

        btnAnterior.disabled = paginaAtual === 1;
        btnProxima.disabled = paginaAtual === totalPaginas || totalPaginas === 0;
    }
};

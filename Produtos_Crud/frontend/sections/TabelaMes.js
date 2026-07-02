window.App = window.App || {};

App.TabelaMes = {
    _corpoTabelaMes: null,
    _mesAnoAtual: null,
    _paginacaoMes: null,
    _paginacaoMesContainer: null,
    _btnPagMesAnterior: null,
    _btnPagMesProxima: null,

    renderizar(container) {
        var h = '';
        h += '<section class="py-8 sm:py-12 px-4 sm:px-8 relative z-20" id="transacoes-mes">';
        h += '<div class="max-w-7xl mx-auto">';
        h += '<div class="liquid-glass card-secao rounded-3xl p-5 sm:p-8 overflow-hidden">';
        h += '<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">';
        h += '<h2 class="font-headline-lg font-bold text-on-surface flex items-center gap-2">';
        h += '<span class="material-symbols-outlined text-primary">calendar_month</span>Transa\u00e7\u00f5es do M\u00eas';
        h += '</h2>';
        h += '<div class="flex items-center gap-4">';
        h += '<p id="mes-ano-atual" class="text-sm font-bold text-on-surface-variant uppercase tracking-wider"></p>';
        h += '<div class="relative">';
        h += '<button id="btn-filtro-status-mes" class="p-2 rounded-xl bg-white/40 border border-white/60 hover:bg-white/60 transition-colors dark:bg-[#2C2C2C] dark:border-[#444] dark:hover:bg-[#383838]">';
        h += '<span class="material-symbols-outlined text-on-surface-variant">filter_list</span>';
        h += '</button>';
        h += '<div id="dropdown-filtro-mes" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-on-surface/10 z-50 py-2 dark:bg-[#1E1E1E] dark:border-[#444]">';
        h += '<button class="filtro-opcao-mes w-full text-left px-4 py-2 text-sm font-medium hover:bg-primary/10 text-on-surface transition-colors" data-filtro="Todas">Todas</button>';
        h += '<button class="filtro-opcao-mes w-full text-left px-4 py-2 text-sm font-medium hover:bg-primary/10 text-green-600 transition-colors" data-filtro="Pago">Pago</button>';
        h += '<button class="filtro-opcao-mes w-full text-left px-4 py-2 text-sm font-medium hover:bg-primary/10 text-yellow-600 transition-colors" data-filtro="Pendente">Pendente</button>';
        h += '<button class="filtro-opcao-mes w-full text-left px-4 py-2 text-sm font-medium hover:bg-primary/10 text-red-500 transition-colors" data-filtro="Atrasado">Atrasado</button>';
        h += '</div></div></div></div>';
        h += '<div class="overflow-x-auto">';
        h += '<table id="tabela-transacoes-mes" class="w-full text-left border-collapse" aria-label="Transa\u00e7\u00f5es do m\u00eas">';
        h += '<thead class="border-b border-on-surface/10"><tr class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">';
        h += '<th class="py-4 px-4">Opera\u00e7\u00e3o</th><th class="py-4 px-4">Descri\u00e7\u00e3o</th><th class="py-4 px-4">Valor</th><th class="py-4 px-4">Vencimento</th><th class="py-4 px-4">Categoria</th><th class="py-4 px-4">Status</th>';
        h += '</tr></thead>';
        h += '<tbody id="corpo-tabela-mes" class="text-sm text-on-surface"></tbody>';
        h += '</table></div>';
        h += '<div id="paginacao-mes-container" class="mt-8 hidden">';
        h += '<div class="flex justify-center items-center gap-4">';
        h += '<button id="btn-pag-mes-anterior" class="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors text-on-surface-variant" aria-label="P\u00e1gina anterior"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span></button>';
        h += '<div id="paginacao-mes" class="flex gap-2" role="group" aria-label="Pagina\u00e7\u00e3o do m\u00eas"></div>';
        h += '<button id="btn-pag-mes-proxima" class="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors text-on-surface-variant" aria-label="Pr\u00f3xima p\u00e1gina"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></button>';
        h += '</div></div></div></div></section>';
        container.innerHTML += h;
    },

    init() {
        App.TabelaMes._corpoTabelaMes = document.getElementById('corpo-tabela-mes');
        App.TabelaMes._mesAnoAtual = document.getElementById('mes-ano-atual');
        App.TabelaMes._paginacaoMes = document.getElementById('paginacao-mes');
        App.TabelaMes._paginacaoMesContainer = document.getElementById('paginacao-mes-container');
        App.TabelaMes._btnPagMesAnterior = document.getElementById('btn-pag-mes-anterior');
        App.TabelaMes._btnPagMesProxima = document.getElementById('btn-pag-mes-proxima');

        App.TabelaMes._btnPagMesAnterior.addEventListener('click', () => {
            if (App.State.getPaginaAtualMes() > 1) {
                App.State.setPaginaAtualMes(App.State.getPaginaAtualMes() - 1);
                App.TabelaMes.renderizarDados();
            }
        });

        App.TabelaMes._btnPagMesProxima.addEventListener('click', () => {
            const totalPaginas = Math.ceil(App.TabelaMes._paginacaoMes.children.length || 1);
            if (App.State.getPaginaAtualMes() < totalPaginas) {
                App.State.setPaginaAtualMes(App.State.getPaginaAtualMes() + 1);
                App.TabelaMes.renderizarDados();
            }
        });
    },

    renderizarDados() {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        App.TabelaMes._mesAnoAtual.textContent = meses[mesAtual] + ' ' + anoAtual;

        const transacoesMes = App.State.getTransacoes().filter(t => {
            const d = App.Helpers.extrairMesAno(t.vencimento);
            return d && d.mes === mesAtual && d.ano === anoAtual;
        });

        transacoesMes.sort((a, b) => {
            const cmpVenc = a.vencimento.localeCompare(b.vencimento);
            if (cmpVenc !== 0) return cmpVenc;
            return a.valor - b.valor;
        });

        const filtroStatus = App.State.getFiltroStatusMes();
        const filtradasMes = filtroStatus !== 'Todas' ? transacoesMes.filter(t => t.status === filtroStatus) : transacoesMes;

        const totalPaginasMes = Math.ceil(filtradasMes.length / App.ITENS_POR_PAGINA_MES);
        if (App.State.getPaginaAtualMes() > totalPaginasMes) App.State.setPaginaAtualMes(Math.max(1, totalPaginasMes));
        const inicioMes = (App.State.getPaginaAtualMes() - 1) * App.ITENS_POR_PAGINA_MES;
        const fimMes = inicioMes + App.ITENS_POR_PAGINA_MES;
        const itensPaginaMes = filtradasMes.slice(inicioMes, fimMes);
        const valoresOcultos = App.State.getValoresOcultos();

        App.TabelaMes._corpoTabelaMes.innerHTML = '';

        if (filtradasMes.length === 0) {
            App.TabelaMes._corpoTabelaMes.innerHTML = '<tr><td colspan="6" class="py-8 px-4 text-center text-on-surface-variant">Nenhuma transação' + (filtroStatus !== 'Todas' ? ' com status "' + filtroStatus + '"' : '') + ' com vencimento neste mês.</td></tr>';
            App.TabelaMes._paginacaoMesContainer.classList.add('hidden');
            return;
        }

        itensPaginaMes.forEach((transacao, index) => {
            const linha = document.createElement('tr');
            linha.className = 'border-b border-on-surface/5 hover:bg-white/30 transition-colors linha-tabela-animada';
            linha.style.animationDelay = (index * 40) + 'ms';
            linha.innerHTML = '<td class="py-4 px-4"><span class="' + App.Helpers.obterCorOperacao(transacao.operacao) + ' font-medium">' + App.Helpers.escapeHtml(transacao.operacao) + '</span></td><td class="py-4 px-4">' + App.Helpers.escapeHtml(transacao.descricao) + '</td><td class="py-4 px-4 font-semibold">' + App.Helpers.escapeHtml(App.Helpers.formatarMoeda(transacao.valor, valoresOcultos)) + '</td><td class="py-4 px-4">' + App.Helpers.escapeHtml(App.Helpers.formatarData(transacao.vencimento)) + '</td><td class="py-4 px-4">' + App.Helpers.escapeHtml(transacao.categoria) + '</td><td class="py-4 px-4"><span class="px-3 py-1 rounded-full ' + App.Helpers.obterClasseStatus(transacao.status) + ' text-[10px] font-bold uppercase">' + App.Helpers.escapeHtml(transacao.status) + '</span></td>';
            App.TabelaMes._corpoTabelaMes.appendChild(linha);
        });

        App.Pagination.renderizar(App.TabelaMes._paginacaoMes, App.TabelaMes._btnPagMesAnterior, App.TabelaMes._btnPagMesProxima, filtradasMes.length, App.ITENS_POR_PAGINA_MES, App.State.getPaginaAtualMes(), function(p) { App.State.setPaginaAtualMes(p); App.TabelaMes.renderizarDados(); });

        if (totalPaginasMes <= 1) {
            App.TabelaMes._paginacaoMesContainer.classList.add('hidden');
        } else {
            App.TabelaMes._paginacaoMesContainer.classList.remove('hidden');
        }
    }
};

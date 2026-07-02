window.App = window.App || {};

App.TabelaTransacoes = {
    _corpoTabela: null,
    _paginacao: null,
    _btnPagAnterior: null,
    _btnPagProxima: null,
    _inputBusca: null,

    renderizar(container) {
        var h = '';
        h += '<section class="py-8 sm:py-12 px-4 sm:px-8 relative z-20" id="transacoes">';
        h += '<div class="max-w-7xl mx-auto">';
        h += '<div class="liquid-glass card-secao rounded-3xl p-5 sm:p-8 overflow-hidden">';
        h += '<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">';
        h += '<h2 class="font-headline-lg font-bold text-on-surface flex items-center gap-2">';
        h += '<span class="material-symbols-outlined text-primary">list_alt</span>Lista de Transa\u00e7\u00f5es';
        h += '</h2>';
        h += '<div class="flex flex-wrap items-center gap-2">';
        h += '<div class="flex flex-wrap gap-2 items-center">';
        h += '<select id="filtro-ano-lista" class="input-field py-1.5 px-3 text-xs font-bold cursor-pointer"><option value="">Ano</option></select>';
        h += '<select id="filtro-mes-lista" class="input-field py-1.5 px-3 text-xs font-bold cursor-pointer" disabled><option value="">M\u00eas</option></select>';
        h += '<button id="btn-ord-venc" class="ordenacao-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-colors bg-primary text-white border border-primary dark:border-primary" data-dir="desc">Vencimento \u2193</button>';
        h += '</div>';
        h += '<div class="relative">';
        h += '<button id="btn-filtro-status-lista" class="p-2 rounded-xl bg-white/40 border border-white/60 hover:bg-white/60 transition-colors dark:bg-[#2C2C2C] dark:border-[#444] dark:hover:bg-[#383838]">';
        h += '<span class="material-symbols-outlined text-on-surface-variant">filter_list</span>';
        h += '</button>';
        h += '<div id="dropdown-filtro-lista" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-on-surface/10 z-50 py-2 dark:bg-[#1E1E1E] dark:border-[#444]">';
        h += '<button class="filtro-opcao-lista w-full text-left px-4 py-2 text-sm font-medium hover:bg-primary/10 text-on-surface transition-colors" data-filtro="Todas">Todas</button>';
        h += '<button class="filtro-opcao-lista w-full text-left px-4 py-2 text-sm font-medium hover:bg-primary/10 text-green-600 transition-colors" data-filtro="Pago">Pago</button>';
        h += '<button class="filtro-opcao-lista w-full text-left px-4 py-2 text-sm font-medium hover:bg-primary/10 text-yellow-600 transition-colors" data-filtro="Pendente">Pendente</button>';
        h += '<button class="filtro-opcao-lista w-full text-left px-4 py-2 text-sm font-medium hover:bg-primary/10 text-red-500 transition-colors" data-filtro="Atrasado">Atrasado</button>';
        h += '</div></div></div></div>';
        h += '<div class="overflow-x-auto">';
        h += '<table id="tabela-transacoes" class="w-full text-left border-collapse" aria-label="Lista de transa\u00e7\u00f5es">';
        h += '<thead class="border-b border-on-surface/10"><tr class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">';
        h += '<th class="py-4 px-4">Opera\u00e7\u00e3o</th><th class="py-4 px-4">Descri\u00e7\u00e3o</th><th class="py-4 px-4">Valor</th><th class="py-4 px-4">Vencimento</th><th class="py-4 px-4">Categoria</th><th class="py-4 px-4">Status</th><th class="py-4 px-4 text-right">A\u00e7\u00f5es</th>';
        h += '</tr></thead>';
        h += '<tbody id="corpo-tabela" class="text-sm text-on-surface"></tbody>';
        h += '</table></div>';
        h += '<div class="mt-8 flex justify-center items-center gap-4">';
        h += '<button id="btn-pag-anterior" class="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors text-on-surface-variant" aria-label="P\u00e1gina anterior"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span></button>';
        h += '<div id="paginacao" class="flex gap-2" role="group" aria-label="Pagina\u00e7\u00e3o"></div>';
        h += '<button id="btn-pag-proxima" class="p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 transition-colors text-on-surface-variant" aria-label="Pr\u00f3xima p\u00e1gina"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></button>';
        h += '</div></div></div></section>';
        container.innerHTML += h;
    },

    init() {
        App.TabelaTransacoes._corpoTabela = document.getElementById('corpo-tabela');
        App.TabelaTransacoes._paginacao = document.getElementById('paginacao');
        App.TabelaTransacoes._btnPagAnterior = document.getElementById('btn-pag-anterior');
        App.TabelaTransacoes._btnPagProxima = document.getElementById('btn-pag-proxima');
        App.TabelaTransacoes._inputBusca = document.getElementById('input-busca');

        App.TabelaTransacoes._btnPagAnterior.addEventListener('click', () => {
            if (App.State.getPaginaAtual() > 1) {
                App.State.setPaginaAtual(App.State.getPaginaAtual() - 1);
                App.TabelaTransacoes.renderizarDados();
            }
        });

        App.TabelaTransacoes._btnPagProxima.addEventListener('click', () => {
            const total = App.TabelaTransacoes._obterTransacoesFiltradas().length;
            const totalPaginas = Math.ceil(total / App.ITENS_POR_PAGINA);
            if (App.State.getPaginaAtual() < totalPaginas) {
                App.State.setPaginaAtual(App.State.getPaginaAtual() + 1);
                App.TabelaTransacoes.renderizarDados();
            }
        });

        let debounceTimer;
        if (App.TabelaTransacoes._inputBusca) {
            App.TabelaTransacoes._inputBusca.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    App.State.setTermoBusca(e.target.value.toLowerCase().trim());
                    App.State.setPaginaAtual(1);
                    App.TabelaTransacoes.renderizarDados();
                    App.State.notify();
                }, 300);
            });
        }

        const btnOrdVenc = document.getElementById('btn-ord-venc');
        if (btnOrdVenc) {
            btnOrdVenc.addEventListener('click', () => {
                const atual = App.State.getOrdenacaoLista();
                App.State.setOrdenacaoLista(atual === 'vencimento-desc' ? 'vencimento-asc' : 'vencimento-desc');
                App.State.setPaginaAtual(1);
                App.TabelaTransacoes._atualizarBotaoVencimento();
                App.TabelaTransacoes.renderizarDados();
            });
        }
        App.TabelaTransacoes._atualizarBotaoVencimento();
    },

    _atualizarBotaoVencimento() {
        const btnOrdVenc = document.getElementById('btn-ord-venc');
        if (!btnOrdVenc) return;
        const isDesc = App.State.getOrdenacaoLista() === 'vencimento-desc';
        btnOrdVenc.dataset.dir = isDesc ? 'desc' : 'asc';
        btnOrdVenc.textContent = isDesc ? 'Vencimento ↓' : 'Vencimento ↑';
    },

    _obterTransacoesFiltradas() {
        let resultado = App.State.getTransacoes();
        const filtroAno = App.State.getFiltroAnoLista();
        const filtroMes = App.State.getFiltroMesLista();
        const filtroStatus = App.State.getFiltroStatusLista();
        const termoBusca = App.State.getTermoBusca();
        const ordenacao = App.State.getOrdenacaoLista();

        if (filtroAno) {
            resultado = resultado.filter(t => {
                const d = App.Helpers.extrairMesAno(t.vencimento);
                return d && d.ano == filtroAno;
            });
        }
        if (filtroAno && filtroMes !== '') {
            resultado = resultado.filter(t => {
                const d = App.Helpers.extrairMesAno(t.vencimento);
                return d && d.mes == filtroMes;
            });
        }
        if (filtroStatus !== 'Todas') {
            resultado = resultado.filter(t => t.status === filtroStatus);
        }
        if (termoBusca) {
            resultado = resultado.filter(t =>
                t.descricao.toLowerCase().includes(termoBusca) ||
                t.operacao.toLowerCase().includes(termoBusca) ||
                t.categoria.toLowerCase().includes(termoBusca) ||
                t.banco.toLowerCase().includes(termoBusca) ||
                t.status.toLowerCase().includes(termoBusca) ||
                (t.metodo_pagamento && t.metodo_pagamento.toLowerCase().includes(termoBusca))
            );
        }
        resultado.sort((a, b) => {
            if (ordenacao === 'vencimento-desc') return (b.vencimento || '').localeCompare(a.vencimento || '');
            if (ordenacao === 'vencimento-asc') return (a.vencimento || '').localeCompare(b.vencimento || '');
            return 0;
        });
        return resultado;
    },

    renderizarDados() {
        try {
            const transacoesFiltradas = App.TabelaTransacoes._obterTransacoesFiltradas();
            const inicio = (App.State.getPaginaAtual() - 1) * App.ITENS_POR_PAGINA;
            const fim = inicio + App.ITENS_POR_PAGINA;
            const itensPagina = transacoesFiltradas.slice(inicio, fim);
            const valoresOcultos = App.State.getValoresOcultos();

            App.TabelaTransacoes._corpoTabela.innerHTML = '';

            if (itensPagina.length === 0) {
                App.TabelaTransacoes._corpoTabela.innerHTML = '<tr><td colspan="7" class="py-8 px-4 text-center text-on-surface-variant">' + (App.State.getTermoBusca() ? 'Nenhuma transação encontrada para a busca.' : 'Nenhuma transação cadastrada.') + '</td></tr>';
                App.Pagination.renderizar(App.TabelaTransacoes._paginacao, App.TabelaTransacoes._btnPagAnterior, App.TabelaTransacoes._btnPagProxima, transacoesFiltradas.length, App.ITENS_POR_PAGINA, App.State.getPaginaAtual(), function(p) { App.State.setPaginaAtual(p); App.TabelaTransacoes.renderizarDados(); });
                return;
            }

            itensPagina.forEach((transacao, index) => {
                const linha = document.createElement('tr');
                linha.className = 'border-b border-on-surface/5 hover:bg-white/30 transition-colors linha-tabela-animada';
                linha.style.animationDelay = (index * 40) + 'ms';
                linha.innerHTML = '<td class="py-4 px-4"><span class="' + App.Helpers.obterCorOperacao(transacao.operacao) + ' font-medium">' + App.Helpers.escapeHtml(transacao.operacao) + '</span></td><td class="py-4 px-4">' + App.Helpers.escapeHtml(transacao.descricao) + '</td><td class="py-4 px-4 font-semibold">' + App.Helpers.escapeHtml(App.Helpers.formatarMoeda(transacao.valor, valoresOcultos)) + '</td><td class="py-4 px-4">' + App.Helpers.escapeHtml(App.Helpers.formatarData(transacao.vencimento)) + '</td><td class="py-4 px-4">' + App.Helpers.escapeHtml(transacao.categoria) + '</td><td class="py-4 px-4"><span class="px-3 py-1 rounded-full ' + App.Helpers.obterClasseStatus(transacao.status) + ' text-[10px] font-bold uppercase">' + App.Helpers.escapeHtml(transacao.status) + '</span></td><td class="py-4 px-4 text-right flex justify-end gap-2"><button class="p-1.5 hover:text-primary transition-colors btn-editar" data-id="' + transacao.id + '"><span class="material-symbols-outlined text-[18px]">edit</span></button><button class="p-1.5 hover:text-red-500 transition-colors btn-excluir" data-id="' + transacao.id + '"><span class="material-symbols-outlined text-[18px]">delete</span></button></td>';
                App.TabelaTransacoes._corpoTabela.appendChild(linha);
            });

            App.TabelaTransacoes._adicionarEventosBotoes();
            App.Pagination.renderizar(App.TabelaTransacoes._paginacao, App.TabelaTransacoes._btnPagAnterior, App.TabelaTransacoes._btnPagProxima, transacoesFiltradas.length, App.ITENS_POR_PAGINA, App.State.getPaginaAtual(), function(p) { App.State.setPaginaAtual(p); App.TabelaTransacoes.renderizarDados(); });
        } catch (e) {
            console.error('Erro ao renderizar tabela:', e);
            App.TabelaTransacoes._corpoTabela.innerHTML = '<tr><td colspan="7" class="py-8 px-4 text-center text-red-500">Erro ao carregar transações.</td></tr>';
        }
    },

    _adicionarEventosBotoes() {
        document.querySelectorAll('.btn-excluir').forEach(botao => {
            botao.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                App.Modal.abrir(id);
            });
        });

        document.querySelectorAll('.btn-editar').forEach(botao => {
            botao.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const transacao = App.State.getTransacoes().find(t => t.id === id);
                if (transacao) App.FormTransacao.preencherParaEdicao(transacao);
            });
        });
    }
};

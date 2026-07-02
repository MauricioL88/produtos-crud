window.App = window.App || {};

App.Relatorios = {
    _saldoTotal: null,
    _totalReceitas: null,
    _totalDespesas: null,
    _filtroAnoFluxo: null,

    renderizar(container) {
        var h = '';
        h += '<section class="py-8 sm:py-12 px-4 sm:px-8 relative z-20" id="relatorios">';
        h += '<div class="max-w-7xl mx-auto">';
        h += '<div class="liquid-glass card-secao rounded-3xl p-5 sm:p-8">';
        h += '<h2 class="font-headline-lg font-bold text-on-surface mb-6 sm:mb-8 flex items-center gap-2">';
        h += '<span class="material-symbols-outlined text-primary">pie_chart</span>';
        h += 'Relat\u00f3rios';
        h += '</h2>';
        h += '<div class="flex flex-col gap-6 sm:gap-8">';
        h += '<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">';
        h += '<div class="bg-white/40 border border-white/60 rounded-2xl p-4 sm:p-6 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444]">';
        h += '<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Saldo Total</p>';
        h += '<h4 id="saldo-total" class="text-xl sm:text-2xl font-bold text-on-surface">R$ 0,00</h4></div>';
        h += '<div class="bg-white/40 border border-white/60 rounded-2xl p-4 sm:p-6 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444]">';
        h += '<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Receitas do M\u00eas</p>';
        h += '<h4 id="total-receitas" class="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">R$ 0,00</h4></div>';
        h += '<div class="bg-white/40 border border-white/60 rounded-2xl p-4 sm:p-6 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444]">';
        h += '<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Despesas do M\u00eas</p>';
        h += '<h4 id="total-despesas" class="text-xl sm:text-2xl font-bold text-red-500 dark:text-red-400">R$ 0,00</h4></div>';
        h += '</div>';
        h += '<div class="flex flex-col gap-4">';
        h += '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">';
        h += '<h3 class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Fluxo de Caixa</h3>';
        h += '<div class="flex items-center gap-4">';
        h += '<div class="flex items-center gap-2 text-xs font-medium"><span class="w-3 h-3 rounded-full bg-green-500"></span><span class="text-on-surface-variant">Receitas</span></div>';
        h += '<div class="flex items-center gap-2 text-xs font-medium"><span class="w-3 h-3 rounded-full bg-primary"></span><span class="text-on-surface-variant">Despesas</span></div>';
        h += '<select id="filtro-ano-fluxo" class="bg-white/40 border border-white/60 rounded-full pl-4 pr-8 py-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider focus:ring-primary/40 focus:border-primary/40 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444] dark:text-[#F5F5F5]"></select>';
        h += '</div></div>';
        h += '<div id="grafico-fluxo" class="bg-white/40 border border-white/60 rounded-2xl p-4 sm:p-6 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444]"></div>';
        h += '</div>';
        h += '<div class="flex flex-col gap-4">';
        h += '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">';
        h += '<h3 class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Distribui\u00e7\u00e3o por Categoria</h3>';
        h += '<div class="flex items-center gap-2">';
        h += '<select id="filtro-ano-categoria" class="bg-white/40 border border-white/60 rounded-full pl-4 pr-8 py-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider focus:ring-primary/40 focus:border-primary/40 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444] dark:text-[#F5F5F5]"><option value="">Total</option></select>';
        h += '<select id="filtro-mes-categoria" class="bg-white/40 border border-white/60 rounded-full pl-4 pr-8 py-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider focus:ring-primary/40 focus:border-primary/40 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444] dark:text-[#F5F5F5]" disabled><option value="">M\u00eas</option></select>';
        h += '</div></div>';
        h += '<div class="bg-white/40 border border-white/60 rounded-2xl p-5 sm:p-8 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444]">';
        h += '<div class="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">';
        h += '<div class="flex-shrink-0">';
        h += '<svg id="grafico-categorias" class="w-40 h-40 sm:w-56 sm:h-56" viewBox="0 0 100 100">';
        h += '<path class="text-primary" d="M50 10 a 40 40 0 0 1 0 80 a 40 40 0 0 1 0 -80" fill="none" stroke="currentColor" stroke-dasharray="0, 100" stroke-width="8"></path>';
        h += '<text id="grafico-porcentagem" class="font-bold fill-on-surface dark:fill-on-surface" text-anchor="middle" x="50" y="50" dominant-baseline="middle" style="font-size:10px">0%</text>';
        h += '</svg></div>';
        h += '<div id="legenda-categorias" class="flex flex-col gap-2 flex-1 min-w-0 max-h-64 overflow-y-auto"></div>';
h += '</div></div></div>';
h += '<div class="flex flex-col gap-4">';
h += '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">';
h += '<h3 class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Distribui\u00e7\u00e3o por Status</h3>';
h += '<div class="flex items-center gap-2">';
h += '<select id="filtro-ano-status" class="bg-white/40 border border-white/60 rounded-full pl-4 pr-8 py-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider focus:ring-primary/40 focus:border-primary/40 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444] dark:text-[#F5F5F5]"><option value="">Total</option></select>';
h += '<select id="filtro-mes-status" class="bg-white/40 border border-white/60 rounded-full pl-4 pr-8 py-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider focus:ring-primary/40 focus:border-primary/40 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444] dark:text-[#F5F5F5]" disabled><option value="">M\u00eas</option></select>';
h += '</div></div>';
h += '<div class="bg-white/40 border border-white/60 rounded-2xl p-5 sm:p-8 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444]">';
h += '<div class="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">';
h += '<div class="flex-shrink-0">';
h += '<svg id="grafico-status" class="w-40 h-40 sm:w-56 sm:h-56" viewBox="0 0 100 100">';
h += '<path d="M50 10 a 40 40 0 0 1 0 80 a 40 40 0 0 1 0 -80" fill="none" stroke="currentColor" class="text-on-surface/10 dark:text-on-surface/20" stroke-dasharray="0, 100" stroke-width="8"></path>';
h += '<text id="grafico-status-porcentagem" class="font-bold fill-on-surface dark:fill-on-surface" text-anchor="middle" x="50" y="50" dominant-baseline="middle" style="font-size:10px">0%</text>';
h += '</svg></div>';
h += '<div id="legenda-status" class="flex flex-col gap-2 flex-1 min-w-0 max-h-64 overflow-y-auto"></div>';
h += '</div></div></div>';
h += '</div></section>';
        container.innerHTML += h;
    },

    init() {
        App.Relatorios._saldoTotal = document.getElementById('saldo-total');
        App.Relatorios._totalReceitas = document.getElementById('total-receitas');
        App.Relatorios._totalDespesas = document.getElementById('total-despesas');
        App.Relatorios._filtroAnoFluxo = document.getElementById('filtro-ano-fluxo');
        App.Relatorios._filtroAnoStatus = document.getElementById('filtro-ano-status');
        App.Relatorios._filtroMesStatus = document.getElementById('filtro-mes-status');
        App.Relatorios._filtroAnoCategoria = document.getElementById('filtro-ano-categoria');
        App.Relatorios._filtroMesCategoria = document.getElementById('filtro-mes-categoria');

        if (App.Relatorios._filtroAnoFluxo) {
            App.Relatorios._filtroAnoFluxo.addEventListener('change', () => App.Relatorios.renderizarDados());
        }

        if (App.Relatorios._filtroAnoStatus) {
            App.Relatorios._filtroAnoStatus.addEventListener('change', () => {
                const ano = App.Relatorios._filtroAnoStatus.value;
                const mesSelect = App.Relatorios._filtroMesStatus;
                if (ano) {
                    mesSelect.disabled = false;
                    App.Relatorios._popularFiltroMesStatus(parseInt(ano, 10));
                } else {
                    mesSelect.disabled = true;
                    mesSelect.innerHTML = '<option value="">M\u00eas</option>';
                }
                App.Relatorios.renderizarDados();
            });
        }

        if (App.Relatorios._filtroMesStatus) {
            App.Relatorios._filtroMesStatus.addEventListener('change', () => {
                App.Relatorios.renderizarDados();
            });
        }

        if (App.Relatorios._filtroAnoCategoria) {
            App.Relatorios._filtroAnoCategoria.addEventListener('change', () => {
                const ano = App.Relatorios._filtroAnoCategoria.value;
                const mesSelect = App.Relatorios._filtroMesCategoria;
                if (ano) {
                    mesSelect.disabled = false;
                    App.Relatorios._popularFiltroMesCategoria(parseInt(ano, 10));
                } else {
                    mesSelect.disabled = true;
                    mesSelect.innerHTML = '<option value="">M\u00eas</option>';
                }
                App.Relatorios.renderizarDados();
            });
        }

        if (App.Relatorios._filtroMesCategoria) {
            App.Relatorios._filtroMesCategoria.addEventListener('change', () => {
                App.Relatorios.renderizarDados();
            });
        }
    },

    popularFiltroAnoFluxo() {
        if (!App.Relatorios._filtroAnoFluxo) return;
        const anos = new Set();
        App.State.getTransacoes().forEach(t => {
            if (!t.vencimento) return;
            let ano;
            if (t.vencimento.includes('-')) {
                ano = parseInt(t.vencimento.split('-')[0], 10);
            } else if (t.vencimento.includes('/')) {
                ano = parseInt(t.vencimento.split('/')[2], 10);
            }
            if (ano && !isNaN(ano)) anos.add(ano);
        });
        if (anos.size === 0) anos.add(new Date().getFullYear());

        const valorAtual = App.Relatorios._filtroAnoFluxo.value;
        App.Relatorios._filtroAnoFluxo.innerHTML = '';
        Array.from(anos).sort((a, b) => a - b).forEach(ano => {
            const opt = document.createElement('option');
            opt.value = ano;
            opt.textContent = ano;
            App.Relatorios._filtroAnoFluxo.appendChild(opt);
        });
        if (valorAtual && App.Relatorios._filtroAnoFluxo.querySelector('option[value="' + valorAtual + '"]')) {
            App.Relatorios._filtroAnoFluxo.value = valorAtual;
        }
    },

    popularFiltroAnoLista() {
        const filtroAnoListaEl = document.getElementById('filtro-ano-lista');
        const filtroMesListaEl = document.getElementById('filtro-mes-lista');
        if (!filtroAnoListaEl) return;

        const anos = new Set();
        App.State.getTransacoes().forEach(t => {
            const d = App.Helpers.extrairMesAno(t.vencimento);
            if (d) anos.add(d.ano);
        });
        if (anos.size === 0) anos.add(new Date().getFullYear());

        const anoCorrente = new Date().getFullYear();
        const valorAtual = App.State.getFiltroAnoLista();
        filtroAnoListaEl.innerHTML = '<option value="">Ano</option>';
        Array.from(anos).sort((a, b) => a - b).forEach(ano => {
            const opt = document.createElement('option');
            opt.value = ano;
            opt.textContent = ano;
            filtroAnoListaEl.appendChild(opt);
        });
        if (valorAtual && filtroAnoListaEl.querySelector('option[value="' + valorAtual + '"]')) {
            filtroAnoListaEl.value = valorAtual;
        } else {
            App.State.setFiltroAnoLista(anoCorrente);
            filtroAnoListaEl.value = anoCorrente;
        }

        filtroAnoListaEl.addEventListener('change', () => {
            App.State.setFiltroAnoLista(filtroAnoListaEl.value);
            App.State.setFiltroMesLista('');
            if (App.State.getFiltroAnoLista()) {
                filtroMesListaEl.disabled = false;
                App.Relatorios._popularFiltroMesLista(App.State.getFiltroAnoLista());
            } else {
                filtroMesListaEl.disabled = true;
                filtroMesListaEl.innerHTML = '<option value="">Mês</option>';
            }
            App.State.setPaginaAtual(1);
            App.State.notify();
        });

        if (filtroMesListaEl) {
            filtroMesListaEl.addEventListener('change', () => {
                App.State.setFiltroMesLista(filtroMesListaEl.value);
                App.State.setPaginaAtual(1);
                App.State.notify();
            });
        }
    },

    _popularFiltroMesLista(ano) {
        const filtroMesListaEl = document.getElementById('filtro-mes-lista');
        if (!filtroMesListaEl) return;

        const mesesDisponiveis = new Set();
        const nomesMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        App.State.getTransacoes().forEach(t => {
            const d = App.Helpers.extrairMesAno(t.vencimento);
            if (d && d.ano == ano) mesesDisponiveis.add(d.mes);
        });

        const valorAtual = App.State.getFiltroMesLista();
        filtroMesListaEl.innerHTML = '<option value="">Mês</option>';
        Array.from(mesesDisponiveis).sort((a, b) => a - b).forEach(mes => {
            const opt = document.createElement('option');
            opt.value = mes;
            opt.textContent = nomesMeses[mes];
            filtroMesListaEl.appendChild(opt);
        });
        if (valorAtual !== '' && filtroMesListaEl.querySelector('option[value="' + valorAtual + '"]')) {
            filtroMesListaEl.value = valorAtual;
        } else {
            App.State.setFiltroMesLista('');
        }
    },

    popularFiltroAnoStatus() {
        const filtroAnoStatusEl = document.getElementById('filtro-ano-status');
        if (!filtroAnoStatusEl) return;

        const anos = new Set();
        App.State.getTransacoes().forEach(t => {
            const d = App.Helpers.extrairMesAno(t.vencimento);
            if (d) anos.add(d.ano);
        });
        if (anos.size === 0) anos.add(new Date().getFullYear());

        const valorAtual = filtroAnoStatusEl.value;
        filtroAnoStatusEl.innerHTML = '<option value="">Total</option>';
        Array.from(anos).sort((a, b) => a - b).forEach(ano => {
            const opt = document.createElement('option');
            opt.value = ano;
            opt.textContent = ano;
            filtroAnoStatusEl.appendChild(opt);
        });
        if (valorAtual && filtroAnoStatusEl.querySelector('option[value="' + valorAtual + '"]')) {
            filtroAnoStatusEl.value = valorAtual;
        }
    },

    _popularFiltroMesStatus(ano) {
        const filtroMesStatusEl = document.getElementById('filtro-mes-status');
        if (!filtroMesStatusEl) return;

        const mesesDisponiveis = new Set();
        const nomesMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        App.State.getTransacoes().forEach(t => {
            const d = App.Helpers.extrairMesAno(t.vencimento);
            if (d && d.ano == ano) mesesDisponiveis.add(d.mes);
        });

        const valorAtual = filtroMesStatusEl.value;
        filtroMesStatusEl.innerHTML = '<option value="">Mês</option>';
        Array.from(mesesDisponiveis).sort((a, b) => a - b).forEach(mes => {
            const opt = document.createElement('option');
            opt.value = mes;
            opt.textContent = nomesMeses[mes];
            filtroMesStatusEl.appendChild(opt);
        });
        if (valorAtual !== '' && filtroMesStatusEl.querySelector('option[value="' + valorAtual + '"]')) {
            filtroMesStatusEl.value = valorAtual;
        }
    },

    popularFiltroAnoCategoria() {
        const filtroAnoCategoriaEl = document.getElementById('filtro-ano-categoria');
        if (!filtroAnoCategoriaEl) return;

        const anos = new Set();
        App.State.getTransacoes().forEach(t => {
            const d = App.Helpers.extrairMesAno(t.vencimento);
            if (d) anos.add(d.ano);
        });
        if (anos.size === 0) anos.add(new Date().getFullYear());

        const valorAtual = filtroAnoCategoriaEl.value;
        filtroAnoCategoriaEl.innerHTML = '<option value="">Total</option>';
        Array.from(anos).sort((a, b) => a - b).forEach(ano => {
            const opt = document.createElement('option');
            opt.value = ano;
            opt.textContent = ano;
            filtroAnoCategoriaEl.appendChild(opt);
        });
        if (valorAtual && filtroAnoCategoriaEl.querySelector('option[value="' + valorAtual + '"]')) {
            filtroAnoCategoriaEl.value = valorAtual;
        }
    },

    _popularFiltroMesCategoria(ano) {
        const filtroMesCategoriaEl = document.getElementById('filtro-mes-categoria');
        if (!filtroMesCategoriaEl) return;

        const mesesDisponiveis = new Set();
        const nomesMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        App.State.getTransacoes().forEach(t => {
            const d = App.Helpers.extrairMesAno(t.vencimento);
            if (d && d.ano == ano) mesesDisponiveis.add(d.mes);
        });

        const valorAtual = filtroMesCategoriaEl.value;
        filtroMesCategoriaEl.innerHTML = '<option value="">Mês</option>';
        Array.from(mesesDisponiveis).sort((a, b) => a - b).forEach(mes => {
            const opt = document.createElement('option');
            opt.value = mes;
            opt.textContent = nomesMeses[mes];
            filtroMesCategoriaEl.appendChild(opt);
        });
        if (valorAtual !== '' && filtroMesCategoriaEl.querySelector('option[value="' + valorAtual + '"]')) {
            filtroMesCategoriaEl.value = valorAtual;
        }
    },

    renderizarDados() {
        try {
            const hoje = new Date();
            const mesAtual = hoje.getMonth();
            const anoAtual = hoje.getFullYear();
            const transacoes = App.State.getTransacoes();
            const valoresOcultos = App.State.getValoresOcultos();

            const receitasMes = transacoes.filter(t => {
                if (t.operacao !== 'Receita') return false;
                const d = App.Helpers.extrairMesAno(t.vencimento);
                return d && d.mes === mesAtual && d.ano === anoAtual;
            }).reduce((soma, t) => soma + t.valor, 0);

            const despesasMes = transacoes.filter(t => {
                if (t.operacao !== 'Despesa') return false;
                const d = App.Helpers.extrairMesAno(t.vencimento);
                return d && d.mes === mesAtual && d.ano === anoAtual;
            }).reduce((soma, t) => soma + t.valor, 0);

            const totalReceitas = transacoes.filter(t => t.operacao === 'Receita').reduce((soma, t) => soma + t.valor, 0);
            const totalDespesas = transacoes.filter(t => t.operacao === 'Despesa').reduce((soma, t) => soma + t.valor, 0);
            const saldo = totalReceitas - totalDespesas;

            App.Relatorios._saldoTotal.textContent = App.Helpers.formatarMoeda(saldo, valoresOcultos);
            App.Relatorios._totalReceitas.textContent = App.Helpers.formatarMoeda(receitasMes, valoresOcultos);
            App.Relatorios._totalDespesas.textContent = App.Helpers.formatarMoeda(despesasMes, valoresOcultos);
            App.Relatorios._saldoTotal.className = 'text-2xl font-bold ' + (saldo >= 0 ? 'text-green-600' : 'text-red-500');

            const filtroAnoCat = document.getElementById('filtro-ano-categoria');
            const filtroMesCat = document.getElementById('filtro-mes-categoria');
            let transacoesCat = transacoes;
            if (filtroAnoCat && filtroAnoCat.value) {
                const anoCat = parseInt(filtroAnoCat.value, 10);
                if (!isNaN(anoCat)) {
                    transacoesCat = transacoesCat.filter(t => {
                        const d = App.Helpers.extrairMesAno(t.vencimento);
                        return d && d.ano === anoCat;
                    });
                    if (filtroMesCat && filtroMesCat.value !== '') {
                        const mesCat = parseInt(filtroMesCat.value, 10);
                        if (!isNaN(mesCat)) {
                            transacoesCat = transacoesCat.filter(t => {
                                const d = App.Helpers.extrairMesAno(t.vencimento);
                                return d && d.mes === mesCat;
                            });
                        }
                    }
                }
            }
            App.PieChart.renderizar(transacoesCat, valoresOcultos);
            App.LineChart.renderizar(transacoes, valoresOcultos);
            App.DonutChart.renderizar(transacoes, valoresOcultos);
        } catch (e) {
            console.error('Erro ao atualizar relatórios:', e);
        }
    }
};

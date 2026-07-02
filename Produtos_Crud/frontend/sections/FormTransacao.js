window.App = window.App || {};

App.FormTransacao = {
    _form: null,
    _inputDescricao: null,
    _inputValor: null,
    _inputVencimento: null,
    _btnCancelarEdicao: null,
    _optionsManagers: null,

    renderizar(container) {
        var h = '';
        h += '<section class="pt-14 sm:pt-32 pb-24 sm:pb-12 px-4 sm:px-8 relative z-20" id="cadastro">';
        h += '<div class="max-w-7xl mx-auto">';
        h += '<div class="flex md:hidden flex-col items-center gap-3 mb-4">';
        h += '<div class="flex items-center gap-2">';
        h += '<svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">';
        h += '<rect width="32" height="32" rx="8" fill="#FF5E3A"/>';
        h += '<text x="16" y="22" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="16" fill="white">CF</text>';
        h += '</svg>';
        h += '<h1 class="text-lg font-bold text-on-surface">Controle Financeiro</h1>';
        h += '</div>';
        h += '<div class="flex items-center gap-3">';
        h += '<button id="btn-ocultar-valores-mobile" class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-white/60 text-on-surface-variant text-xs font-bold hover:bg-white/60 transition-colors dark:bg-[#2C2C2C] dark:border-[#444]">';
        h += '<span class="material-symbols-outlined text-[18px]">visibility_off</span>Ocultar valores';
        h += '</button>';
        h += '<button id="btn-tema-mobile" class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-white/60 text-on-surface-variant text-xs font-bold hover:bg-white/60 transition-colors dark:bg-[#2C2C2C] dark:border-[#444]">';
        h += '<span class="material-symbols-outlined text-[18px]">dark_mode</span>Tema';
        h += '</button>';
        h += '</div></div>';
        h += '<div class="liquid-glass card-secao rounded-3xl p-5 sm:p-8">';
        h += '<h2 class="font-headline-lg font-bold text-on-surface mb-6 sm:mb-8 flex items-center gap-2">';
        h += '<span class="material-symbols-outlined text-primary">add_circle</span>';
        h += 'Cadastrar Transa\u00e7\u00e3o';
        h += '</h2>';
        h += '<form id="form-transacao" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">';
        h += '<div class="flex flex-col gap-2">';
        h += '<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider" for="operacao">Opera\u00e7\u00e3o</label>';
        h += '<select id="operacao" name="operacao" class="input-field"><option>Despesa</option><option>Receita</option></select>';
        h += '</div>';
        h += '<div class="flex flex-col gap-2">';
        h += '<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider" for="categoria">Categoria</label>';
        h += '<select id="categoria" name="categoria" class="input-field"><option value="">Selecione a categoria</option></select>';
        h += '</div>';
        h += '<div class="flex flex-col gap-2 md:col-span-2">';
        h += '<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider" for="descricao">Descri\u00e7\u00e3o</label>';
        h += '<input id="descricao" name="descricao" class="input-field" placeholder="Ex: Aluguel Mensal" type="text"/>';
        h += '</div>';
        h += '<div class="flex flex-col gap-2">';
        h += '<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider" for="valor">Valor</label>';
        h += '<div class="relative">';
        h += '<span class="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-[#D5D5D5]">R$</span>';
        h += '<input id="valor" name="valor" class="w-full input-field pl-10" placeholder="0,00" step="0.01" type="number"/>';
        h += '</div></div>';
        h += '<div class="flex flex-col gap-2">';
        h += '<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider" for="vencimento">Vencimento</label>';
        h += '<input id="vencimento" name="vencimento" class="input-field" type="date"/>';
        h += '</div>';
        h += '<div class="flex flex-col gap-2">';
        h += '<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider" for="parcela-corrente">Parcela Corrente</label>';
        h += '<input id="parcela-corrente" name="parcela_corrente" class="input-field" type="number" value="1"/>';
        h += '</div>';
        h += '<div class="flex flex-col gap-2">';
        h += '<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider" for="total-parcelas">Total de Parcelas</label>';
        h += '<input id="total-parcelas" name="total_parcelas" class="input-field" type="number" value="1"/>';
        h += '</div>';
        h += '<div class="flex flex-col gap-2">';
        h += '<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider" for="status">Status</label>';
        h += '<select id="status" name="status" class="input-field"><option>Pendente</option><option>Pago</option></select>';
        h += '</div>';
        h += '<div class="flex flex-col gap-2">';
        h += '<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider" for="banco">Banco</label>';
        h += '<select id="banco" name="banco" class="input-field"><option value="">Selecione o banco</option></select>';
        h += '</div>';
        h += '<div class="flex flex-col gap-2">';
        h += '<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider" for="data-pagamento">Data de Pagamento</label>';
        h += '<input id="data-pagamento" name="data_pagamento" class="input-field" type="date"/>';
        h += '</div>';
        h += '<div class="flex flex-col gap-2">';
        h += '<label class="text-xs font-bold text-on-surface-variant uppercase tracking-wider" for="metodo-pagamento">M\u00e9todo de Pagamento</label>';
        h += '<select id="metodo-pagamento" name="metodo_pagamento" class="input-field"><option value="">Selecione o m\u00e9todo</option></select>';
        h += '</div>';
        h += '<div class="md:col-span-3 lg:col-span-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 mt-4">';
        h += '<button class="px-6 py-3 text-on-surface-variant font-medium hover:text-primary transition-colors" type="reset">Limpar</button>';
        h += '<button id="btn-cancelar-edicao" class="hidden px-6 py-3 bg-red-500/10 text-red-500 font-medium rounded-xl hover:bg-red-500/20 transition-colors" type="button">Cancelar</button>';
        h += '<button class="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all" type="submit">Cadastrar</button>';
        h += '</div></form></div></div></section>';
        container.innerHTML += h;
    },

    init(optionsManagers) {
        App.FormTransacao._form = document.getElementById('form-transacao');
        App.FormTransacao._inputDescricao = document.getElementById('descricao');
        App.FormTransacao._inputValor = document.getElementById('valor');
        App.FormTransacao._inputVencimento = document.getElementById('vencimento');
        App.FormTransacao._btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
        App.FormTransacao._optionsManagers = optionsManagers;

        App.FormTransacao._inputDescricao.addEventListener('input', () => App.FormTransacao._limparErro(App.FormTransacao._inputDescricao));
        App.FormTransacao._inputValor.addEventListener('input', () => App.FormTransacao._limparErro(App.FormTransacao._inputValor));
        App.FormTransacao._inputVencimento.addEventListener('input', () => App.FormTransacao._limparErro(App.FormTransacao._inputVencimento));
        optionsManagers.categoria.selectEl.addEventListener('change', () => App.FormTransacao._limparErro(optionsManagers.categoria.selectEl));

        App.FormTransacao._form.addEventListener('submit', (e) => App.FormTransacao._onSubmit(e));
        App.FormTransacao._btnCancelarEdicao.addEventListener('click', () => App.FormTransacao._cancelarEdicao());

        // Mobile buttons
        var btnTemaMobile = document.getElementById('btn-tema-mobile');
        var btnOcultarMobile = document.getElementById('btn-ocultar-valores-mobile');
        if (btnTemaMobile) {
            btnTemaMobile.addEventListener('click', function() {
                var html = document.documentElement;
                var isDark = html.classList.contains('dark');
                html.classList.toggle('dark', !isDark);
                html.classList.toggle('light', isDark);
                localStorage.setItem('tema', isDark ? 'light' : 'dark');
                var icon = btnTemaMobile.querySelector('.material-symbols-outlined');
                icon.textContent = isDark ? 'dark_mode' : 'light_mode';
            });
        }
        if (btnOcultarMobile) {
            btnOcultarMobile.addEventListener('click', function() {
                var atual = App.State.getValoresOcultos();
                App.State.setValoresOcultos(!atual);
                localStorage.setItem('valoresOcultos', !atual);
                var icon = btnOcultarMobile.querySelector('.material-symbols-outlined');
                icon.textContent = atual ? 'visibility_off' : 'visibility';
                App.State.notify();
            });
        }
    },

    _limparErro(campo) {
        campo.classList.remove('border-red-500', 'dark:border-red-400');
        campo.classList.add('border-white/60', 'dark:border-[#444]');
    },

    _marcarErro(campo) {
        campo.classList.remove('border-white/60', 'dark:border-[#444]');
        campo.classList.add('border-red-500', 'dark:border-red-400');
    },

    _onSubmit(e) {
        e.preventDefault();

        const descricao = App.FormTransacao._inputDescricao.value.trim();
        const valor = parseFloat(App.FormTransacao._inputValor.value) || 0;
        const vencimento = App.FormTransacao._inputVencimento.value;
        let valido = true;

        if (!descricao) { App.FormTransacao._marcarErro(App.FormTransacao._inputDescricao); valido = false; }
        if (valor <= 0) { App.FormTransacao._marcarErro(App.FormTransacao._inputValor); valido = false; }
        if (!vencimento) { App.FormTransacao._marcarErro(App.FormTransacao._inputVencimento); valido = false; }
        if (!App.FormTransacao._optionsManagers.categoria.selectEl.value) {
            App.FormTransacao._marcarErro(App.FormTransacao._optionsManagers.categoria.selectEl);
            valido = false;
        }
        if (!valido) return;

        const dados = {
            operacao: document.getElementById('operacao').value,
            categoria: App.FormTransacao._optionsManagers.categoria.selectEl.value,
            descricao: descricao,
            valor: valor,
            vencimento: vencimento,
            parcela_corrente: parseInt(document.getElementById('parcela-corrente').value) || 1,
            total_parcelas: parseInt(document.getElementById('total-parcelas').value) || 1,
            status: document.getElementById('status').value,
            banco: App.FormTransacao._optionsManagers.banco.selectEl.value,
            data_pagamento: document.getElementById('data-pagamento').value,
            metodo_pagamento: App.FormTransacao._optionsManagers.metodoPagamento.selectEl.value
        };

        const transacoes = App.State.getTransacoes();
        const idEdicao = App.State.getIdEdicaoAtual();

        if (idEdicao !== null) {
            const indice = transacoes.findIndex(t => t.id === idEdicao);
            if (indice !== -1) {
                dados.id = idEdicao;
                transacoes[indice] = dados;
            }
            App.State.setIdEdicaoAtual(null);
            App.FormTransacao._resetarBotaoSubmit();
            App.Toast.mostrar('Transação atualizada!');
        } else {
            dados.id = App.State.incrementarProximoId();
            transacoes.unshift(dados);

            if (dados.total_parcelas > 1 && dados.parcela_corrente < dados.total_parcelas) {
                for (let i = dados.parcela_corrente + 1; i <= dados.total_parcelas; i++) {
                    const parcela = Object.assign({}, dados, {
                        id: App.State.incrementarProximoId(),
                        parcela_corrente: i,
                        vencimento: App.Helpers.incrementarMes(dados.vencimento, i - dados.parcela_corrente),
                        status: 'Pendente',
                        data_pagamento: '',
                        metodo_pagamento: ''
                    });
                    transacoes.unshift(parcela);
                }
            }
            App.Toast.mostrar('Transação cadastrada!');
        }

        App.FormTransacao._form.reset();
        document.getElementById('parcela-corrente').value = 1;
        document.getElementById('total-parcelas').value = 1;

        App.State.setTransacoes(transacoes);
        App.WebView.enviar('salvar_transacoes', { transacoes: transacoes });
    },

    _cancelarEdicao() {
        App.State.setIdEdicaoAtual(null);
        App.FormTransacao._form.reset();
        document.getElementById('parcela-corrente').value = 1;
        document.getElementById('total-parcelas').value = 1;
        App.FormTransacao._resetarBotaoSubmit();
    },

    _resetarBotaoSubmit() {
        const btnSubmit = App.FormTransacao._form.querySelector('button[type="submit"]');
        btnSubmit.textContent = 'Cadastrar';
        btnSubmit.classList.remove('bg-tertiary');
        btnSubmit.classList.add('bg-primary');
        App.FormTransacao._btnCancelarEdicao.classList.add('hidden');
    },

    preencherParaEdicao(transacao) {
        App.State.setIdEdicaoAtual(transacao.id);

        document.getElementById('operacao').value = transacao.operacao;
        document.getElementById('descricao').value = transacao.descricao;
        document.getElementById('valor').value = transacao.valor;
        document.getElementById('vencimento').value = transacao.vencimento;
        document.getElementById('parcela-corrente').value = transacao.parcela_corrente || 1;
        document.getElementById('total-parcelas').value = transacao.total_parcelas || 1;
        document.getElementById('status').value = transacao.status;
        document.getElementById('data-pagamento').value = transacao.data_pagamento || '';

        App.FormTransacao._optionsManagers.categoria.setSelectValue(transacao.categoria);
        App.FormTransacao._optionsManagers.banco.setSelectValue(transacao.banco);
        App.FormTransacao._optionsManagers.metodoPagamento.setSelectValue(transacao.metodo_pagamento);

        const btnSubmit = App.FormTransacao._form.querySelector('button[type="submit"]');
        btnSubmit.textContent = 'Atualizar';
        btnSubmit.classList.remove('bg-primary');
        btnSubmit.classList.add('bg-tertiary');
        App.FormTransacao._btnCancelarEdicao.classList.remove('hidden');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

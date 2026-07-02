window.App = window.App || {};

App.CadastroOpcoes = {
    managers: {},

    renderizar(container) {
        var h = '';
        h += '<section class="py-8 sm:py-12 px-4 sm:px-8 relative z-20" id="categorias">';
        h += '<div class="max-w-7xl mx-auto">';
        h += '<div class="liquid-glass card-secao rounded-3xl p-5 sm:p-8 overflow-hidden">';
        h += '<h2 class="font-headline-lg font-bold text-on-surface mb-6 sm:mb-8 flex items-center gap-2">';
        h += '<span class="material-symbols-outlined text-primary">settings</span>';
        h += 'Cadastrar Op\u00e7\u00f5es';
        h += '</h2>';
        h += '<div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">';
        h += '<div class="flex flex-col gap-4 min-w-0">';
        h += '<h3 class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Nova Categoria</h3>';
        h += '<div class="flex flex-col gap-2">';
        h += '<input id="nova-categoria" class="w-full input-field" placeholder="Ex: Educa\u00e7\u00e3o, Viagem" type="text"/>';
        h += '<button id="btn-adicionar-categoria" class="w-full bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all">Adicionar</button>';
        h += '</div>';
        h += '<ul id="lista-categorias" class="flex flex-wrap gap-2 mt-2"></ul>';
        h += '</div>';
        h += '<div class="flex flex-col gap-4 min-w-0">';
        h += '<h3 class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Novo Banco</h3>';
        h += '<div class="flex flex-col gap-2">';
        h += '<input id="novo-banco" class="w-full input-field" placeholder="Ex: Santander, XP" type="text"/>';
        h += '<button id="btn-adicionar-banco" class="w-full bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all">Adicionar</button>';
        h += '</div>';
        h += '<ul id="lista-bancos" class="flex flex-wrap gap-2 mt-2"></ul>';
        h += '</div>';
        h += '<div class="flex flex-col gap-4 min-w-0">';
        h += '<h3 class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Novo M\u00e9todo de Pagamento</h3>';
        h += '<div class="flex flex-col gap-2">';
        h += '<input id="novo-metodo-pagamento" class="w-full input-field" placeholder="Ex: Pix, Cart\u00e3o de Cr\u00e9dito" type="text"/>';
        h += '<button id="btn-adicionar-metodo-pagamento" class="w-full bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all">Adicionar</button>';
        h += '</div>';
        h += '<ul id="lista-metodos-pagamento" class="flex flex-wrap gap-2 mt-2"></ul>';
        h += '</div>';
        h += '</div></div></div></section>';
        container.innerHTML += h;
    },

    init() {
        App.CadastroOpcoes.managers.categoria = new App.OptionsManager({
            nome: 'Categoria',
            inputId: 'nova-categoria',
            btnId: 'btn-adicionar-categoria',
            listaId: 'lista-categorias',
            selectId: 'categoria',
            placeholder: 'Selecione a categoria',
            getDados: () => App.State.getCategorias(),
            setDados: (v) => App.State.setCategorias(v),
            saveFn: () => App.WebView.enviar('salvar_categorias', { categorias: App.State.getCategorias() })
        });

        App.CadastroOpcoes.managers.banco = new App.OptionsManager({
            nome: 'Banco',
            inputId: 'novo-banco',
            btnId: 'btn-adicionar-banco',
            listaId: 'lista-bancos',
            selectId: 'banco',
            placeholder: 'Selecione o banco',
            getDados: () => App.State.getBancos(),
            setDados: (v) => App.State.setBancos(v),
            saveFn: () => App.WebView.enviar('salvar_bancos', { bancos: App.State.getBancos() })
        });

        App.CadastroOpcoes.managers.metodoPagamento = new App.OptionsManager({
            nome: 'Método de Pagamento',
            inputId: 'novo-metodo-pagamento',
            btnId: 'btn-adicionar-metodo-pagamento',
            listaId: 'lista-metodos-pagamento',
            selectId: 'metodo-pagamento',
            placeholder: 'Selecione o método',
            getDados: () => App.State.getMetodosPagamento(),
            setDados: (v) => App.State.setMetodosPagamento(v),
            saveFn: () => App.WebView.enviar('salvar_metodos_pagamento', { metodos_pagamento: App.State.getMetodosPagamento() })
        });
    },

    renderizarTudo() {
        Object.values(App.CadastroOpcoes.managers).forEach(m => {
            m.renderizarSelect();
            m.renderizarLista();
        });
    }
};

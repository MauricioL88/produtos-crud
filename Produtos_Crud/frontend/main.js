window.App = window.App || {};

function renderizarTudo() {
    var verificarAtrasadas = function() {
        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        var alterado = false;
        App.State.getTransacoes().forEach(function(t) {
            if (t.status !== 'Pendente' || !t.vencimento) return;
            var dataVenc;
            if (t.vencimento.includes('-')) {
                var p = t.vencimento.split('-');
                dataVenc = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
            } else if (t.vencimento.includes('/')) {
                var p = t.vencimento.split('/');
                dataVenc = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
            }
            if (!dataVenc || isNaN(dataVenc.getTime())) return;
            dataVenc.setHours(0, 0, 0, 0);
            if (dataVenc < hoje) {
                t.status = 'Atrasado';
                alterado = true;
            }
        });
        return alterado;
    };

    verificarAtrasadas();

    App.CadastroOpcoes.renderizarTudo();
    App.TabelaTransacoes.renderizarDados();
    App.TabelaMes.renderizarDados();
    App.Relatorios.popularFiltroAnoFluxo();
    App.Relatorios.popularFiltroAnoLista();
    App.Relatorios.renderizarDados();
}

function initDropdowns() {
    var btnFiltroStatusMes = document.getElementById('btn-filtro-status-mes');
    var dropdownFiltroMes = document.getElementById('dropdown-filtro-mes');
    var btnFiltroStatusLista = document.getElementById('btn-filtro-status-lista');
    var dropdownFiltroLista = document.getElementById('dropdown-filtro-lista');

    if (btnFiltroStatusMes) {
        btnFiltroStatusMes.addEventListener('click', function(e) {
            e.stopPropagation();
            if (dropdownFiltroMes.classList.contains('hidden')) {
                App.Dropdown.abrir(dropdownFiltroMes);
            } else {
                App.Dropdown.fechar(dropdownFiltroMes);
            }
        });
    }

    document.querySelectorAll('.filtro-opcao-mes').forEach(function(btn) {
        btn.addEventListener('click', function() {
            App.State.setFiltroStatusMes(btn.dataset.filtro);
            App.State.setPaginaAtualMes(1);
            App.Dropdown.fechar(dropdownFiltroMes);
            App.State.notify();
        });
    });

    if (btnFiltroStatusLista) {
        btnFiltroStatusLista.addEventListener('click', function(e) {
            e.stopPropagation();
            if (dropdownFiltroLista.classList.contains('hidden')) {
                App.Dropdown.abrir(dropdownFiltroLista);
            } else {
                App.Dropdown.fechar(dropdownFiltroLista);
            }
        });
    }

    document.querySelectorAll('.filtro-opcao-lista').forEach(function(btn) {
        btn.addEventListener('click', function() {
            App.State.setFiltroStatusLista(btn.dataset.filtro);
            App.State.setPaginaAtual(1);
            App.Dropdown.fechar(dropdownFiltroLista);
            App.State.notify();
        });
    });

    document.addEventListener('click', function() {
        App.Dropdown.fechar(dropdownFiltroMes);
        App.Dropdown.fechar(dropdownFiltroLista);
    });
}

function renderizarSecoes() {
    var app = document.getElementById('app');
    app.innerHTML = '';

    App.Navbar.renderizar(document.body);
    App.FormTransacao.renderizar(app);
    App.TabelaMes.renderizar(app);
    App.TabelaTransacoes.renderizar(app);
    App.CadastroOpcoes.renderizar(app);
    App.Relatorios.renderizar(app);

    app.innerHTML += '<footer class="py-8 px-4 sm:px-8 pb-24 sm:pb-8 border-t border-on-surface/10 dark:border-white/10 bg-surface-container-low dark:bg-[#1E1E1E] w-full">' +
        '<div class="flex flex-col md:flex-row justify-between items-center gap-4">' +
        '<p class="text-xs text-on-surface-variant dark:text-[#D5D5D5] font-medium">&copy; 2026 mLabs - Controle Financeiro</p>' +
        '<p class="text-xs text-on-surface dark:text-[#F5F5F5] font-medium">Desenvolvido por MLisboa88</p>' +
        '</div></footer>';
}

document.addEventListener('DOMContentLoaded', function() {
    App.Modal.renderizar(document.body);
    renderizarSecoes();

    App.Theme.init();
    App.Modal.init();
    App.Navbar.init();
    App.CadastroOpcoes.init();
    App.FormTransacao.init(App.CadastroOpcoes.managers);
    App.TabelaTransacoes.init();
    App.TabelaMes.init();
    App.Relatorios.init();
    initDropdowns();

    App.State.subscribe(renderizarTudo);

    App.Navbar.initObservers();

    if (App.WebView.isWebView) {
        App.WebView.onMessage(function(dados) {
            if (dados.acao === 'dados_carregados') {
                App.State.loadFromServer(dados);
            } else if (dados.status === 'ok') {
                console.log('Dados salvos: ' + dados.tipo);
            }
        });
        App.WebView.enviar('carregar_dados', {});
    } else {
        renderizarTudo();
    }
});

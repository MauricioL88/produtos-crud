window.App = window.App || {};

App.State = (function() {
    let _transacoes = [];
    let _categorias = [...App.DEFAULTS.categorias];
    let _bancos = [...App.DEFAULTS.bancos];
    let _metodosPagamento = [...App.DEFAULTS.metodosPagamento];
    let _proximoId = 1;
    let _paginaAtual = 1;
    let _paginaAtualMes = 1;
    let _idEdicaoAtual = null;
    let _termoBusca = '';
    let _filtroStatusMes = 'Todas';
    let _filtroStatusLista = 'Todas';
    let _ordenacaoLista = 'vencimento-desc';
    let _filtroAnoLista = '';
    let _filtroMesLista = '';
    let _valoresOcultos = false;

    const _observers = new Set();

    return {
        getTransacoes: () => _transacoes,
        setTransacoes: (v) => { _transacoes = v; App.State.notify(); },

        getCategorias: () => _categorias,
        setCategorias: (v) => { _categorias = v; },

        getBancos: () => _bancos,
        setBancos: (v) => { _bancos = v; },

        getMetodosPagamento: () => _metodosPagamento,
        setMetodosPagamento: (v) => { _metodosPagamento = v; },

        getProximoId: () => _proximoId,
        setProximoId: (v) => { _proximoId = v; },
        incrementarProximoId: () => _proximoId++,

        getPaginaAtual: () => _paginaAtual,
        setPaginaAtual: (v) => { _paginaAtual = v; },

        getPaginaAtualMes: () => _paginaAtualMes,
        setPaginaAtualMes: (v) => { _paginaAtualMes = v; },

        getIdEdicaoAtual: () => _idEdicaoAtual,
        setIdEdicaoAtual: (v) => { _idEdicaoAtual = v; },

        getTermoBusca: () => _termoBusca,
        setTermoBusca: (v) => { _termoBusca = v; },

        getFiltroStatusMes: () => _filtroStatusMes,
        setFiltroStatusMes: (v) => { _filtroStatusMes = v; },

        getFiltroStatusLista: () => _filtroStatusLista,
        setFiltroStatusLista: (v) => { _filtroStatusLista = v; },

        getOrdenacaoLista: () => _ordenacaoLista,
        setOrdenacaoLista: (v) => { _ordenacaoLista = v; },

        getFiltroAnoLista: () => _filtroAnoLista,
        setFiltroAnoLista: (v) => { _filtroAnoLista = v; },

        getFiltroMesLista: () => _filtroMesLista,
        setFiltroMesLista: (v) => { _filtroMesLista = v; },

        getValoresOcultos: () => _valoresOcultos,
        setValoresOcultos: (v) => { _valoresOcultos = v; },

        loadFromServer(dados) {
            if (dados.transacoes && Array.isArray(dados.transacoes)) {
                _transacoes = dados.transacoes;
                _proximoId = _transacoes.reduce((max, t) => Math.max(max, t.id || 0), 0) + 1;
            }
            if (dados.categorias && Array.isArray(dados.categorias)) {
                _categorias = dados.categorias;
            }
            if (dados.bancos && Array.isArray(dados.bancos)) {
                _bancos = dados.bancos;
            }
            if (dados.metodos_pagamento && Array.isArray(dados.metodos_pagamento)) {
                _metodosPagamento = dados.metodos_pagamento;
            }
            App.State.notify();
        },

        subscribe(fn) {
            _observers.add(fn);
            return () => _observers.delete(fn);
        },

        notify() {
            _observers.forEach(fn => fn());
        }
    };
})();

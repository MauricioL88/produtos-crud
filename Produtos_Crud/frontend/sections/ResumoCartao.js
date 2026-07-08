window.App = window.App || {};

App.ResumoCartao = {
    renderizar(container) {
        var h = '';
        h += '<section class="pt-14 sm:pt-32 pb-4 sm:pb-6 px-4 sm:px-8 relative z-20" id="resumo-cartao">';
        h += '<div class="max-w-7xl mx-auto">';
        h += '<div class="flex md:hidden flex-col items-center gap-3 mb-6">';
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
        h += '<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">';

        h += '<div class="bg-white/40 border border-white/60 rounded-2xl p-4 sm:p-6 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444]">';
        h += '<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">';
        h += '<span class="material-symbols-outlined text-[16px]">payments</span>Pagamentos da Semana</p>';
        h += '<h4 id="total-pagamentos-semana" class="text-xl sm:text-2xl font-bold text-on-surface">R$ 0,00</h4></div>';

        h += '<div class="bg-white/40 border border-white/60 rounded-2xl p-4 sm:p-6 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444]">';
        h += '<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">';
        h += '<span class="material-symbols-outlined text-[16px]">check_circle</span>Transa\u00e7\u00f5es Pagas</p>';
        h += '<h4 id="total-transacoes-pagas" class="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">R$ 0,00</h4></div>';

        h += '<div class="bg-white/40 border border-white/60 rounded-2xl p-4 sm:p-6 backdrop-blur-md dark:bg-[#2C2C2C] dark:border-[#444]">';
        h += '<p class="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">';
        h += '<span class="material-symbols-outlined text-[16px]">pending_actions</span>Transa\u00e7\u00f5es a Pagar</p>';
        h += '<h4 id="total-transacoes-pagar" class="text-xl sm:text-2xl font-bold text-red-500 dark:text-red-400">R$ 0,00</h4></div>';

        h += '</div></div></section>';
        container.innerHTML += h;
    },

    renderizarDados() {
        try {
            var hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            var mesAtual = hoje.getMonth();
            var anoAtual = hoje.getFullYear();

            var diaSemana = hoje.getDay();
            var diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
            var segunda = new Date(hoje);
            segunda.setDate(hoje.getDate() + diffSegunda);
            segunda.setHours(0, 0, 0, 0);
            var domingo = new Date(segunda);
            domingo.setDate(segunda.getDate() + 6);
            domingo.setHours(23, 59, 59, 999);

            var transacoes = App.State.getTransacoes();
            var valoresOcultos = App.State.getValoresOcultos();

            function dataNaSemana(dataStr) {
                if (!dataStr) return false;
                var partes = dataStr.split('-');
                if (partes.length !== 3) return false;
                var data = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
                data.setHours(0, 0, 0, 0);
                return data >= segunda && data <= domingo;
            }

            function noMesCorrente(dataStr) {
                if (!dataStr) return false;
                var d = App.Helpers.extrairMesAno(dataStr);
                return d && d.mes === mesAtual && d.ano === anoAtual;
            }

            var pagamentosSemana = transacoes.filter(function(t) {
                return t.operacao === 'Despesa'
                    && (t.status === 'Pendente' || t.status === 'Atrasado')
                    && dataNaSemana(t.vencimento);
            }).reduce(function(soma, t) { return soma + t.valor; }, 0);

            var transacoesPagas = transacoes.filter(function(t) {
                return t.operacao === 'Despesa'
                    && t.status === 'Pago'
                    && noMesCorrente(t.data_pagamento);
            }).reduce(function(soma, t) { return soma + t.valor; }, 0);

            var transacoesPagar = transacoes.filter(function(t) {
                return t.operacao === 'Despesa'
                    && (t.status === 'Pendente' || t.status === 'Atrasado')
                    && noMesCorrente(t.vencimento);
            }).reduce(function(soma, t) { return soma + t.valor; }, 0);

            var elPagSemana = document.getElementById('total-pagamentos-semana');
            var elPagas = document.getElementById('total-transacoes-pagas');
            var elPagar = document.getElementById('total-transacoes-pagar');

            if (elPagSemana) elPagSemana.textContent = App.Helpers.formatarMoeda(pagamentosSemana, valoresOcultos);
            if (elPagas) elPagas.textContent = App.Helpers.formatarMoeda(transacoesPagas, valoresOcultos);
            if (elPagar) elPagar.textContent = App.Helpers.formatarMoeda(transacoesPagar, valoresOcultos);
        } catch (e) {
            console.error('Erro ao atualizar cards de resumo:', e);
        }
    }
};

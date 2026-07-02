window.App = window.App || {};

App.Modal = {
    _modalExclusao: null,
    _modalOverlay: null,
    _modalMensagem: null,
    _idExclusaoPendente: null,

    renderizar(container) {
        var h = '';
        h += '<div id="modal-exclusao" role="dialog" aria-modal="true" aria-labelledby="modal-titulo" aria-describedby="modal-mensagem" class="fixed inset-0 z-[100] hidden items-center justify-center">';
        h += '<div id="modal-overlay" class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>';
        h += '<div class="relative bg-[#F9F5EF] border border-white/60 rounded-3xl p-8 max-w-md w-[90%] mx-4 z-10 dark:bg-[#1E1E1E] dark:border-[#444]">';
        h += '<div class="flex items-center gap-3 mb-4">';
        h += '<span class="material-symbols-outlined text-red-500 text-[28px]" aria-hidden="true">warning</span>';
        h += '<h3 id="modal-titulo" class="font-headline-md text-on-surface">Confirmar Exclus\u00e3o</h3>';
        h += '</div>';
        h += '<p id="modal-mensagem" class="text-on-surface-variant mb-8">Tem certeza que deseja excluir esta transa\u00e7\u00e3o?</p>';
        h += '<div class="flex items-center justify-end gap-4">';
        h += '<button id="modal-cancelar" class="px-6 py-3 text-on-surface-variant font-medium hover:text-primary transition-colors dark:hover:text-primary">Cancelar</button>';
        h += '<button id="modal-confirmar" class="bg-red-500 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all">Excluir</button>';
        h += '</div></div></div>';
        container.insertAdjacentHTML('beforeend', h);
    },

    init() {
        App.Modal._modalExclusao = document.getElementById('modal-exclusao');
        App.Modal._modalOverlay = document.getElementById('modal-overlay');
        App.Modal._modalMensagem = document.getElementById('modal-mensagem');
        const modalCancelar = document.getElementById('modal-cancelar');
        const modalConfirmar = document.getElementById('modal-confirmar');

        modalCancelar.addEventListener('click', () => App.Modal.fechar());
        App.Modal._modalOverlay.addEventListener('click', () => App.Modal.fechar());
        modalConfirmar.addEventListener('click', () => App.Modal._confirmar());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !App.Modal._modalExclusao.classList.contains('hidden')) {
                App.Modal.fechar();
            }
        });
    },

    abrir(id) {
        App.Modal._idExclusaoPendente = id;
        const transacao = App.State.getTransacoes().find(t => t.id === id);
        App.Modal._modalMensagem.textContent = 'Deseja excluir a transação "' + App.Helpers.escapeHtml(transacao?.descricao || '') + '"?';
        App.Modal._modalExclusao.classList.remove('hidden');
        App.Modal._modalExclusao.classList.add('flex');
        document.getElementById('modal-cancelar').focus();
    },

    fechar() {
        const conteudo = App.Modal._modalExclusao.querySelector('div:last-child');
        App.Modal._modalExclusao.style.animation = 'modal-fade-out 0.2s ease-in forwards';
        conteudo.style.animation = 'modal-slide-down 0.25s ease-in forwards';
        setTimeout(() => {
            App.Modal._modalExclusao.style.animation = '';
            conteudo.style.animation = '';
            App.Modal._modalExclusao.classList.add('hidden');
            App.Modal._modalExclusao.classList.remove('flex');
            App.Modal._idExclusaoPendente = null;
        }, 250);
    },

    _confirmar() {
        if (App.Modal._idExclusaoPendente === null) return;

        const transacoes = App.State.getTransacoes().filter(t => t.id !== App.Modal._idExclusaoPendente);
        App.State.setTransacoes(transacoes);

        if (App.State.getPaginaAtual() > 1 && transacoes.length <= (App.State.getPaginaAtual() - 1) * App.ITENS_POR_PAGINA) {
            App.State.setPaginaAtual(App.State.getPaginaAtual() - 1);
        }

        App.WebView.enviar('salvar_transacoes', { transacoes: transacoes });
        App.Modal.fechar();
        App.Toast.mostrar('Transação excluída!', 'erro');
        App.State.notify();
    }
};

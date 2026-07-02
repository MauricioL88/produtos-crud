window.App = window.App || {};

App.Theme = {
    init() {
        App.Theme._initTema();
        App.Theme._initOcultarValores();
    },

    _initTema() {
        const btn = document.getElementById('btn-tema');
        if (!btn) return;

        const html = document.documentElement;
        const icon = btn.querySelector('.material-symbols-outlined');

        const temaSalvo = localStorage.getItem('tema');
        if (temaSalvo === 'dark') {
            html.classList.remove('light');
            html.classList.add('dark');
            icon.textContent = 'light_mode';
        }

        btn.addEventListener('click', () => {
            btn.classList.add('tema-animando');
            setTimeout(() => btn.classList.remove('tema-animando'), 400);

            const isDark = html.classList.contains('dark');
            html.classList.toggle('dark', !isDark);
            html.classList.toggle('light', isDark);
            icon.textContent = isDark ? 'dark_mode' : 'light_mode';
            localStorage.setItem('tema', isDark ? 'light' : 'dark');
        });
    },

    _initOcultarValores() {
        const btn = document.getElementById('btn-ocultar-valores');
        if (!btn) return;

        const icon = btn.querySelector('.material-symbols-outlined');
        const valorSalvo = localStorage.getItem('valoresOcultos');
        if (valorSalvo === 'true') {
            App.State.setValoresOcultos(true);
            icon.textContent = 'visibility';
        }

        btn.addEventListener('click', () => {
            btn.classList.add('olho-animando');
            setTimeout(() => btn.classList.remove('olho-animando'), 400);

            const atual = App.State.getValoresOcultos();
            App.State.setValoresOcultos(!atual);
            icon.textContent = atual ? 'visibility_off' : 'visibility';
            localStorage.setItem('valoresOcultos', !atual);
            App.State.notify();
        });
    },

};

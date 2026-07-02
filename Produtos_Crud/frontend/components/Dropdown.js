window.App = window.App || {};

App.Dropdown = {
    abrir(el) {
        if (!el) return;
        el.classList.remove('hidden');
        el.style.animation = 'dropdown-in 0.15s ease-out forwards';
    },

    fechar(el) {
        if (!el) return;
        el.style.animation = 'dropdown-out 0.15s ease-in forwards';
        setTimeout(() => { el.classList.add('hidden'); el.style.animation = ''; }, 150);
    }
};

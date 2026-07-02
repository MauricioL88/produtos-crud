window.App = window.App || {};

App.Navbar = {
    _navLinks: [],
    _navIndicator: null,
    _secoes: [],

    renderizar(container) {
        var h = '';

        // Desktop navbar
        h += '<nav class="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-full border border-white/80 bg-white/50 dark:border-white/10 dark:bg-[#1E1E1E]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(139,69,19,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 hidden md:flex justify-between items-center py-3 px-3 lg:px-5">';
        h += '<a class="flex items-center gap-2 flex-shrink-0" href="#">';
        h += '<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">';
        h += '<rect width="32" height="32" rx="8" fill="#FF5E3A"/>';
        h += '<text x="16" y="22" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="16" fill="white">CF</text>';
        h += '</svg>';
        h += '</a>';
        h += '<div class="flex items-center gap-1 lg:gap-4 flex-1 justify-center relative pb-1">';
        h += '<div id="nav-indicator" class="absolute bottom-0 h-[3px] bg-primary rounded-full transition-all duration-300 ease-in-out"></div>';
        h += '<a class="nav-link text-primary font-bold text-xs lg:text-sm whitespace-nowrap px-2 py-1 rounded-lg hover:bg-white/20 dark:hover:bg-white/5 transition-all" href="#cadastro">Cadastrar</a>';
        h += '<a class="nav-link text-on-surface-variant font-medium text-xs lg:text-sm whitespace-nowrap px-2 py-1 rounded-lg hover:bg-white/20 dark:hover:bg-white/5 transition-all" href="#transacoes-mes">M\u00eas</a>';
        h += '<a class="nav-link text-on-surface-variant font-medium text-xs lg:text-sm whitespace-nowrap px-2 py-1 rounded-lg hover:bg-white/20 dark:hover:bg-white/5 transition-all" href="#transacoes">Lista</a>';
        h += '<a class="nav-link text-on-surface-variant font-medium text-xs lg:text-sm whitespace-nowrap px-2 py-1 rounded-lg hover:bg-white/20 dark:hover:bg-white/5 transition-all" href="#categorias">Op\u00e7\u00f5es</a>';
        h += '<a class="nav-link text-on-surface-variant font-medium text-xs lg:text-sm whitespace-nowrap px-2 py-1 rounded-lg hover:bg-white/20 dark:hover:bg-white/5 transition-all" href="#relatorios">Relat\u00f3rios</a>';
        h += '</div>';
        h += '<div class="flex items-center gap-1 lg:gap-2 flex-shrink-0">';
        h += '<div class="relative flex items-center hidden lg:flex">';
        h += '<input id="input-busca" class="bg-white/40 border border-white/60 rounded-full px-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:ring-0 focus:border-primary/40 transition-all backdrop-blur-md w-36 xl:w-48 dark:bg-[#2C2C2C] dark:border-[#444] dark:text-[#F5F5F5]" placeholder="Buscar..." type="text" aria-label="Buscar transa\u00e7\u00f5es"/>';
        h += '<button class="absolute right-2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center" aria-hidden="true"><span class="material-symbols-outlined text-[16px]">search</span></button>';
        h += '</div>';
        h += '<button id="btn-ocultar-valores" class="p-1.5 lg:p-2 rounded-full hover:bg-white/30 dark:hover:bg-white/10 transition-colors" aria-label="Ocultar ou mostrar valores"><span class="material-symbols-outlined text-on-surface-variant text-[18px] lg:text-[20px]">visibility_off</span></button>';
        h += '<button id="btn-tema" class="p-1.5 lg:p-2 rounded-full hover:bg-white/30 dark:hover:bg-white/10 transition-colors" aria-label="Alternar tema claro/escuro"><span class="material-symbols-outlined text-on-surface-variant text-[18px] lg:text-[20px]">dark_mode</span></button>';
        h += '</div></nav>';

        // Mobile bottom navigation
        h += '<nav class="bottom-nav fixed bottom-0 left-0 right-0 z-50 md:hidden">';
        h += '<div class="bottom-nav-inner flex items-end justify-around px-2 pb-safe">';
        h += '<a class="bottom-nav-item" href="#cadastro" data-secao="cadastro">';
        h += '<span class="material-symbols-outlined text-[22px]">add_circle</span>';
        h += '<span class="text-[10px] font-semibold leading-tight">Cadastrar</span>';
        h += '</a>';
        h += '<a class="bottom-nav-item" href="#transacoes-mes" data-secao="transacoes-mes">';
        h += '<span class="material-symbols-outlined text-[22px]">calendar_month</span>';
        h += '<span class="text-[10px] font-semibold leading-tight">M\u00eas</span>';
        h += '</a>';
        h += '<a class="bottom-nav-item" href="#transacoes" data-secao="transacoes">';
        h += '<span class="material-symbols-outlined text-[22px]">list</span>';
        h += '<span class="text-[10px] font-semibold leading-tight">Lista</span>';
        h += '</a>';
        h += '<a class="bottom-nav-item" href="#categorias" data-secao="categorias">';
        h += '<span class="material-symbols-outlined text-[22px]">tune</span>';
        h += '<span class="text-[10px] font-semibold leading-tight">Op\u00e7\u00f5es</span>';
        h += '</a>';
        h += '<a class="bottom-nav-item" href="#relatorios" data-secao="relatorios">';
        h += '<span class="material-symbols-outlined text-[22px]">pie_chart</span>';
        h += '<span class="text-[10px] font-semibold leading-tight">Relat\u00f3rios</span>';
        h += '</a>';
        h += '</div></nav>';

        container.insertAdjacentHTML('afterbegin', h);
    },

    init() {
        App.Navbar._navLinks = document.querySelectorAll('.nav-link');
        App.Navbar._navIndicator = document.getElementById('nav-indicator');

        App.Navbar._navLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                App.Navbar._setLinkAtivo(link);
                var target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Bottom nav mobile links
        var bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(function(item) {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                App.Navbar._setBottomNavAtivo(item);
                var target = document.querySelector(item.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        if (App.Navbar._navLinks.length > 0) {
            setTimeout(function() { App.Navbar._atualizarIndicador(App.Navbar._navLinks[0]); }, 100);
        }
        if (bottomNavItems.length > 0) {
            App.Navbar._setBottomNavAtivo(bottomNavItems[0]);
        }

        window.addEventListener('resize', function() {
            var ativo = document.querySelector('.nav-link.text-primary');
            if (ativo) App.Navbar._atualizarIndicador(ativo);
        });
    },

    initObservers() {
        App.Navbar._secoes = Array.from(App.Navbar._navLinks).map(function(link) {
            var href = link.getAttribute('href');
            return { link: link, secao: document.querySelector(href) };
        }).filter(function(s) { return s.secao; });

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var item = App.Navbar._secoes.find(function(s) { return s.secao === entry.target; });
                    if (item) {
                        App.Navbar._setLinkAtivo(item.link);
                        var bottomItem = document.querySelector('.bottom-nav-item[href="' + item.link.getAttribute('href') + '"]');
                        if (bottomItem) App.Navbar._setBottomNavAtivo(bottomItem);
                    }
                }
            });
        }, { rootMargin: '-30% 0px -60% 0px' });

        App.Navbar._secoes.forEach(function(s) { observer.observe(s.secao); });

        var observerCards = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visivel');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.card-secao').forEach(function(card) { observerCards.observe(card); });
    },

    _atualizarIndicador(link) {
        var container = link.parentElement;
        var containerRect = container.getBoundingClientRect();
        var linkRect = link.getBoundingClientRect();
        App.Navbar._navIndicator.style.width = linkRect.width + 'px';
        App.Navbar._navIndicator.style.left = (linkRect.left - containerRect.left) + 'px';
    },

    _setLinkAtivo(link) {
        App.Navbar._navLinks.forEach(function(l) {
            l.classList.remove('text-primary', 'font-bold');
            l.classList.add('text-on-surface-variant', 'font-medium');
        });
        link.classList.remove('text-on-surface-variant', 'font-medium');
        link.classList.add('text-primary', 'font-bold');
        App.Navbar._atualizarIndicador(link);
    },

    _setBottomNavAtivo(item) {
        document.querySelectorAll('.bottom-nav-item').forEach(function(i) {
            i.classList.remove('ativo');
        });
        item.classList.add('ativo');
    }
};

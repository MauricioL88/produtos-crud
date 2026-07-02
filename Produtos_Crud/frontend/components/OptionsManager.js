window.App = window.App || {};

App.OptionsManager = function(config) {
    this.nome = config.nome;
    this.inputEl = config.inputEl || document.getElementById(config.inputId);
    this.btnEl = config.btnEl || document.getElementById(config.btnId);
    this.listaEl = config.listaEl || document.getElementById(config.listaId);
    this.selectEl = config.selectEl || document.getElementById(config.selectId);
    this.placeholder = config.placeholder || 'Selecione o(a) ' + config.nome.toLowerCase();
    this.saveFn = config.saveFn;
    this.getDados = config.getDados;
    this.setDados = config.setDados;

    this._bindEvents();
};

App.OptionsManager.prototype._bindEvents = function() {
    const self = this;
    this.btnEl.addEventListener('click', function() { self._adicionar(); });
    this.inputEl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            self.btnEl.click();
        }
    });
};

App.OptionsManager.prototype._adicionar = function() {
    const valor = this.inputEl.value.trim();
    const dados = this.getDados();
    if (valor && dados.indexOf(valor) === -1) {
        dados.push(valor);
        this.setDados(dados);
        this.inputEl.value = '';
        this.renderizarSelect();
        this.renderizarLista();
        this.saveFn();
    }
};

App.OptionsManager.prototype.renderizarSelect = function() {
    if (!this.selectEl) return;
    const valorAtual = this.selectEl.value;
    this.selectEl.innerHTML = '';
    const opcaoVazia = document.createElement('option');
    opcaoVazia.value = '';
    opcaoVazia.textContent = this.placeholder;
    this.selectEl.appendChild(opcaoVazia);

    const dados = this.getDados();
    for (let i = 0; i < dados.length; i++) {
        const opcao = document.createElement('option');
        opcao.value = dados[i];
        opcao.textContent = dados[i];
        if (dados[i] === valorAtual) opcao.selected = true;
        this.selectEl.appendChild(opcao);
    }
};

App.OptionsManager.prototype.renderizarLista = function() {
    const self = this;
    this.listaEl.innerHTML = '';
    const dados = this.getDados();

    for (let index = 0; index < dados.length; index++) {
        const li = document.createElement('li');
        li.className = 'flex items-center gap-2 bg-white/40 border border-white/60 rounded-full px-3 py-1 text-sm text-on-surface pill-animada';
        li.style.animationDelay = (index * 30) + 'ms';
        li.innerHTML = '<span>' + App.Helpers.escapeHtml(dados[index]) + '</span><button class="text-red-500 hover:text-red-700 text-xs btn-remover-item" data-index="' + index + '">&times;</button>';
        this.listaEl.appendChild(li);
    }

    this.listaEl.querySelectorAll('.btn-remover-item').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            const index = parseInt(e.currentTarget.dataset.index);
            const dadosAtuais = self.getDados();
            dadosAtuais.splice(index, 1);
            self.setDados(dadosAtuais);
            self.renderizarSelect();
            self.renderizarLista();
            self.saveFn();
        });
    });
};

App.OptionsManager.prototype.setSelectValue = function(valor) {
    if (!this.selectEl) return;
    if (this.selectEl.querySelector('option[value="' + valor + '"]')) {
        this.selectEl.value = valor;
    } else if (valor) {
        const opcao = document.createElement('option');
        opcao.value = valor;
        opcao.textContent = valor;
        this.selectEl.appendChild(opcao);
        this.selectEl.value = valor;
    } else {
        this.selectEl.value = '';
    }
};

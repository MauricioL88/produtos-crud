// ==========================================
// Controle Financeiro - JavaScript Principal
// ==========================================

// --- Integração com C# (WebView2) ---
const isWebView = typeof window.chrome !== 'undefined' && window.chrome.webview;

if (isWebView) {
    window.chrome.webview.addEventListener('message', (event) => {
        const dados = event.data;
        if (dados.acao === 'dados_carregados') {
            CarregarDadosDoExcel(dados);
        } else if (dados.status === 'ok') {
            console.log(`Dados salvos: ${dados.tipo}`);
        }
    });
}

function EnviarParaCSharp(acao, dados) {
    if (isWebView) {
        try {
            const mensagem = { acao, ...dados };
            window.chrome.webview.postMessage(mensagem);
        } catch (e) {
            console.error('Erro ao comunicar com C#:', e);
        }
    }
}

function CarregarDadosDoExcel(dados) {
    if (dados.transacoes && Array.isArray(dados.transacoes)) {
        transacoes = dados.transacoes;
        proximoId = transacoes.reduce((max, t) => Math.max(max, t.id || 0), 0) + 1;
    }

    if (dados.categorias && Array.isArray(dados.categorias)) {
        categorias = dados.categorias;
    }

    if (dados.bancos && Array.isArray(dados.bancos)) {
        bancos = dados.bancos;
    }

    const alterado = verificarAtrasadas();
    if (alterado) salvarTransacoes();

    renderizarSelectCategorias();
    renderizarListaCategorias();
    renderizarSelectBancos();
    renderizarListaBancos();
    renderizarTabela();
    renderizarTabelaMes();
    popularFiltroAnoFluxo();
    popularFiltroAnoLista();
    atualizarRelatorios();
}

// --- Dados Iniciais ---
let transacoes = [];
let categorias = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Salário', 'Outros'];
let bancos = ['Nubank', 'Itaú', 'Inter', 'Outro'];

const ITENS_POR_PAGINA = 5;
const ITENS_POR_PAGINA_MES = 10;
let paginaAtual = 1;
let paginaAtualMes = 1;
let proximoId = 1;
let idEdicaoAtual = null;
let termoBusca = '';
let filtroStatusMes = 'Todas';
let filtroStatusLista = 'Todas';
let ordenacaoLista = 'vencimento-desc';
let filtroAnoLista = '';
let filtroMesLista = '';
let valoresOcultos = false;

// --- Referências dos Elementos ---
const formTransacao = document.getElementById('form-transacao');
const corpoTabela = document.getElementById('corpo-tabela');
const paginacao = document.getElementById('paginacao');
const btnPagAnterior = document.getElementById('btn-pag-anterior');
const btnPagProxima = document.getElementById('btn-pag-proxima');

const corpoTabelaMes = document.getElementById('corpo-tabela-mes');
const mesAnoAtual = document.getElementById('mes-ano-atual');
const paginacaoMes = document.getElementById('paginacao-mes');
const paginacaoMesContainer = document.getElementById('paginacao-mes-container');
const btnPagMesAnterior = document.getElementById('btn-pag-mes-anterior');
const btnPagMesProxima = document.getElementById('btn-pag-mes-proxima');

const saldoTotal = document.getElementById('saldo-total');
const totalReceitas = document.getElementById('total-receitas');
const totalDespesas = document.getElementById('total-despesas');
const graficoPorcentagem = document.getElementById('grafico-porcentagem');
const graficoCategorias = document.getElementById('grafico-categorias');
const graficoFluxo = document.getElementById('grafico-fluxo');
const filtroAnoFluxo = document.getElementById('filtro-ano-fluxo');

const inputNovaCategoria = document.getElementById('nova-categoria');
const btnAdicionarCategoria = document.getElementById('btn-adicionar-categoria');
const listaCategorias = document.getElementById('lista-categorias');

const inputNovoBanco = document.getElementById('novo-banco');
const btnAdicionarBanco = document.getElementById('btn-adicionar-banco');
const listaBancos = document.getElementById('lista-bancos');

const selectCategoria = document.getElementById('categoria');
const selectBanco = document.getElementById('banco');

const inputBusca = document.getElementById('input-busca');

const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');

// --- Funções Auxiliares ---
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function mostrarToast(mensagem, tipo = 'sucesso') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const cores = {
        sucesso: 'bg-green-500/90 dark:bg-green-600/90',
        erro: 'bg-red-500/90 dark:bg-red-600/90',
        info: 'bg-primary/90'
    };
    const icones = {
        sucesso: 'check_circle',
        erro: 'error',
        info: 'info'
    };
    const toast = document.createElement('div');
    toast.className = `toast ${cores[tipo] || cores.sucesso} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium min-w-[250px]`;
    toast.innerHTML = `<span class="material-symbols-outlined text-[20px]">${icones[tipo] || icones.sucesso}</span><span>${escapeHtml(mensagem)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('saindo');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatarMoeda(valor) {
    if (valoresOcultos) return '****';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataISO) {
    if (!dataISO) return '-';
    let limpo = dataISO.split('T')[0].split(' ')[0];
    const partes = limpo.split('-');
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function incrementarMes(dataStr, meses) {
    let data;
    if (dataStr.includes('/')) {
        const partes = dataStr.split('/');
        data = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
    } else {
        let limpo = dataStr.split('T')[0].split(' ')[0];
        const partes = limpo.split('-');
        data = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    }
    data.setMonth(data.getMonth() + meses);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function obterClasseStatus(status) {
    switch (status) {
        case 'Pago': return 'bg-green-100/60 text-green-700';
        case 'Pendente': return 'bg-yellow-100/60 text-yellow-700';
        case 'Atrasado': return 'bg-red-100/60 text-red-700';
        default: return 'bg-gray-100/60 text-gray-700';
    }
}

function obterCorOperacao(operacao) {
    return operacao === 'Despesa' ? 'text-red-500' : 'text-green-600';
}

function salvarTransacoes() {
    EnviarParaCSharp('salvar_transacoes', { transacoes });
}

function salvarCategorias() {
    EnviarParaCSharp('salvar_categorias', { categorias });
}

function salvarBancos() {
    EnviarParaCSharp('salvar_bancos', { bancos });
}

// --- Busca ---
let debounceTimer;
if (inputBusca) {
    inputBusca.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            termoBusca = e.target.value.toLowerCase().trim();
            paginaAtual = 1;
            renderizarTabela();
            renderizarTabelaMes();
        }, 300);
    });
}

function obterTransacoesFiltradas() {
    let resultado = transacoes;

    if (filtroAnoLista) {
        resultado = resultado.filter(t => {
            const d = extrairMesAno(t.vencimento);
            return d && d.ano == filtroAnoLista;
        });
    }

    if (filtroAnoLista && filtroMesLista !== '') {
        resultado = resultado.filter(t => {
            const d = extrairMesAno(t.vencimento);
            return d && d.mes == filtroMesLista;
        });
    }

    if (filtroStatusLista !== 'Todas') {
        resultado = resultado.filter(t => t.status === filtroStatusLista);
    }

    if (termoBusca) {
        resultado = resultado.filter(t =>
            t.descricao.toLowerCase().includes(termoBusca) ||
            t.operacao.toLowerCase().includes(termoBusca) ||
            t.categoria.toLowerCase().includes(termoBusca) ||
            t.banco.toLowerCase().includes(termoBusca) ||
            t.status.toLowerCase().includes(termoBusca) ||
            (t.metodo_pagamento && t.metodo_pagamento.toLowerCase().includes(termoBusca))
        );
    }

    resultado.sort((a, b) => {
        if (ordenacaoLista === 'vencimento-desc') {
            return (b.vencimento || '').localeCompare(a.vencimento || '');
        }
        if (ordenacaoLista === 'vencimento-asc') {
            return (a.vencimento || '').localeCompare(b.vencimento || '');
        }
        return 0;
    });

    return resultado;
}

// --- Renderizar Tabela ---
function renderizarTabela() {
    try {
    const transacoesFiltradas = obterTransacoesFiltradas();
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const itensPagina = transacoesFiltradas.slice(inicio, fim);

    corpoTabela.innerHTML = '';

    if (itensPagina.length === 0) {
        corpoTabela.innerHTML = `
            <tr>
                <td colspan="7" class="py-8 px-4 text-center text-on-surface-variant">
                    ${termoBusca ? 'Nenhuma transação encontrada para a busca.' : 'Nenhuma transação cadastrada.'}
                </td>
            </tr>
        `;
        renderizarPaginacao(transacoesFiltradas.length);
        return;
    }

    itensPagina.forEach((transacao, index) => {
        const linha = document.createElement('tr');
        linha.className = 'border-b border-on-surface/5 hover:bg-white/30 transition-colors linha-tabela-animada';
        linha.style.animationDelay = `${index * 40}ms`;
        linha.innerHTML = `
            <td class="py-4 px-4"><span class="${obterCorOperacao(transacao.operacao)} font-medium">${escapeHtml(transacao.operacao)}</span></td>
            <td class="py-4 px-4">${escapeHtml(transacao.descricao)}</td>
            <td class="py-4 px-4 font-semibold">${escapeHtml(formatarMoeda(transacao.valor))}</td>
            <td class="py-4 px-4">${escapeHtml(formatarData(transacao.vencimento))}</td>
            <td class="py-4 px-4">${escapeHtml(transacao.categoria)}</td>
            <td class="py-4 px-4"><span class="px-3 py-1 rounded-full ${obterClasseStatus(transacao.status)} text-[10px] font-bold uppercase">${escapeHtml(transacao.status)}</span></td>
            <td class="py-4 px-4 text-right flex justify-end gap-2">
                <button class="p-1.5 hover:text-primary transition-colors btn-editar" data-id="${transacao.id}">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button class="p-1.5 hover:text-red-500 transition-colors btn-excluir" data-id="${transacao.id}">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </td>
        `;
        corpoTabela.appendChild(linha);
    });

    adicionarEventosBotoesTabela();
    renderizarPaginacao(transacoesFiltradas.length);
    } catch (e) {
        console.error('Erro ao renderizar tabela:', e);
        corpoTabela.innerHTML = '<tr><td colspan="7" class="py-8 px-4 text-center text-red-500">Erro ao carregar transações.</td></tr>';
    }
}

// --- Tabela Transações do Mês ---
function renderizarTabelaMes() {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    mesAnoAtual.textContent = `${meses[mesAtual]} ${anoAtual}`;

    const transacoesMes = transacoes.filter(t => {
        const d = extrairMesAno(t.vencimento);
        return d && d.mes === mesAtual && d.ano === anoAtual;
    });

    transacoesMes.sort((a, b) => {
        const cmpVenc = a.vencimento.localeCompare(b.vencimento);
        if (cmpVenc !== 0) return cmpVenc;
        return a.valor - b.valor;
    });

    const filtradasMes = filtroStatusMes !== 'Todas'
        ? transacoesMes.filter(t => t.status === filtroStatusMes)
        : transacoesMes;

    const totalPaginasMes = Math.ceil(filtradasMes.length / ITENS_POR_PAGINA_MES);
    if (paginaAtualMes > totalPaginasMes) paginaAtualMes = Math.max(1, totalPaginasMes);
    const inicioMes = (paginaAtualMes - 1) * ITENS_POR_PAGINA_MES;
    const fimMes = inicioMes + ITENS_POR_PAGINA_MES;
    const itensPaginaMes = filtradasMes.slice(inicioMes, fimMes);

    corpoTabelaMes.innerHTML = '';

    if (filtradasMes.length === 0) {
        corpoTabelaMes.innerHTML = `
            <tr>
                <td colspan="6" class="py-8 px-4 text-center text-on-surface-variant">
                    Nenhuma transação${filtroStatusMes !== 'Todas' ? ' com status "' + filtroStatusMes + '"' : ''} com vencimento neste mês.
                </td>
            </tr>
        `;
        paginacaoMesContainer.classList.add('hidden');
        return;
    }

    itensPaginaMes.forEach((transacao, index) => {
        const linha = document.createElement('tr');
        linha.className = 'border-b border-on-surface/5 hover:bg-white/30 transition-colors linha-tabela-animada';
        linha.style.animationDelay = `${index * 40}ms`;
        linha.innerHTML = `
            <td class="py-4 px-4"><span class="${obterCorOperacao(transacao.operacao)} font-medium">${escapeHtml(transacao.operacao)}</span></td>
            <td class="py-4 px-4">${escapeHtml(transacao.descricao)}</td>
            <td class="py-4 px-4 font-semibold">${escapeHtml(formatarMoeda(transacao.valor))}</td>
            <td class="py-4 px-4">${escapeHtml(formatarData(transacao.vencimento))}</td>
            <td class="py-4 px-4">${escapeHtml(transacao.categoria)}</td>
            <td class="py-4 px-4"><span class="px-3 py-1 rounded-full ${obterClasseStatus(transacao.status)} text-[10px] font-bold uppercase">${escapeHtml(transacao.status)}</span></td>
        `;
        corpoTabelaMes.appendChild(linha);
    });

    renderizarPaginacaoMes(filtradasMes.length);
}

// --- Paginação ---
function renderizarPaginacao(totalItens) {
    const totalPaginas = Math.ceil(totalItens / ITENS_POR_PAGINA);
    paginacao.innerHTML = '';

    for (let i = 1; i <= totalPaginas; i++) {
        const botao = document.createElement('button');
        botao.className = `w-8 h-8 rounded-lg ${i === paginaAtual ? 'bg-primary text-white' : 'hover:bg-white/30 text-on-surface-variant'} transition-colors text-xs font-bold`;
        botao.textContent = i;
        botao.addEventListener('click', () => {
            paginaAtual = i;
            renderizarTabela();
        });
        paginacao.appendChild(botao);
    }

    btnPagAnterior.disabled = paginaAtual === 1;
    btnPagProxima.disabled = paginaAtual === totalPaginas || totalPaginas === 0;
}

btnPagAnterior.addEventListener('click', () => {
    if (paginaAtual > 1) {
        paginaAtual--;
        renderizarTabela();
    }
});

btnPagProxima.addEventListener('click', () => {
    const transacoesFiltradas = obterTransacoesFiltradas();
    const totalPaginas = Math.ceil(transacoesFiltradas.length / ITENS_POR_PAGINA);
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        renderizarTabela();
    }
});

// --- Paginação Transações do Mês ---
function renderizarPaginacaoMes(totalItens) {
    const totalPaginas = Math.ceil(totalItens / ITENS_POR_PAGINA_MES);
    paginacaoMes.innerHTML = '';

    if (totalPaginas <= 1) {
        paginacaoMesContainer.classList.add('hidden');
        return;
    }
    paginacaoMesContainer.classList.remove('hidden');

    for (let i = 1; i <= totalPaginas; i++) {
        const botao = document.createElement('button');
        botao.className = `w-8 h-8 rounded-lg ${i === paginaAtualMes ? 'bg-primary text-white' : 'hover:bg-white/30 text-on-surface-variant'} transition-colors text-xs font-bold`;
        botao.textContent = i;
        botao.addEventListener('click', () => {
            paginaAtualMes = i;
            renderizarTabelaMes();
        });
        paginacaoMes.appendChild(botao);
    }

    btnPagMesAnterior.disabled = paginaAtualMes === 1;
    btnPagMesProxima.disabled = paginaAtualMes === totalPaginas || totalPaginas === 0;
}

btnPagMesAnterior.addEventListener('click', () => {
    if (paginaAtualMes > 1) {
        paginaAtualMes--;
        renderizarTabelaMes();
    }
});

btnPagMesProxima.addEventListener('click', () => {
    const totalPaginas = Math.ceil(paginacaoMes.children.length || 1);
    if (paginaAtualMes < totalPaginas) {
        paginaAtualMes++;
        renderizarTabelaMes();
    }
});

// --- Modal de Exclusão ---
const modalExclusao = document.getElementById('modal-exclusao');
const modalOverlay = document.getElementById('modal-overlay');
const modalMensagem = document.getElementById('modal-mensagem');
const modalCancelar = document.getElementById('modal-cancelar');
const modalConfirmar = document.getElementById('modal-confirmar');
let idExclusaoPendente = null;

function abrirModal(id) {
    idExclusaoPendente = id;
    const transacao = transacoes.find(t => t.id === id);
    modalMensagem.textContent = `Deseja excluir a transação "${escapeHtml(transacao?.descricao || '')}"?`;
    modalExclusao.classList.remove('hidden');
    modalExclusao.classList.add('flex');
    modalCancelar.focus();
}

function fecharModal() {
    const conteudo = modalExclusao.querySelector('div:last-child');
    modalExclusao.style.animation = 'modal-fade-out 0.2s ease-in forwards';
    conteudo.style.animation = 'modal-slide-down 0.25s ease-in forwards';
    setTimeout(() => {
        modalExclusao.style.animation = '';
        conteudo.style.animation = '';
        modalExclusao.classList.add('hidden');
        modalExclusao.classList.remove('flex');
        idExclusaoPendente = null;
    }, 250);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalExclusao.classList.contains('hidden')) {
        fecharModal();
    }
});

modalCancelar.addEventListener('click', fecharModal);
modalOverlay.addEventListener('click', fecharModal);

modalConfirmar.addEventListener('click', () => {
    if (idExclusaoPendente !== null) {
        transacoes = transacoes.filter(t => t.id !== idExclusaoPendente);
        if (paginaAtual > 1 && transacoes.length <= (paginaAtual - 1) * ITENS_POR_PAGINA) {
            paginaAtual--;
        }
        salvarTransacoes();
        popularFiltroAnoFluxo();
        popularFiltroAnoLista();
        renderizarTabela();
        renderizarTabelaMes();
        atualizarRelatorios();
        fecharModal();
        mostrarToast('Transação excluída!', 'erro');
    }
});

// --- Ações na Tabela (Editar/Excluir) ---
function adicionarEventosBotoesTabela() {
    document.querySelectorAll('.btn-excluir').forEach(botao => {
        botao.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            abrirModal(id);
        });
    });

    document.querySelectorAll('.btn-editar').forEach(botao => {
        botao.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const transacao = transacoes.find(t => t.id === id);
            if (transacao) {
                idEdicaoAtual = id;

                document.getElementById('operacao').value = transacao.operacao;
                document.getElementById('descricao').value = transacao.descricao;
                document.getElementById('valor').value = transacao.valor;
                document.getElementById('vencimento').value = transacao.vencimento;
                document.getElementById('parcela-corrente').value = transacao.parcela_corrente || 1;
                document.getElementById('total-parcelas').value = transacao.total_parcelas || 1;
                document.getElementById('status').value = transacao.status;
                document.getElementById('data-pagamento').value = transacao.data_pagamento || '';
                document.getElementById('metodo-pagamento').value = transacao.metodo_pagamento || '';

                if (selectCategoria.querySelector(`option[value="${transacao.categoria}"]`)) {
                    selectCategoria.value = transacao.categoria;
                } else {
                    const opcao = document.createElement('option');
                    opcao.value = transacao.categoria;
                    opcao.textContent = transacao.categoria;
                    selectCategoria.appendChild(opcao);
                    selectCategoria.value = transacao.categoria;
                }

                if (selectBanco.querySelector(`option[value="${transacao.banco}"]`)) {
                    selectBanco.value = transacao.banco;
                } else {
                    const opcao = document.createElement('option');
                    opcao.value = transacao.banco;
                    opcao.textContent = transacao.banco;
                    selectBanco.appendChild(opcao);
                    selectBanco.value = transacao.banco;
                }

                const btnSubmit = formTransacao.querySelector('button[type="submit"]');
                btnSubmit.textContent = 'Atualizar';
                btnSubmit.classList.remove('bg-primary');
                btnSubmit.classList.add('bg-tertiary');
                btnCancelarEdicao.classList.remove('hidden');

                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// --- Formulário ---
const inputDescricao = document.getElementById('descricao');
const inputValor = document.getElementById('valor');
const inputVencimento = document.getElementById('vencimento');

function limparErro(campo) {
    campo.classList.remove('border-red-500', 'dark:border-red-400');
    campo.classList.add('border-white/60', 'dark:border-[#444]');
}

function marcarErro(campo) {
    campo.classList.remove('border-white/60', 'dark:border-[#444]');
    campo.classList.add('border-red-500', 'dark:border-red-400');
}

inputDescricao.addEventListener('input', () => limparErro(inputDescricao));
inputValor.addEventListener('input', () => limparErro(inputValor));
inputVencimento.addEventListener('input', () => limparErro(inputVencimento));
selectCategoria.addEventListener('change', () => limparErro(selectCategoria));

formTransacao.addEventListener('submit', (e) => {
    e.preventDefault();

    const descricao = inputDescricao.value.trim();
    const valor = parseFloat(inputValor.value) || 0;
    const vencimento = inputVencimento.value;
    let valido = true;

    if (!descricao) {
        marcarErro(inputDescricao);
        valido = false;
    }

    if (valor <= 0) {
        marcarErro(inputValor);
        valido = false;
    }

    if (!vencimento) {
        marcarErro(inputVencimento);
        valido = false;
    }

    if (!selectCategoria.value) {
        marcarErro(selectCategoria);
        valido = false;
    }

    if (!valido) return;

    const dados = {
        operacao: document.getElementById('operacao').value,
        categoria: selectCategoria.value,
        descricao: descricao,
        valor: valor,
        vencimento: vencimento,
        parcela_corrente: parseInt(document.getElementById('parcela-corrente').value) || 1,
        total_parcelas: parseInt(document.getElementById('total-parcelas').value) || 1,
        status: document.getElementById('status').value,
        banco: selectBanco.value,
        data_pagamento: document.getElementById('data-pagamento').value,
        metodo_pagamento: document.getElementById('metodo-pagamento').value
    };

    if (idEdicaoAtual !== null) {
        const indice = transacoes.findIndex(t => t.id === idEdicaoAtual);
        if (indice !== -1) {
            dados.id = idEdicaoAtual;
            transacoes[indice] = dados;
        }
        idEdicaoAtual = null;

        const btnSubmit = formTransacao.querySelector('button[type="submit"]');
        btnSubmit.textContent = 'Cadastrar';
        btnSubmit.classList.remove('bg-tertiary');
        btnSubmit.classList.add('bg-primary');
        btnCancelarEdicao.classList.add('hidden');
        mostrarToast('Transação atualizada!');
    } else {
        dados.id = proximoId++;
        transacoes.unshift(dados);

        const totalParcelas = dados.total_parcelas;
        const parcelaCorrente = dados.parcela_corrente;
        if (totalParcelas > 1 && parcelaCorrente < totalParcelas) {
            for (let i = parcelaCorrente + 1; i <= totalParcelas; i++) {
                const parcela = {
                    ...dados,
                    id: proximoId++,
                    parcela_corrente: i,
                    vencimento: incrementarMes(dados.vencimento, i - parcelaCorrente),
                    status: 'Pendente',
                    data_pagamento: '',
                    metodo_pagamento: ''
                };
                transacoes.unshift(parcela);
            }
        }
        mostrarToast('Transação cadastrada!');
    }

    formTransacao.reset();
    document.getElementById('parcela-corrente').value = 1;
    document.getElementById('total-parcelas').value = 1;

    salvarTransacoes();
    popularFiltroAnoFluxo();
    popularFiltroAnoLista();
    renderizarTabela();
    renderizarTabelaMes();
    atualizarRelatorios();
});

// --- Cancelar Edição ---
btnCancelarEdicao.addEventListener('click', () => {
    idEdicaoAtual = null;
    formTransacao.reset();
    document.getElementById('parcela-corrente').value = 1;
    document.getElementById('total-parcelas').value = 1;
    const btnSubmit = formTransacao.querySelector('button[type="submit"]');
    btnSubmit.textContent = 'Cadastrar';
    btnSubmit.classList.remove('bg-tertiary');
    btnSubmit.classList.add('bg-primary');
    btnCancelarEdicao.classList.add('hidden');
});

// --- Relatórios ---
function calcularValorMensal(transacao) {
    return transacao.valor;
}

function extrairMesAno(dataStr) {
    if (!dataStr) return null;
    let partes;
    if (dataStr.includes('-')) {
        partes = dataStr.split('-');
        return { mes: parseInt(partes[1], 10) - 1, ano: parseInt(partes[0], 10) };
    } else if (dataStr.includes('/')) {
        partes = dataStr.split('/');
        return { mes: parseInt(partes[1], 10) - 1, ano: parseInt(partes[2], 10) };
    }
    return null;
}

function verificarAtrasadas() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let alterado = false;
    transacoes.forEach(t => {
        if (t.status !== 'Pendente') return;
        if (!t.vencimento) return;
        let dataVenc;
        if (t.vencimento.includes('-')) {
            const p = t.vencimento.split('-');
            dataVenc = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
        } else if (t.vencimento.includes('/')) {
            const p = t.vencimento.split('/');
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
}

function atualizarRelatorios() {
    try {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const receitasMes = transacoes
        .filter(t => {
            if (t.operacao !== 'Receita') return false;
            const d = extrairMesAno(t.vencimento);
            return d && d.mes === mesAtual && d.ano === anoAtual;
        })
        .reduce((soma, t) => soma + t.valor, 0);

    const despesasMes = transacoes
        .filter(t => {
            if (t.operacao !== 'Despesa') return false;
            const d = extrairMesAno(t.vencimento);
            return d && d.mes === mesAtual && d.ano === anoAtual;
        })
        .reduce((soma, t) => soma + t.valor, 0);

    const saldo = receitasMes - despesasMes;

    saldoTotal.textContent = formatarMoeda(saldo);
    totalReceitas.textContent = formatarMoeda(receitasMes);
    totalDespesas.textContent = formatarMoeda(despesasMes);

    saldoTotal.className = `text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-500'}`;

    const despesasPorCategoria = {};
    transacoes.filter(t => t.operacao === 'Despesa').forEach(t => {
        const valorMensal = calcularValorMensal(t);
        despesasPorCategoria[t.categoria] = (despesasPorCategoria[t.categoria] || 0) + valorMensal;
    });

    const totalDespesasCat = Object.values(despesasPorCategoria).reduce((soma, v) => soma + v, 0);
    if (totalDespesasCat > 0) {
        const categoriasOrdenadas = Object.entries(despesasPorCategoria).sort((a, b) => b[1] - a[1]);
        const maiorCategoria = categoriasOrdenadas[0];
        const porcentagem = Math.round((maiorCategoria[1] / totalDespesasCat) * 100);
        graficoPorcentagem.textContent = `${porcentagem}%`;

        const legendaCores = ['#FF5E3A', '#326578', '#8B7E66', '#bbd062', '#9ccee4', '#ffb59e', '#ffdbd0', '#c9a0dc', '#87ceeb', '#f0e68c'];
        const circ = 251.3274;
        const svgNS = 'http://www.w3.org/2000/svg';
        const cx = 50, cy = 50, raio = 40, raioExterno = 48;

        const antigas = graficoCategorias.querySelectorAll('.cor-categoria, .rotulo-externo, .linha-conectora');
        antigas.forEach(el => el.remove());

        let offset = 0;
        let legendaHTML = '';

        categoriasOrdenadas.forEach(([cat, valor], index) => {
            const porcent = (valor / totalDespesasCat) * 100;
            const cor = legendaCores[index % legendaCores.length];

            const path = document.createElementNS(svgNS, 'path');
            path.classList.add('cor-categoria');
            path.setAttribute('d', `M${cx} ${cy - raio} a ${raio} ${raio} 0 0 1 0 ${raio * 2} a ${raio} ${raio} 0 0 1 0 -${raio * 2}`);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', cor);
            path.setAttribute('stroke-width', '8');
            const visivel = (porcent / 100) * circ;
            path.setAttribute('stroke-dasharray', `${visivel} ${circ - visivel}`);
            path.setAttribute('stroke-dashoffset', `${-(offset / 100) * circ}`);
            graficoCategorias.insertBefore(path, graficoCategorias.querySelector('text'));

            const anguloInicio = (offset / 100) * 2 * Math.PI - Math.PI / 2;
            const anguloFim = ((offset + porcent) / 100) * 2 * Math.PI - Math.PI / 2;
            const anguloMeio = (anguloInicio + anguloFim) / 2;

            const xLabel = cx + raioExterno * Math.cos(anguloMeio);
            const yLabel = cy + raioExterno * Math.sin(anguloMeio);

            const xLinha = cx + (raio + 4) * Math.cos(anguloMeio);
            const yLinha = cy + (raio + 4) * Math.sin(anguloMeio);

            const linha = document.createElementNS(svgNS, 'line');
            linha.classList.add('linha-conectora');
            linha.setAttribute('x1', xLinha);
            linha.setAttribute('y1', yLinha);
            linha.setAttribute('x2', xLabel);
            linha.setAttribute('y2', yLabel);
            graficoCategorias.appendChild(linha);

            const texto = document.createElementNS(svgNS, 'text');
            texto.classList.add('rotulo-externo');
            texto.setAttribute('x', xLabel);
            texto.setAttribute('y', yLabel);
            texto.setAttribute('text-anchor', anguloMeio > -Math.PI / 2 && anguloMeio < Math.PI / 2 ? 'start' : 'end');
            texto.setAttribute('dominant-baseline', 'middle');
            texto.setAttribute('style', 'font-size:4px');
            texto.textContent = `${formatarMoedaCurto(valor)} (${porcent.toFixed(1)}%)`;
            graficoCategorias.appendChild(texto);

            legendaHTML += `<span class="legenda-item"><span class="legenda-cor" style="background:${cor}"></span>${escapeHtml(cat)} - ${escapeHtml(formatarMoedaCurto(valor))}</span>`;

            offset += porcent;
        });

        const legendaContainer = document.getElementById('legenda-categorias');
        if (legendaContainer) legendaContainer.innerHTML = legendaHTML;
    } else {
        graficoPorcentagem.textContent = '0%';
        graficoCategorias.querySelector('path').setAttribute('stroke-dasharray', '0, 100');
        const legendaContainer = document.getElementById('legenda-categorias');
        if (legendaContainer) legendaContainer.innerHTML = '';
    }

    renderizarGraficoFluxo();
    } catch (e) {
        console.error('Erro ao atualizar relatórios:', e);
    }
}

function renderizarGraficoFluxo() {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const anoSelecionado = parseInt(filtroAnoFluxo.value) || new Date().getFullYear();

    const receitasPorMes = new Array(12).fill(0);
    const despesasPorMes = new Array(12).fill(0);

    transacoes.forEach(t => {
        const d = extrairMesAno(t.vencimento);
        if (!d || d.ano !== anoSelecionado) return;
        const mes = d.mes;
        const valor = t.valor;
        if (t.operacao === 'Receita') {
            receitasPorMes[mes] += valor;
        } else {
            despesasPorMes[mes] += valor;
        }
    });

    const todosValores = [...receitasPorMes, ...despesasPorMes];
    const maxValor = Math.max(...todosValores, 1);

    const svgW = 700;
    const svgH = 280;
    const padTop = 20;
    const padBot = 40;
    const padLeft = 65;
    const padRight = 20;
    const chartW = svgW - padLeft - padRight;
    const chartH = svgH - padTop - padBot;

    function xPos(i) { return padLeft + (i / 11) * chartW; }
    function yPos(v) { return padTop + chartH - (v / maxValor) * chartH; }

    function gerarPontos(valores) {
        return valores.map((v, i) => ({ x: xPos(i), y: yPos(v) }));
    }

    function smoothPath(pontos) {
        if (pontos.length < 2) return '';
        let d = `M ${pontos[0].x} ${pontos[0].y}`;
        for (let i = 0; i < pontos.length - 1; i++) {
            const p0 = pontos[Math.max(i - 1, 0)];
            const p1 = pontos[i];
            const p2 = pontos[i + 1];
            const p3 = pontos[Math.min(i + 2, pontos.length - 1)];
            const tension = 0.3;
            const cp1x = p1.x + (p2.x - p0.x) * tension;
            const cp1y = p1.y + (p2.y - p0.y) * tension;
            const cp2x = p2.x - (p3.x - p1.x) * tension;
            const cp2y = p2.y - (p3.y - p1.y) * tension;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return d;
    }

    function areaPath(pontos) {
        const linePath = smoothPath(pontos);
        if (!linePath) return '';
        const baseY = padTop + chartH;
        return `${linePath} L ${pontos[pontos.length - 1].x} ${baseY} L ${pontos[0].x} ${baseY} Z`;
    }

    const pontosReceita = gerarPontos(receitasPorMes);
    const pontosDespesa = gerarPontos(despesasPorMes);
    const lineReceita = smoothPath(pontosReceita);
    const lineDespesa = smoothPath(pontosDespesa);
    const areaReceita = areaPath(pontosReceita);
    const areaDespesa = areaPath(pontosDespesa);

    let gridY = '';
    const numLinhas = 5;
    for (let i = 0; i <= numLinhas; i++) {
        const y = padTop + (i / numLinhas) * chartH;
        const val = maxValor - (i / numLinhas) * maxValor;
        gridY += `<line x1="${padLeft}" y1="${y}" x2="${svgW - padRight}" y2="${y}" stroke="currentColor" class="text-on-surface/5" stroke-width="1"/>`;
        gridY += `<text x="${padLeft - 10}" y="${y + 4}" text-anchor="end" class="fluxo-tooltip" style="font-size:10px">${formatarMoedaCurto(val)}</text>`;
    }

    let labelsX = '';
    meses.forEach((m, i) => {
        labelsX += `<text x="${xPos(i)}" y="${svgH - 10}" text-anchor="middle" class="fluxo-tooltip" style="font-size:10px">${m}</text>`;
    });

    function gerarDots(pontos, valores, cor) {
        let dots = '';
        pontos.forEach((p, i) => {
            if (valores[i] > 0) {
                dots += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${cor}" class="fluxo-dot">
                    <title>${meses[i]}: ${formatarMoeda(valores[i])}</title>
                </circle>`;
            }
        });
        return dots;
    }

    const svg = `
        <svg viewBox="0 0 ${svgW} ${svgH}" class="w-full h-auto" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="grad-receita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#4CAF50" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#4CAF50" stop-opacity="0.02"/>
                </linearGradient>
                <linearGradient id="grad-despesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#FF5E3A" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#FF5E3A" stop-opacity="0.02"/>
                </linearGradient>
            </defs>
            ${gridY}
            ${labelsX}
            <path d="${areaReceita}" class="fluxo-area-receita"/>
            <path d="${areaDespesa}" class="fluxo-area-despesa"/>
            <path d="${lineReceita}" class="fluxo-line fluxo-line-animada" stroke="#4CAF50"/>
            <path d="${lineDespesa}" class="fluxo-line fluxo-line-animada" stroke="#FF5E3A" style="animation-delay:0.2s"/>
            ${gerarDots(pontosReceita, receitasPorMes, '#4CAF50')}
            ${gerarDots(pontosDespesa, despesasPorMes, '#FF5E3A')}
        </svg>`;

    graficoFluxo.innerHTML = svg;
}

function formatarMoedaCurto(valor) {
    if (valoresOcultos) return '****';
    if (valor >= 1000000) return `R$ ${(valor / 1000000).toFixed(1)}M`;
    if (valor >= 1000) return `R$ ${(valor / 1000).toFixed(1)}k`;
    if (valor === 0) return 'R$ 0';
    if (valor < 10) return `R$ ${valor.toFixed(2)}`;
    return `R$ ${valor.toFixed(0)}`;
}

// --- Categorias Dinâmicas ---
function renderizarSelectCategorias() {
    const valorAtual = selectCategoria.value;
    selectCategoria.innerHTML = '';
    const opcaoVazia = document.createElement('option');
    opcaoVazia.value = '';
    opcaoVazia.textContent = 'Selecione a categoria';
    selectCategoria.appendChild(opcaoVazia);
    categorias.forEach(cat => {
        const opcao = document.createElement('option');
        opcao.value = cat;
        opcao.textContent = cat;
        if (cat === valorAtual) opcao.selected = true;
        selectCategoria.appendChild(opcao);
    });
}

function renderizarListaCategorias() {
    listaCategorias.innerHTML = '';
    categorias.forEach((cat, index) => {
        const item = document.createElement('li');
        item.className = 'flex items-center gap-2 bg-white/40 border border-white/60 rounded-full px-3 py-1 text-sm text-on-surface pill-animada';
        item.style.animationDelay = `${index * 30}ms`;
        item.innerHTML = `
            <span>${escapeHtml(cat)}</span>
            <button class="text-red-500 hover:text-red-700 text-xs btn-remover-categoria" data-index="${index}">&times;</button>
        `;
        listaCategorias.appendChild(item);
    });

    document.querySelectorAll('.btn-remover-categoria').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            categorias.splice(index, 1);
            renderizarSelectCategorias();
            renderizarListaCategorias();
            salvarCategorias();
        });
    });
}

btnAdicionarCategoria.addEventListener('click', () => {
    const novaCategoria = inputNovaCategoria.value.trim();
    if (novaCategoria && !categorias.includes(novaCategoria)) {
        categorias.push(novaCategoria);
        inputNovaCategoria.value = '';
        renderizarSelectCategorias();
        renderizarListaCategorias();
        salvarCategorias();
    }
});

inputNovaCategoria.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        btnAdicionarCategoria.click();
    }
});

// --- Bancos Dinâmicos ---
function renderizarSelectBancos() {
    const valorAtual = selectBanco.value;
    selectBanco.innerHTML = '';
    const opcaoVazia = document.createElement('option');
    opcaoVazia.value = '';
    opcaoVazia.textContent = 'Selecione o banco';
    selectBanco.appendChild(opcaoVazia);
    bancos.forEach(banco => {
        const opcao = document.createElement('option');
        opcao.value = banco;
        opcao.textContent = banco;
        if (banco === valorAtual) opcao.selected = true;
        selectBanco.appendChild(opcao);
    });
}

function renderizarListaBancos() {
    listaBancos.innerHTML = '';
    bancos.forEach((banco, index) => {
        const item = document.createElement('li');
        item.className = 'flex items-center gap-2 bg-white/40 border border-white/60 rounded-full px-3 py-1 text-sm text-on-surface pill-animada';
        item.style.animationDelay = `${index * 30}ms`;
        item.innerHTML = `
            <span>${escapeHtml(banco)}</span>
            <button class="text-red-500 hover:text-red-700 text-xs btn-remover-banco" data-index="${index}">&times;</button>
        `;
        listaBancos.appendChild(item);
    });

    document.querySelectorAll('.btn-remover-banco').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            bancos.splice(index, 1);
            renderizarSelectBancos();
            renderizarListaBancos();
            salvarBancos();
        });
    });
}

btnAdicionarBanco.addEventListener('click', () => {
    const novoBanco = inputNovoBanco.value.trim();
    if (novoBanco && !bancos.includes(novoBanco)) {
        bancos.push(novoBanco);
        inputNovoBanco.value = '';
        renderizarSelectBancos();
        renderizarListaBancos();
        salvarBancos();
    }
});

inputNovoBanco.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        btnAdicionarBanco.click();
    }
});

// --- Inicialização ---
if (isWebView) {
    EnviarParaCSharp('carregar_dados', {});
} else {
    renderizarSelectCategorias();
    renderizarListaCategorias();
    renderizarSelectBancos();
    renderizarListaBancos();
    renderizarTabela();
    renderizarTabelaMes();
    popularFiltroAnoFluxo();
    popularFiltroAnoLista();
    atualizarRelatorios();
}

// --- Navbar com indicador deslizante ---
const navLinks = document.querySelectorAll('.nav-link');
const navIndicator = document.getElementById('nav-indicator');

function atualizarIndicador(link) {
    const container = link.parentElement;
    const containerRect = container.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    navIndicator.style.width = linkRect.width + 'px';
    navIndicator.style.left = (linkRect.left - containerRect.left) + 'px';
}

function setLinkAtivo(link) {
    navLinks.forEach(l => {
        l.classList.remove('text-primary', 'font-bold');
        l.classList.add('text-on-surface-variant', 'font-medium');
    });
    link.classList.remove('text-on-surface-variant', 'font-medium');
    link.classList.add('text-primary', 'font-bold');
    atualizarIndicador(link);
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        setLinkAtivo(link);
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

if (navLinks.length > 0) {
    setTimeout(() => atualizarIndicador(navLinks[0]), 100);
}

const secoes = Array.from(navLinks).map(link => {
    const href = link.getAttribute('href');
    return { link, secao: document.querySelector(href) };
}).filter(s => s.secao);

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const item = secoes.find(s => s.secao === entry.target);
            if (item) setLinkAtivo(item.link);
        }
    });
}, { rootMargin: '-30% 0px -60% 0px' });

secoes.forEach(s => observer.observe(s.secao));

// --- Observer: Cards ao scroll ---
const observerCards = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visivel');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.card-secao').forEach(card => observerCards.observe(card));

window.addEventListener('resize', () => {
    const ativo = document.querySelector('.nav-link.text-primary');
    if (ativo) atualizarIndicador(ativo);
});

// --- Dropdown filtro Transações do Mês ---
const btnFiltroStatusMes = document.getElementById('btn-filtro-status-mes');
const dropdownFiltroMes = document.getElementById('dropdown-filtro-mes');

function abrirDropdown(el) {
    if (!el) return;
    el.classList.remove('hidden');
    el.style.animation = 'dropdown-in 0.15s ease-out forwards';
}

function fecharDropdown(el) {
    if (!el) return;
    el.style.animation = 'dropdown-out 0.15s ease-in forwards';
    setTimeout(() => { el.classList.add('hidden'); el.style.animation = ''; }, 150);
}

if (btnFiltroStatusMes) {
    btnFiltroStatusMes.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdownFiltroMes.classList.contains('hidden')) {
            abrirDropdown(dropdownFiltroMes);
        } else {
            fecharDropdown(dropdownFiltroMes);
        }
    });
}

document.querySelectorAll('.filtro-opcao-mes').forEach(btn => {
    btn.addEventListener('click', () => {
        filtroStatusMes = btn.dataset.filtro;
        paginaAtualMes = 1;
        fecharDropdown(dropdownFiltroMes);
        renderizarTabelaMes();
    });
});

document.addEventListener('click', () => {
    fecharDropdown(dropdownFiltroMes);
    fecharDropdown(dropdownFiltroLista);
});

// --- Dropdown filtro Lista de Transações ---
const btnFiltroStatusLista = document.getElementById('btn-filtro-status-lista');
const dropdownFiltroLista = document.getElementById('dropdown-filtro-lista');

if (btnFiltroStatusLista) {
    btnFiltroStatusLista.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdownFiltroLista.classList.contains('hidden')) {
            abrirDropdown(dropdownFiltroLista);
        } else {
            fecharDropdown(dropdownFiltroLista);
        }
    });
}

document.querySelectorAll('.filtro-opcao-lista').forEach(btn => {
    btn.addEventListener('click', () => {
        filtroStatusLista = btn.dataset.filtro;
        paginaAtual = 1;
        fecharDropdown(dropdownFiltroLista);
        renderizarTabela();
    });
});

// --- Ordenação Lista de Transações ---
const btnOrdVenc = document.getElementById('btn-ord-venc');

function atualizarBotaoVencimento() {
    if (!btnOrdVenc) return;
    const isDesc = ordenacaoLista === 'vencimento-desc';
    btnOrdVenc.dataset.dir = isDesc ? 'desc' : 'asc';
    btnOrdVenc.textContent = isDesc ? 'Vencimento ↓' : 'Vencimento ↑';
}

if (btnOrdVenc) {
    btnOrdVenc.addEventListener('click', () => {
        ordenacaoLista = ordenacaoLista === 'vencimento-desc' ? 'vencimento-asc' : 'vencimento-desc';
        paginaAtual = 1;
        atualizarBotaoVencimento();
        renderizarTabela();
    });
}

atualizarBotaoVencimento();

// --- Filtros Ano/Mês da Lista de Transações ---
const filtroAnoListaEl = document.getElementById('filtro-ano-lista');
const filtroMesListaEl = document.getElementById('filtro-mes-lista');

function popularFiltroAnoLista() {
    const anos = new Set();
    transacoes.forEach(t => {
        const d = extrairMesAno(t.vencimento);
        if (d) anos.add(d.ano);
    });
    if (anos.size === 0) anos.add(new Date().getFullYear());

    const valorAtual = filtroAnoLista;
    filtroAnoListaEl.innerHTML = '<option value="">Ano</option>';
    Array.from(anos).sort((a, b) => b - a).forEach(ano => {
        const opt = document.createElement('option');
        opt.value = ano;
        opt.textContent = ano;
        filtroAnoListaEl.appendChild(opt);
    });
    if (valorAtual && filtroAnoListaEl.querySelector(`option[value="${valorAtual}"]`)) {
        filtroAnoListaEl.value = valorAtual;
    } else {
        filtroAnoLista = '';
    }
}

function popularFiltroMesLista(ano) {
    const mesesDisponiveis = new Set();
    const nomesMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    transacoes.forEach(t => {
        const d = extrairMesAno(t.vencimento);
        if (d && d.ano == ano) mesesDisponiveis.add(d.mes);
    });

    const valorAtual = filtroMesLista;
    filtroMesListaEl.innerHTML = '<option value="">Mês</option>';
    Array.from(mesesDisponiveis).sort((a, b) => a - b).forEach(mes => {
        const opt = document.createElement('option');
        opt.value = mes;
        opt.textContent = nomesMeses[mes];
        filtroMesListaEl.appendChild(opt);
    });
    if (valorAtual !== '' && filtroMesListaEl.querySelector(`option[value="${valorAtual}"]`)) {
        filtroMesListaEl.value = valorAtual;
    } else {
        filtroMesLista = '';
    }
}

if (filtroAnoListaEl) {
    filtroAnoListaEl.addEventListener('change', () => {
        filtroAnoLista = filtroAnoListaEl.value;
        filtroMesLista = '';
        if (filtroAnoLista) {
            filtroMesListaEl.disabled = false;
            popularFiltroMesLista(filtroAnoLista);
        } else {
            filtroMesListaEl.disabled = true;
            filtroMesListaEl.innerHTML = '<option value="">Mês</option>';
        }
        paginaAtual = 1;
        renderizarTabela();
    });
}

if (filtroMesListaEl) {
    filtroMesListaEl.addEventListener('change', () => {
        filtroMesLista = filtroMesListaEl.value;
        paginaAtual = 1;
        renderizarTabela();
    });
}

// --- Filtro Ano do Gráfico Fluxo ---
function popularFiltroAnoFluxo() {
    const anos = new Set();
    transacoes.forEach(t => {
        if (!t.vencimento) return;
        let ano;
        if (t.vencimento.includes('-')) {
            ano = parseInt(t.vencimento.split('-')[0], 10);
        } else if (t.vencimento.includes('/')) {
            ano = parseInt(t.vencimento.split('/')[2], 10);
        }
        if (ano && !isNaN(ano)) anos.add(ano);
    });
    if (anos.size === 0) anos.add(new Date().getFullYear());

    const valorAtual = filtroAnoFluxo.value;
    filtroAnoFluxo.innerHTML = '';
    Array.from(anos).sort((a, b) => b - a).forEach(ano => {
        const opt = document.createElement('option');
        opt.value = ano;
        opt.textContent = ano;
        filtroAnoFluxo.appendChild(opt);
    });
    if (valorAtual && filtroAnoFluxo.querySelector(`option[value="${valorAtual}"]`)) {
        filtroAnoFluxo.value = valorAtual;
    }
}

popularFiltroAnoFluxo();
popularFiltroAnoLista();
filtroAnoFluxo.addEventListener('change', renderizarGraficoFluxo);

// --- Toggle Tema Dark/Light ---
const btnTema = document.getElementById('btn-tema');
const html = document.documentElement;

function aplicarTema(tema) {
    html.classList.remove('light', 'dark');
    html.classList.add(tema);
    localStorage.setItem('tema', tema);
    const icone = btnTema.querySelector('.material-symbols-outlined');
    btnTema.classList.add('tema-animando');
    setTimeout(() => {
        icone.textContent = tema === 'dark' ? 'light_mode' : 'dark_mode';
    }, 150);
    setTimeout(() => {
        btnTema.classList.remove('tema-animando');
    }, 400);
    if (graficoPorcentagem) {
        const texto = graficoPorcentagem.querySelector('text');
        if (texto) texto.style.fill = tema === 'dark' ? '#E0E0E0' : '#433D37';
    }
}

const temaSalvo = localStorage.getItem('tema');
if (temaSalvo) {
    aplicarTema(temaSalvo);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    aplicarTema('dark');
}

if (btnTema) {
    btnTema.addEventListener('click', () => {
        const atual = html.classList.contains('dark') ? 'light' : 'dark';
        aplicarTema(atual);
    });
}

// --- Toggle Ocultar/Mostrar Valores ---
const btnOcultarValores = document.getElementById('btn-ocultar-valores');
if (btnOcultarValores) {
    btnOcultarValores.addEventListener('click', () => {
        valoresOcultos = !valoresOcultos;
        const icone = btnOcultarValores.querySelector('.material-symbols-outlined');
        btnOcultarValores.classList.add('olho-animando');
        setTimeout(() => {
            icone.textContent = valoresOcultos ? 'visibility' : 'visibility_off';
        }, 150);
        setTimeout(() => {
            btnOcultarValores.classList.remove('olho-animando');
        }, 400);
        renderizarTabela();
        renderizarTabelaMes();
        atualizarRelatorios();
    });
}

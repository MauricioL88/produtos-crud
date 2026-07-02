window.App = window.App || {};

App.ITENS_POR_PAGINA = 5;
App.ITENS_POR_PAGINA_MES = 10;

App.CORES_STATUS = {
    Pago: 'bg-green-100/60 text-green-700',
    Pendente: 'bg-yellow-100/60 text-yellow-700',
    Atrasado: 'bg-red-100/60 text-red-700'
};

App.CORES_OPERACAO = {
    Despesa: 'text-red-500',
    Receita: 'text-green-600'
};

App.CORES_TOAST = {
    sucesso: 'bg-green-500/90 dark:bg-green-600/90',
    erro: 'bg-red-500/90 dark:bg-red-600/90',
    info: 'bg-primary/90'
};

App.ICONES_TOAST = {
    sucesso: 'check_circle',
    erro: 'error',
    info: 'info'
};

App.LEGENDA_CORES = [
    '#FF5E3A', '#326578', '#8B7E66', '#bbd062', '#9ccee4',
    '#ffb59e', '#ffdbd0', '#c9a0dc', '#87ceeb', '#f0e68c'
];

App.DEFAULTS = {
    categorias: ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Salário', 'Outros'],
    bancos: ['Nubank', 'Itaú', 'Inter', 'Outro'],
    metodosPagamento: ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Transferência']
};

window.App = window.App || {};

App.Helpers = {
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    formatarMoeda(valor, valoresOcultos) {
        if (valoresOcultos) return '****';
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    formatarMoedaCurto(valor, valoresOcultos) {
        if (valoresOcultos) return '****';
        if (valor >= 1000000) return `R$ ${(valor / 1000000).toFixed(1)}M`;
        if (valor >= 1000) return `R$ ${(valor / 1000).toFixed(1)}k`;
        if (valor === 0) return 'R$ 0';
        if (valor < 10) return `R$ ${valor.toFixed(2)}`;
        return `R$ ${valor.toFixed(0)}`;
    },

    formatarData(dataISO) {
        if (!dataISO) return '-';
        let limpo = dataISO.split('T')[0].split(' ')[0];
        const partes = limpo.split('-');
        if (partes.length !== 3) return dataISO;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    },

    incrementarMes(dataStr, meses) {
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
    },

    extrairMesAno(dataStr) {
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
    },

    obterClasseStatus(status) {
        switch (status) {
            case 'Pago': return 'bg-green-100/60 text-green-700';
            case 'Pendente': return 'bg-yellow-100/60 text-yellow-700';
            case 'Atrasado': return 'bg-red-100/60 text-red-700';
            default: return 'bg-gray-100/60 text-gray-700';
        }
    },

    obterCorOperacao(operacao) {
        return operacao === 'Despesa' ? 'text-red-500' : 'text-green-600';
    }
};

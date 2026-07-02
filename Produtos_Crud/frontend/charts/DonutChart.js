window.App = window.App || {};

App.DonutChart = {
    _STATUS_CORES: {
        Pago: '#4CAF50',
        Pendente: '#FFC107',
        Atrasado: '#FF5E3A'
    },

    renderizar(transacoes, valoresOcultos) {
        const graficoStatus = document.getElementById('grafico-status');
        const graficoPorcentagem = document.getElementById('grafico-status-porcentagem');
        if (!graficoStatus || !graficoPorcentagem) return;

        const filtroAno = document.getElementById('filtro-ano-status');
        const filtroMes = document.getElementById('filtro-mes-status');

        let filtradas = transacoes.filter(function(t) { return t.operacao === 'Despesa'; });
        if (filtroAno && filtroAno.value) {
            const ano = parseInt(filtroAno.value, 10);
            if (!isNaN(ano)) {
                filtradas = filtradas.filter(function(t) {
                    const d = App.Helpers.extrairMesAno(t.vencimento);
                    return d && d.ano === ano;
                });
                if (filtroMes && filtroMes.value !== '') {
                    const mes = parseInt(filtroMes.value, 10);
                    if (!isNaN(mes)) {
                        filtradas = filtradas.filter(function(t) {
                            const d = App.Helpers.extrairMesAno(t.vencimento);
                            return d && d.mes === mes;
                        });
                    }
                }
            }
        }

        const valoresPorStatus = {};
        filtradas.forEach(function(t) {
            const chave = t.status || 'Sem status';
            valoresPorStatus[chave] = (valoresPorStatus[chave] || 0) + Number(t.valor);
        });

        const totalGeral = Object.values(valoresPorStatus).reduce(function(soma, v) { return soma + v; }, 0);

        if (totalGeral > 0) {
            const isDark = document.documentElement.classList.contains('dark');
            const corTexto = isDark ? '#F5F5F5' : '#433D37';
            const corVariante = isDark ? '#D5D5D5' : '#7C7063';

            const statusOrdenados = Object.entries(valoresPorStatus).sort(function(a, b) { return b[1] - a[1]; });
            const maiorStatus = statusOrdenados[0];
            const porcentagem = Math.round((maiorStatus[1] / totalGeral) * 100);
            graficoPorcentagem.textContent = porcentagem + '%';
            graficoPorcentagem.setAttribute('fill', corTexto);

            const circ = 251.3274;
            const svgNS = 'http://www.w3.org/2000/svg';
            const cx = 50, cy = 50, raio = 40;

            const segmentosAntigos = graficoStatus.querySelectorAll('.cor-status');
            segmentosAntigos.forEach(function(el) { el.remove(); });

            let offset = 0;
            let legendaHTML = '';

            statusOrdenados.forEach(function(entry) {
                const status = entry[0];
                const valor = entry[1];
                const porcent = (valor / totalGeral) * 100;
                const cor = App.DonutChart._STATUS_CORES[status] || '#999';

                const path = document.createElementNS(svgNS, 'path');
                path.classList.add('cor-status');
                path.setAttribute('d', 'M' + cx + ' ' + (cy - raio) + ' a ' + raio + ' ' + raio + ' 0 0 1 0 ' + (raio * 2) + ' a ' + raio + ' ' + raio + ' 0 0 1 0 -' + (raio * 2));
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', cor);
                path.setAttribute('stroke-width', '8');
                const visivel = (porcent / 100) * circ;
                path.setAttribute('stroke-dasharray', visivel + ' ' + (circ - visivel));
                path.setAttribute('stroke-dashoffset', '' + (-(offset / 100) * circ));
                graficoStatus.insertBefore(path, graficoStatus.querySelector('text'));

                legendaHTML += '<div class="flex items-center gap-3 py-2 px-3 rounded-xl transition-colors">';
                legendaHTML += '<span class="w-4 h-4 rounded-full flex-shrink-0" style="background:' + cor + '"></span>';
                legendaHTML += '<span class="flex-1 min-w-0 text-sm font-medium truncate" style="color:' + corTexto + '">' + status + '</span>';
                legendaHTML += '<span class="text-sm font-bold whitespace-nowrap" style="color:' + corTexto + '">' + App.Helpers.formatarMoeda(valor, valoresOcultos) + '</span>';
                legendaHTML += '<span class="text-xs font-semibold whitespace-nowrap" style="color:' + corVariante + '">' + porcent.toFixed(1) + '%</span>';
                legendaHTML += '</div>';

                offset += porcent;
            });

            const legendaContainer = document.getElementById('legenda-status');
            if (legendaContainer) legendaContainer.innerHTML = legendaHTML;
        } else {
            graficoPorcentagem.textContent = '0%';
            graficoPorcentagem.setAttribute('fill', '#7C7063');
            const pathBase = graficoStatus.querySelector('path');
            if (pathBase) pathBase.setAttribute('stroke-dasharray', '0, 100');
            const legendaContainer = document.getElementById('legenda-status');
            if (legendaContainer) legendaContainer.innerHTML = '';
        }
    }
};

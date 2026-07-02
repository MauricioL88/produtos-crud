window.App = window.App || {};

App.PieChart = {
    renderizar(transacoes, valoresOcultos) {
        const graficoCategorias = document.getElementById('grafico-categorias');
        const graficoPorcentagem = document.getElementById('grafico-porcentagem');
        if (!graficoCategorias || !graficoPorcentagem) return;

        const valoresPorCategoria = {};
        transacoes.forEach(t => {
            valoresPorCategoria[t.categoria] = (valoresPorCategoria[t.categoria] || 0) + t.valor;
        });

        const totalGeral = Object.values(valoresPorCategoria).reduce((soma, v) => soma + v, 0);

        if (totalGeral > 0) {
            const isDark = document.documentElement.classList.contains('dark');
            const corTexto = isDark ? '#F5F5F5' : '#433D37';
            const corVariante = isDark ? '#D5D5D5' : '#7C7063';

            const categoriasOrdenadas = Object.entries(valoresPorCategoria).sort((a, b) => b[1] - a[1]);
            const maiorCategoria = categoriasOrdenadas[0];
            const porcentagem = Math.round((maiorCategoria[1] / totalGeral) * 100);
            graficoPorcentagem.textContent = porcentagem + '%';
            graficoPorcentagem.setAttribute('fill', corTexto);

            const circ = 251.3274;
            const svgNS = 'http://www.w3.org/2000/svg';
            const cx = 50, cy = 50, raio = 40;

            const antigas = graficoCategorias.querySelectorAll('.cor-categoria');
            antigas.forEach(el => el.remove());

            let offset = 0;
            let legendaHTML = '';

            categoriasOrdenadas.forEach(([cat, valor], index) => {
                const porcent = (valor / totalGeral) * 100;
                const cor = App.LEGENDA_CORES[index % App.LEGENDA_CORES.length];

                const path = document.createElementNS(svgNS, 'path');
                path.classList.add('cor-categoria');
                path.setAttribute('d', 'M' + cx + ' ' + (cy - raio) + ' a ' + raio + ' ' + raio + ' 0 0 1 0 ' + (raio * 2) + ' a ' + raio + ' ' + raio + ' 0 0 1 0 -' + (raio * 2));
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', cor);
                path.setAttribute('stroke-width', '8');
                const visivel = (porcent / 100) * circ;
                path.setAttribute('stroke-dasharray', visivel + ' ' + (circ - visivel));
                path.setAttribute('stroke-dashoffset', '' + (-(offset / 100) * circ));
                graficoCategorias.insertBefore(path, graficoCategorias.querySelector('text'));

                legendaHTML += '<div class="flex items-center gap-3 py-2 px-3 rounded-xl transition-colors">';
                legendaHTML += '<span class="w-4 h-4 rounded-full flex-shrink-0" style="background:' + cor + '"></span>';
                legendaHTML += '<span class="flex-1 min-w-0 text-sm font-medium truncate" style="color:' + corTexto + '">' + App.Helpers.escapeHtml(cat) + '</span>';
                legendaHTML += '<span class="text-sm font-bold whitespace-nowrap" style="color:' + corTexto + '">' + App.Helpers.formatarMoeda(valor, valoresOcultos) + '</span>';
                legendaHTML += '<span class="text-xs font-semibold whitespace-nowrap" style="color:' + corVariante + '">' + porcent.toFixed(1) + '%</span>';
                legendaHTML += '</div>';

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
    }
};

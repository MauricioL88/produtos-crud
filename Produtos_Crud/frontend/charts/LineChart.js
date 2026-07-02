window.App = window.App || {};

App.LineChart = {
    renderizar(transacoes, valoresOcultos) {
        const graficoFluxo = document.getElementById('grafico-fluxo');
        const filtroAnoFluxo = document.getElementById('filtro-ano-fluxo');
        if (!graficoFluxo || !filtroAnoFluxo) return;

        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const anoSelecionado = parseInt(filtroAnoFluxo.value) || new Date().getFullYear();

        const receitasPorMes = new Array(12).fill(0);
        const despesasPorMes = new Array(12).fill(0);

        transacoes.forEach(t => {
            const d = App.Helpers.extrairMesAno(t.vencimento);
            if (!d || d.ano !== anoSelecionado) return;
            if (t.operacao === 'Receita') {
                receitasPorMes[d.mes] += t.valor;
            } else {
                despesasPorMes[d.mes] += t.valor;
            }
        });

        const todosValores = receitasPorMes.concat(despesasPorMes);
        const maxValor = Math.max.apply(null, todosValores.concat([1]));

        const svgW = 700, svgH = 280;
        const padTop = 20, padBot = 40, padLeft = 65, padRight = 20;
        const chartW = svgW - padLeft - padRight;
        const chartH = svgH - padTop - padBot;

        function xPos(i) { return padLeft + (i / 11) * chartW; }
        function yPos(v) { return padTop + chartH - (v / maxValor) * chartH; }

        function gerarPontos(valores) {
            return valores.map((v, i) => ({ x: xPos(i), y: yPos(v) }));
        }

        function smoothPath(pontos) {
            if (pontos.length < 2) return '';
            let d = 'M ' + pontos[0].x + ' ' + pontos[0].y;
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
                d += ' C ' + cp1x + ' ' + cp1y + ', ' + cp2x + ' ' + cp2y + ', ' + p2.x + ' ' + p2.y;
            }
            return d;
        }

        function areaPath(pontos) {
            const linePath = smoothPath(pontos);
            if (!linePath) return '';
            const baseY = padTop + chartH;
            return linePath + ' L ' + pontos[pontos.length - 1].x + ' ' + baseY + ' L ' + pontos[0].x + ' ' + baseY + ' Z';
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
            gridY += '<line x1="' + padLeft + '" y1="' + y + '" x2="' + (svgW - padRight) + '" y2="' + y + '" stroke="currentColor" class="text-on-surface/5" stroke-width="1"/>';
            gridY += '<text x="' + (padLeft - 10) + '" y="' + (y + 4) + '" text-anchor="end" class="fluxo-tooltip" style="font-size:10px">' + App.Helpers.formatarMoedaCurto(val, valoresOcultos) + '</text>';
        }

        let labelsX = '';
        meses.forEach((m, i) => {
            labelsX += '<text x="' + xPos(i) + '" y="' + (svgH - 10) + '" text-anchor="middle" class="fluxo-tooltip" style="font-size:10px">' + m + '</text>';
        });

        function gerarDots(pontos, valores, cor) {
            let dots = '';
            pontos.forEach((p, i) => {
                if (valores[i] > 0) {
                    dots += '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="' + cor + '" class="fluxo-dot"><title>' + meses[i] + ': ' + App.Helpers.formatarMoeda(valores[i], valoresOcultos) + '</title></circle>';
                }
            });
            return dots;
        }

        graficoFluxo.innerHTML = '<svg viewBox="0 0 ' + svgW + ' ' + svgH + '" class="w-full h-auto" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="grad-receita" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4CAF50" stop-opacity="0.4"/><stop offset="100%" stop-color="#4CAF50" stop-opacity="0.02"/></linearGradient><linearGradient id="grad-despesa" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FF5E3A" stop-opacity="0.4"/><stop offset="100%" stop-color="#FF5E3A" stop-opacity="0.02"/></linearGradient></defs>' + gridY + labelsX + '<path d="' + areaReceita + '" class="fluxo-area-receita"/><path d="' + areaDespesa + '" class="fluxo-area-despesa"/><path d="' + lineReceita + '" class="fluxo-line fluxo-line-animada" stroke="#4CAF50"/><path d="' + lineDespesa + '" class="fluxo-line fluxo-line-animada" stroke="#FF5E3A" style="animation-delay:0.2s"/>' + gerarDots(pontosReceita, receitasPorMes, '#4CAF50') + gerarDots(pontosDespesa, despesasPorMes, '#FF5E3A') + '</svg>';
    }
};

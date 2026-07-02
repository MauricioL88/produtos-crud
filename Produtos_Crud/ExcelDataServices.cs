using System;
using System.Collections.Generic;
using System.Linq;
using Excel = Microsoft.Office.Interop.Excel;
using Office = Microsoft.Office.Core;

namespace Produtos_Crud
{
    public class TransacaoFinanceira
    {
        public int Id { get; set; }
        public string Operacao { get; set; }
        public string Categoria { get; set; }
        public string Descricao { get; set; }
        public double Valor { get; set; }
        public string Vencimento { get; set; }
        public int ParcelaCorrente { get; set; }
        public int TotalParcelas { get; set; }
        public string Status { get; set; }
        public string Banco { get; set; }
        public string DataPagamento { get; set; }
        public string MetodoPagamento { get; set; }
    }

    public static class ExcelDataServices
    {
        private const string ABA_TRANSACOES = "Transacoes";
        private const string ABA_CATEGORIAS = "Categorias";
        private const string ABA_BANCOS = "Bancos";
        private const string ABA_METODOS_PAGAMENTO = "MetodosPagamento";

        private static string FormatarData(object valor)
        {
            if (valor == null) return "";
            string texto = valor.ToString();
            int indiceT = texto.IndexOf('T');
            if (indiceT > 0) return texto.Substring(0, indiceT);
            int indiceEspaco = texto.IndexOf(' ');
            return indiceEspaco > 0 ? texto.Substring(0, indiceEspaco) : texto;
        }

        public static Excel.Worksheet ObterOuCriarAba(Excel.Workbook workbook, string nomeAba)
        {
            Excel.Worksheet aba = null;
            try
            {
                aba = workbook.Sheets[nomeAba] as Excel.Worksheet;
            }
            catch { }

            if (aba == null)
            {
                aba = workbook.Sheets.Add(Type.Missing, workbook.Sheets[workbook.Sheets.Count]) as Excel.Worksheet;
                aba.Name = nomeAba;
            }

            return aba;
        }

        public static void InicializarPlanilha(Excel.Workbook workbook)
        {
            InicializarAbaTransacoes(workbook);
            InicializarAbaCategorias(workbook);
            InicializarAbaBancos(workbook);
            InicializarAbaMetodosPagamento(workbook);
        }

        private static void InicializarAbaTransacoes(Excel.Workbook workbook)
        {
            Excel.Worksheet aba = ObterOuCriarAba(workbook, ABA_TRANSACOES);

            if (aba.Cells[1, 1].Value == null)
            {
                string[] cabecalhos = {
                    "ID", "Operacao", "Categoria", "Descricao", "Valor",
                    "Vencimento", "Parcela Corrente", "Total Parcelas",
                    "Status", "Banco", "Data Pagamento", "Metodo Pagamento"
                };

                for (int i = 0; i < cabecalhos.Length; i++)
                {
                    aba.Cells[1, i + 1].Value = cabecalhos[i];
                    aba.Cells[1, i + 1].Font.Bold = true;
                }

                aba.Columns.AutoFit();
            }
        }

        private static void InicializarAbaCategorias(Excel.Workbook workbook)
        {
            Excel.Worksheet aba = ObterOuCriarAba(workbook, ABA_CATEGORIAS);

            if (aba.Cells[1, 1].Value == null)
            {
                aba.Cells[1, 1].Value = "Categoria";
                aba.Cells[1, 1].Font.Bold = true;

                string[] categoriasDefault = { "Moradia", "Alimentação", "Transporte", "Lazer", "Saúde", "Salário", "Outros" };
                for (int i = 0; i < categoriasDefault.Length; i++)
                {
                    aba.Cells[i + 2, 1].Value = categoriasDefault[i];
                }

                aba.Columns.AutoFit();
            }
        }

        private static void InicializarAbaBancos(Excel.Workbook workbook)
        {
            Excel.Worksheet aba = ObterOuCriarAba(workbook, ABA_BANCOS);

            if (aba.Cells[1, 1].Value == null)
            {
                aba.Cells[1, 1].Value = "Banco";
                aba.Cells[1, 1].Font.Bold = true;

                string[] bancosDefault = { "Nubank", "Itaú", "Inter", "Outro" };
                for (int i = 0; i < bancosDefault.Length; i++)
                {
                    aba.Cells[i + 2, 1].Value = bancosDefault[i];
                }

                aba.Columns.AutoFit();
            }
        }

        private static void InicializarAbaMetodosPagamento(Excel.Workbook workbook)
        {
            Excel.Worksheet aba = ObterOuCriarAba(workbook, ABA_METODOS_PAGAMENTO);

            if (aba.Cells[1, 1].Value == null)
            {
                aba.Cells[1, 1].Value = "Método de Pagamento";
                aba.Cells[1, 1].Font.Bold = true;

                string[] metodosDefault = { "Pix", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Transferência" };
                for (int i = 0; i < metodosDefault.Length; i++)
                {
                    aba.Cells[i + 2, 1].Value = metodosDefault[i];
                }

                aba.Columns.AutoFit();
            }
        }

        public static List<TransacaoFinanceira> LerTransacoes(Excel.Workbook workbook)
        {
            List<TransacaoFinanceira> transacoes = new List<TransacaoFinanceira>();
            Excel.Worksheet aba = ObterOuCriarAba(workbook, ABA_TRANSACOES);

            int ultimaLinha = ((Excel.Range)aba.UsedRange).Rows.Count;

            for (int i = 2; i <= ultimaLinha; i++)
            {
                if (aba.Cells[i, 1].Value == null) continue;

                transacoes.Add(new TransacaoFinanceira
                {
                    Id = Convert.ToInt32(aba.Cells[i, 1].Value),
                    Operacao = aba.Cells[i, 2].Value?.ToString() ?? "",
                    Categoria = aba.Cells[i, 3].Value?.ToString() ?? "",
                    Descricao = aba.Cells[i, 4].Value?.ToString() ?? "",
                    Valor = Convert.ToDouble(aba.Cells[i, 5].Value ?? 0),
                    Vencimento = FormatarData(aba.Cells[i, 6].Value),
                    ParcelaCorrente = Convert.ToInt32(aba.Cells[i, 7].Value ?? 1),
                    TotalParcelas = Convert.ToInt32(aba.Cells[i, 8].Value ?? 1),
                    Status = aba.Cells[i, 9].Value?.ToString() ?? "",
                    Banco = aba.Cells[i, 10].Value?.ToString() ?? "",
                    DataPagamento = aba.Cells[i, 11].Value?.ToString() ?? "",
                    MetodoPagamento = aba.Cells[i, 12].Value?.ToString() ?? ""
                });
            }

            return transacoes;
        }

        public static void SalvarTransacoes(Excel.Workbook workbook, List<TransacaoFinanceira> transacoes)
        {
            Excel.Worksheet aba = ObterOuCriarAba(workbook, ABA_TRANSACOES);

            int ultimaLinha = ((Excel.Range)aba.UsedRange).Rows.Count;
            if (ultimaLinha > 1)
            {
                aba.Range[aba.Cells[2, 1], aba.Cells[ultimaLinha, 12]].Clear();
            }

            for (int i = 0; i < transacoes.Count; i++)
            {
                int linha = i + 2;
                aba.Cells[linha, 1].Value = transacoes[i].Id;
                aba.Cells[linha, 2].Value = transacoes[i].Operacao;
                aba.Cells[linha, 3].Value = transacoes[i].Categoria;
                aba.Cells[linha, 4].Value = transacoes[i].Descricao;
                aba.Cells[linha, 5].Value = transacoes[i].Valor;
                aba.Cells[linha, 5].NumberFormat = "#,##0.00";
                aba.Cells[linha, 6].Value = transacoes[i].Vencimento;
                aba.Cells[linha, 7].Value = transacoes[i].ParcelaCorrente;
                aba.Cells[linha, 8].Value = transacoes[i].TotalParcelas;
                aba.Cells[linha, 9].Value = transacoes[i].Status;
                aba.Cells[linha, 10].Value = transacoes[i].Banco;
                aba.Cells[linha, 11].Value = transacoes[i].DataPagamento;
                aba.Cells[linha, 12].Value = transacoes[i].MetodoPagamento;
            }

            aba.Columns.AutoFit();
        }

        public static List<string> LerCategorias(Excel.Workbook workbook)
        {
            List<string> categorias = new List<string>();
            Excel.Worksheet aba = ObterOuCriarAba(workbook, ABA_CATEGORIAS);

            int ultimaLinha = ((Excel.Range)aba.UsedRange).Rows.Count;

            for (int i = 2; i <= ultimaLinha; i++)
            {
                if (aba.Cells[i, 1].Value != null)
                {
                    categorias.Add(aba.Cells[i, 1].Value.ToString());
                }
            }

            return categorias;
        }

        public static void SalvarCategorias(Excel.Workbook workbook, List<string> categorias)
        {
            Excel.Worksheet aba = ObterOuCriarAba(workbook, ABA_CATEGORIAS);

            int ultimaLinha = ((Excel.Range)aba.UsedRange).Rows.Count;
            if (ultimaLinha > 1)
            {
                aba.Range[aba.Cells[2, 1], aba.Cells[ultimaLinha, 1]].Clear();
            }

            for (int i = 0; i < categorias.Count; i++)
            {
                aba.Cells[i + 2, 1].Value = categorias[i];
            }

            aba.Columns.AutoFit();
        }

        public static List<string> LerBancos(Excel.Workbook workbook)
        {
            List<string> bancos = new List<string>();
            Excel.Worksheet aba = ObterOuCriarAba(workbook, ABA_BANCOS);

            int ultimaLinha = ((Excel.Range)aba.UsedRange).Rows.Count;

            for (int i = 2; i <= ultimaLinha; i++)
            {
                if (aba.Cells[i, 1].Value != null)
                {
                    bancos.Add(aba.Cells[i, 1].Value.ToString());
                }
            }

            return bancos;
        }

        public static void SalvarBancos(Excel.Workbook workbook, List<string> bancos)
        {
            Excel.Worksheet aba = ObterOuCriarAba(workbook, ABA_BANCOS);

            int ultimaLinha = ((Excel.Range)aba.UsedRange).Rows.Count;
            if (ultimaLinha > 1)
            {
                aba.Range[aba.Cells[2, 1], aba.Cells[ultimaLinha, 1]].Clear();
            }

            for (int i = 0; i < bancos.Count; i++)
            {
                aba.Cells[i + 2, 1].Value = bancos[i];
            }

            aba.Columns.AutoFit();
        }

        public static List<string> LerMetodosPagamento(Excel.Workbook workbook)
        {
            List<string> metodosPagamento = new List<string>();
            Excel.Worksheet aba = ObterOuCriarAba(workbook, ABA_METODOS_PAGAMENTO);

            int ultimaLinha = ((Excel.Range)aba.UsedRange).Rows.Count;

            for (int i = 2; i <= ultimaLinha; i++)
            {
                if (aba.Cells[i, 1].Value != null)
                {
                    metodosPagamento.Add(aba.Cells[i, 1].Value.ToString());
                }
            }

            return metodosPagamento;
        }

        public static void SalvarMetodosPagamento(Excel.Workbook workbook, List<string> metodosPagamento)
        {
            Excel.Worksheet aba = ObterOuCriarAba(workbook, ABA_METODOS_PAGAMENTO);

            int ultimaLinha = ((Excel.Range)aba.UsedRange).Rows.Count;
            if (ultimaLinha > 1)
            {
                aba.Range[aba.Cells[2, 1], aba.Cells[ultimaLinha, 1]].Clear();
            }

            for (int i = 0; i < metodosPagamento.Count; i++)
            {
                aba.Cells[i + 2, 1].Value = metodosPagamento[i];
            }

            aba.Columns.AutoFit();
        }
    }
}

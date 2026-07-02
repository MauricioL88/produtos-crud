using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Excel = Microsoft.Office.Interop.Excel;

namespace Produtos_Crud
{
    public partial class produtos_crud : Form
    {
        private bool dadosModificados = false;

        public produtos_crud()
        {
            InitializeComponent();
            this.Text = "Controle Financeiro";
            CarregarIcone();
            InicializarWebView2();
        }

        private void CarregarIcone()
        {
            try
            {
                string basePath = AppDomain.CurrentDomain.BaseDirectory;
                string icoPath = Path.Combine(basePath, "logo.ico");
                if (File.Exists(icoPath))
                {
                    this.Icon = new Icon(icoPath);
                    return;
                }

                icoPath = Path.Combine(basePath, "..", "logo.ico");
                if (File.Exists(icoPath))
                {
                    this.Icon = new Icon(icoPath);
                    return;
                }

                var assembly = System.Reflection.Assembly.GetExecutingAssembly();
                using (var stream = assembly.GetManifestResourceStream("Produtos_Crud.logo.ico"))
                {
                    if (stream != null)
                    {
                        this.Icon = new Icon(stream);
                    }
                }
            }
            catch { }
        }

        private async void InicializarWebView2()
        {
            try
            {
                string userDataFolder = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "Produtos_Crud_WebView2");
                CoreWebView2Environment env = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
                await webView21.EnsureCoreWebView2Async(env);

                webView21.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceived;

                string caminhoFrontend = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "frontend", "index.html");
                if (File.Exists(caminhoFrontend))
                {
                    webView21.CoreWebView2.Navigate("file:///" + caminhoFrontend.Replace("\\", "/"));
                }
                else
                {
                    MessageBox.Show("Arquivo frontend não encontrado: " + caminhoFrontend,
                        "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao inicializar WebView2:\n\n" + ex.ToString(),
                    "Erro WebView2", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void CoreWebView2_WebMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                string mensagem = e.WebMessageAsJson;
                ProcessarMensagemJavaScript(mensagem);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao processar mensagem: " + ex.Message,
                    "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void ProcessarMensagemJavaScript(string mensagem)
        {
            if (mensagem.Contains("\"acao\":\"salvar_transacoes\""))
            {
                var transacoes = ExtrairTransacoes(mensagem);
                SalvarDadosTransacoes(transacoes);
                dadosModificados = true;
                EnviarConfirmacao("transacoes_salvas");
            }
            else if (mensagem.Contains("\"acao\":\"salvar_categorias\""))
            {
                var categorias = ExtrairListaString(mensagem, "categorias");
                SalvarDadosCategorias(categorias);
                dadosModificados = true;
                EnviarConfirmacao("categorias_salvas");
            }
            else if (mensagem.Contains("\"acao\":\"salvar_bancos\""))
            {
                var bancos = ExtrairListaString(mensagem, "bancos");
                SalvarDadosBancos(bancos);
                dadosModificados = true;
                EnviarConfirmacao("bancos_salvos");
            }
            else if (mensagem.Contains("\"acao\":\"salvar_metodos_pagamento\""))
            {
                var metodosPagamento = ExtrairListaString(mensagem, "metodos_pagamento");
                SalvarDadosMetodosPagamento(metodosPagamento);
                dadosModificados = true;
                EnviarConfirmacao("metodos_pagamento_salvos");
            }
            else if (mensagem.Contains("\"acao\":\"carregar_dados\""))
            {
                EnviarDadosParaJavaScript();
            }
        }

        private void EnviarConfirmacao(string tipo)
        {
            webView21.CoreWebView2.PostWebMessageAsJson($"{{\"status\":\"ok\",\"tipo\":\"{tipo}\"}}");
        }

        private static string FormatarDataIso(string data)
        {
            if (string.IsNullOrEmpty(data)) return "";
            int indiceT = data.IndexOf('T');
            if (indiceT > 0) return data.Substring(0, indiceT);
            int indiceEspaco = data.IndexOf(' ');
            return indiceEspaco > 0 ? data.Substring(0, indiceEspaco) : data;
        }

        private List<TransacaoFinanceira> ExtrairTransacoes(string json)
        {
            var transacoes = new List<TransacaoFinanceira>();

            try
            {
                var linhas = json.Split(new[] { "\"transacoes\":[" }, StringSplitOptions.None);
                if (linhas.Length < 2) return transacoes;

                string arrayJson = linhas[1].TrimEnd('}');
                if (arrayJson.EndsWith("]")) arrayJson = arrayJson.Substring(0, arrayJson.Length - 1);

                var itens = arrayJson.Split(new[] { "},{" }, StringSplitOptions.None);

                foreach (var item in itens)
                {
                    var limpo = item.TrimStart('{').TrimEnd('}');
                    var campos = new Dictionary<string, string>();

                    var pares = limpo.Split(',');
                    foreach (var par in pares)
                    {
                        var partes = par.Split(new[] { "\":" }, StringSplitOptions.None);
                        if (partes.Length == 2)
                        {
                            string chave = partes[0].Trim('"').Trim();
                            string valor = partes[1].Trim('"').Trim();
                            campos[chave] = valor;
                        }
                    }

                    transacoes.Add(new TransacaoFinanceira
                    {
                        Id = campos.ContainsKey("id") ? int.Parse(campos["id"]) : 0,
                        Operacao = campos.ContainsKey("operacao") ? campos["operacao"] : "",
                        Categoria = campos.ContainsKey("categoria") ? campos["categoria"] : "",
                        Descricao = campos.ContainsKey("descricao") ? campos["descricao"] : "",
                        Valor = campos.ContainsKey("valor") ? double.Parse(campos["valor"].Replace(",", "."), System.Globalization.CultureInfo.InvariantCulture) : 0,
                        Vencimento = campos.ContainsKey("vencimento") ? campos["vencimento"] : "",
                        ParcelaCorrente = campos.ContainsKey("parcela_corrente") ? int.Parse(campos["parcela_corrente"]) : 1,
                        TotalParcelas = campos.ContainsKey("total_parcelas") ? int.Parse(campos["total_parcelas"]) : 1,
                        Status = campos.ContainsKey("status") ? campos["status"] : "",
                        Banco = campos.ContainsKey("banco") ? campos["banco"] : "",
                        DataPagamento = campos.ContainsKey("data_pagamento") ? campos["data_pagamento"] : "",
                        MetodoPagamento = campos.ContainsKey("metodo_pagamento") ? campos["metodo_pagamento"] : ""
                    });
                }
            }
            catch { }

            return transacoes;
        }

        private List<string> ExtrairListaString(string json, string nomeCampo)
        {
            var lista = new List<string>();
            try
            {
                string busca = $"\"{nomeCampo}\":[";
                int inicio = json.IndexOf(busca);
                if (inicio < 0) return lista;

                inicio += busca.Length;
                int fim = json.IndexOf("]", inicio);
                string conteudo = json.Substring(inicio, fim - inicio);

                var itens = conteudo.Split(',');
                foreach (var item in itens)
                {
                    string valor = item.Trim().Trim('"');
                    if (!string.IsNullOrEmpty(valor))
                    {
                        lista.Add(valor);
                    }
                }
            }
            catch { }

            return lista;
        }

        private void SalvarDadosTransacoes(List<TransacaoFinanceira> transacoes)
        {
            try
            {
                Excel.Workbook workbook = Globals.ThisWorkbook.InnerObject;
                ExcelDataServices.SalvarTransacoes(workbook, transacoes);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao salvar transações: " + ex.Message,
                    "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void SalvarDadosCategorias(List<string> categorias)
        {
            try
            {
                Excel.Workbook workbook = Globals.ThisWorkbook.InnerObject;
                ExcelDataServices.SalvarCategorias(workbook, categorias);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao salvar categorias: " + ex.Message,
                    "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void SalvarDadosBancos(List<string> bancos)
        {
            try
            {
                Excel.Workbook workbook = Globals.ThisWorkbook.InnerObject;
                ExcelDataServices.SalvarBancos(workbook, bancos);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao salvar bancos: " + ex.Message,
                    "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void SalvarDadosMetodosPagamento(List<string> metodosPagamento)
        {
            try
            {
                Excel.Workbook workbook = Globals.ThisWorkbook.InnerObject;
                ExcelDataServices.SalvarMetodosPagamento(workbook, metodosPagamento);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao salvar métodos de pagamento: " + ex.Message,
                    "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void EnviarDadosParaJavaScript()
        {
            try
            {
                Excel.Workbook workbook = Globals.ThisWorkbook.InnerObject;
                ExcelDataServices.InicializarPlanilha(workbook);

                var transacoes = ExcelDataServices.LerTransacoes(workbook);
                var categorias = ExcelDataServices.LerCategorias(workbook);
                var bancos = ExcelDataServices.LerBancos(workbook);
                var metodosPagamento = ExcelDataServices.LerMetodosPagamento(workbook);

                var sb = new StringBuilder();
                sb.Append("{");
                sb.Append("\"acao\":\"dados_carregados\",");

                sb.Append("\"transacoes\":[");
                for (int i = 0; i < transacoes.Count; i++)
                {
                    var t = transacoes[i];
                    if (i > 0) sb.Append(",");
                    sb.Append($"{{\"id\":{t.Id},\"operacao\":\"{t.Operacao}\",\"categoria\":\"{t.Categoria}\",\"descricao\":\"{t.Descricao}\",\"valor\":{t.Valor.ToString("F2", System.Globalization.CultureInfo.InvariantCulture)},\"vencimento\":\"{FormatarDataIso(t.Vencimento)}\",\"parcela_corrente\":{t.ParcelaCorrente},\"total_parcelas\":{t.TotalParcelas},\"status\":\"{t.Status}\",\"banco\":\"{t.Banco}\",\"data_pagamento\":\"{t.DataPagamento}\",\"metodo_pagamento\":\"{t.MetodoPagamento}\"}}");
                }
                sb.Append("],");

                sb.Append("\"categorias\":[");
                for (int i = 0; i < categorias.Count; i++)
                {
                    if (i > 0) sb.Append(",");
                    sb.Append($"\"{categorias[i]}\"");
                }
                sb.Append("],");

                sb.Append("\"bancos\":[");
                for (int i = 0; i < bancos.Count; i++)
                {
                    if (i > 0) sb.Append(",");
                    sb.Append($"\"{bancos[i]}\"");
                }
                sb.Append("],");

                sb.Append("\"metodos_pagamento\":[");
                for (int i = 0; i < metodosPagamento.Count; i++)
                {
                    if (i > 0) sb.Append(",");
                    sb.Append($"\"{metodosPagamento[i]}\"");
                }
                sb.Append("]");

                sb.Append("}");

                webView21.CoreWebView2.PostWebMessageAsJson(sb.ToString());
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao carregar dados: " + ex.Message,
                    "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (dadosModificados)
            {
                var resultado = MessageBox.Show(
                    "Há dados não salvos. Deseja salvar antes de fechar?",
                    "Salvar Alterações",
                    MessageBoxButtons.YesNoCancel,
                    MessageBoxIcon.Question);

                if (resultado == DialogResult.Yes)
                {
                    EnviarDadosParaJavaScript();
                }
                else if (resultado == DialogResult.Cancel)
                {
                    e.Cancel = true;
                    return;
                }
            }

            base.OnFormClosing(e);
        }
    }
}

using System;
using System.Data;
using System.Drawing;
using System.Windows.Forms;
using Microsoft.VisualStudio.Tools.Applications.Runtime;
using Excel = Microsoft.Office.Interop.Excel;
using Office = Microsoft.Office.Core;

namespace Produtos_Crud
{
    public partial class ThisWorkbook
    {
        private produtos_crud formControleFinanceiro;

        public void MostrarFormulario()
        {
            if (formControleFinanceiro == null || formControleFinanceiro.IsDisposed)
            {
                formControleFinanceiro = new produtos_crud();
            }
            formControleFinanceiro.Show();
            formControleFinanceiro.BringToFront();
        }

        private void ThisWorkbook_Startup(object sender, System.EventArgs e)
        {
            try
            {
                var btn = new Button();
                btn.Text = "Abrir Controle Financeiro";
                btn.Size = new Size(200, 40);
                btn.BackColor = Color.FromArgb(255, 94, 58);
                btn.ForeColor = Color.White;
                btn.FlatStyle = FlatStyle.Flat;
                btn.Font = new Font("Segoe UI", 10, FontStyle.Bold);
                btn.Cursor = Cursors.Hand;
                btn.Click += (s, ev) => MostrarFormulario();

                this.ActionsPane.Controls.Add(btn);
                this.ActionsPane.Visible = true;

                MostrarFormulario();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Erro ao iniciar Controle Financeiro: " + ex.Message,
                    "Erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void ThisWorkbook_Shutdown(object sender, System.EventArgs e)
        {
            if (formControleFinanceiro != null && !formControleFinanceiro.IsDisposed)
            {
                formControleFinanceiro.Close();
                formControleFinanceiro.Dispose();
            }
        }

        #region Código gerado pelo Designer VSTO

        /// <summary>
        /// Método necessário para suporte ao Designer - não modifique 
        /// o conteúdo deste método com o editor de código.
        /// </summary>
        private void InternalStartup()
        {
            this.Startup += new System.EventHandler(ThisWorkbook_Startup);
            this.Shutdown += new System.EventHandler(ThisWorkbook_Shutdown);
        }

        #endregion

    }
}

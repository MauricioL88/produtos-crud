# Controle Financeiro - VSTO Excel Add-in

<p align="center">
  <strong>Sistema de Controle Financeiro Pessoal integrado ao Microsoft Excel</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET-Framework%204.8-512BD4?style=flat&logo=dotnet" alt=".NET 4.8">
  <img src="https://img.shields.io/badge/VSTO-4.0-217346?style=flat&logo=microsoft-excel" alt="VSTO">
  <img src="https://img.shields.io/badge/WebView2-1.0-0078D4?style=flat" alt="WebView2">
  <img src="https://img.shields.io/badge/TailwindCSS-CDN-06B6D4?style=flat&logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Inno%20Setup-Installer-5A29E4?style=flat" alt="Inno Setup">
</p>

---

## O que é o projeto

O **Controle Financeiro** é um Add-in para Microsoft Excel desenvolvido com **VSTO (Visual Studio Tools for Office)** que permite gerenciar finanças pessoais diretamente dentro do Excel. A aplicação utiliza **WebView2** para renderizar uma interface web moderna (HTML/CSS/JavaScript) dentro de um formulário Windows Forms, persistindo todos os dados em abas da planilha Excel.

> **Por que Excel?** O arquivo `.xlsx` funciona como banco de dados, eliminando a necessidade de um servidor backend ou banco de dados externo.

---

## Funcionalidades

### Gestão de Transações (CRUD)
- **Cadastrar** transações com campos: operação (Despesa/Receita), categoria, descrição, valor, data de vencimento, parcelas, status, banco, data de pagamento e método de pagamento
- **Visualizar** transações do mês atual e lista completa com paginação
- **Editar** transações existentes com preenchimento automático do formulário
- **Excluir** transações com confirmação via modal

### Parcelamento Automático
- Ao cadastrar uma transação com múltiplas parcelas, o sistema gera automaticamente todas as parcelas futuras com datas incrementadas mensalmente

### Controle de Status
- Status automáticos: **Pendente**, **Pago**, **Atrasado**
- Transações com vencimento passado são marcadas automaticamente como "Atrasado"

### Categorias e Bancos
- Gerenciamento dinâmico de categorias (Moradia, Alimentação, Transporte, Lazer, Saúde, Salário, Outros)
- Gerenciamento de bancos (Nubank, Itaú, Inter, Outro)
- Adição e remoção de opções diretamente na interface

### Relatórios e Gráficos
- **Resumo Mensal** — Saldo total, receitas e despesas do mês
- **Gráfico de Rosca** — Distribuição de despesas por categoria
- **Gráfico de Linha** — Fluxo de caixa dos últimos 12 meses com animação SVG

### Interface Moderna
- **Tema Dark/Light** — Toggle com persistência em localStorage
- **Ocultar Valores** — Toggle de privacidade que mascara valores monetários
- **Busca Global** — Pesquisa debounced por descrição, categoria, banco, status
- **Filtros** — Por ano, mês e status (Todos/Pagos/Pendentes/Atrasados)
- **Ordenação** — Por data de vencimento (crescente/decrescente)
- **Animações** — Glassmorphism, scroll animations, toast notifications, navegação suave

---

## Arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
│                     ARQUITETURA DO SISTEMA                       │
│                                                                  │
│  ┌─────────────┐    WebView2 Message Bus    ┌──────────────────┐ │
│  │  Frontend    │◄─────────────────────────►│  Backend C#      │ │
│  │  (HTML/JS)   │  postMessage / onmessage  │  (WinForms+VSTO) │ │
│  └─────────────┘                            └────────┬─────────┘ │
│                                                      │           │
│                                               Excel Interop API  │
│                                                      │           │
│                                              ┌───────▼────────┐  │
│                                              │  Planilha Excel │  │
│                                              │  (.xlsx)        │  │
│                                              │                 │  │
│                                              │  Aba: Transacoes│  │
│                                              │  Aba: Categorias│  │
│                                              │  Aba: Bancos    │  │
│                                              └─────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

| Operação | Caminho |
|----------|---------|
| **Leitura** | Excel → `ExcelDataServices` → JSON serializado → WebView2 → JavaScript |
| **Escrita** | JavaScript → `postMessage` → C# parse JSON → `ExcelDataServices` → Excel |

> **Nota:** Toda operação de save reescreve a aba inteira (clear + rewrite), garantindo sincronização completa entre a UI e o arquivo Excel.

---

## Estrutura do Projeto

```
Produtos_Crud/
├── Produtos_Crud.slnx                    # Arquivo de solução
├── Produtos_Crud/                        # Projeto principal
│   ├── Produtos_Crud.csproj             # Arquivo do projeto (.NET 4.8)
│   ├── packages.config                  # Pacotes NuGet (WebView2)
│   ├── Produtos_Crud.xlsx              # Planilha Excel (host do add-in)
│   │
│   ├── ExcelDataServices.cs            # Camada de dados (leitura/escrita Excel)
│   ├── ThisWorkbook.cs                 # Ponto de entrada do add-in
│   ├── produtos_crud.cs                # Form WinForms com WebView2
│   ├── produtos_crud.Designer.cs       # Layout do formulário
│   │
│   ├── frontend/                       # Interface web (SPA)
│   │   ├── index.html                  # Página principal
│   │   ├── main.js                     # Lógica da aplicação (~1400 linhas)
│   │   └── style.css                   # Estilos customizados
│   │
│   ├── Properties/                     # Metadados do assembly
│   │   └── AssemblyInfo.cs
│   │
│   └── Controle_Financeiro_Setup.iss   # Script do instalador Inno Setup
│
└── Output/                             # Saída do instalador
```

### Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `ExcelDataServices.cs` | Camada de dados — leitura e escrita nas abas do Excel via COM Interop |
| `ThisWorkbook.cs` | Inicialização do add-in — cria botão no Actions Pane e abre o formulário |
| `produtos_crud.cs` | Formulário WinForms — hospeda o WebView2 e gerencia comunicação bidirecional |
| `frontend/index.html` | Interface SPA — formulários, tabelas, gráficos e relatórios |
| `frontend/main.js` | Lógica do frontend — CRUD, paginação, filtros, gráficos SVG, tema |
| `frontend/style.css` | Estilos customizados — glassmorphism, animações, dark mode |
| `Controle_Financeiro_Setup.iss` | Instalador Windows — registra o add-in no Excel |

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Runtime | .NET Framework | 4.8 |
| Add-in | VSTO | 4.0 (Office 15.0) |
| Excel Interop | Microsoft.Office.Interop.Excel | COM Interop |
| UI Desktop | Windows Forms + WebView2 | 1.0.4022.49 |
| CSS Framework | Tailwind CSS | CDN |
| Ícones | Material Symbols Outlined | Google Fonts |
| Fonte | Plus Jakarta Sans | Google Fonts |
| Frontend | JavaScript Vanilla (ES6+) | — |
| Instalador | Inno Setup | — |

---

## Pré-requisitos

- **Visual Studio 2022+** com carga de trabalho "Office/SharePoint Development"
- **Microsoft Excel** (qualquer versão recente, x86 ou x64)
- **.NET Framework 4.8** targeting pack
- **VSTO Runtime 4.0**
- **WebView2 Runtime** (instalado automaticamente no Windows 10/11)

---

## Como Compilar e Executar

### Via Visual Studio

1. Clone o repositório
2. Abra `Produtos_Crud.slnx` no Visual Studio
3. Restaure os pacotes NuGet
4. Build → **Ctrl+Shift+B**
5. Pressione **F5** para depurar (abre o Excel com o add-in carregado)

### Gerar Instalador

1. Build o projeto em modo **Release**
2. Abra `Controle_Financeiro_Setup.iss` no **Inno Setup Compiler**
3. Compile o script
4. O executável `Controle_Financeiro_Setup.exe` será gerado na pasta `Output/`

### Usar o Instalador

1. Execute `Controle_Financeiro_Setup.exe`
2. Se o Excel estiver aberto, será exibido um aviso para fechá-lo
3. Após a instalação, o add-in é registrado e carrega automaticamente ao abrir o Excel
4. Um atalho "Abrir Controle Financeiro" é criado no Menu Iniciar

---

## Como Usar

1. **Abra o Excel** — o add-in carrega automaticamente
2. Clique em **"Abrir Controle Financeiro"** no painel lateral ou no Menu Iniciar
3. A interface web será exibida com as seguintes seções:
   - **Cadastrar Transação** — Formulário para criar/editar transações
   - **Transações do Mês** — Visualização do mês atual com filtros
   - **Lista de Transações** — Lista completa com busca e paginação
   - **Cadastrar Opções** — Gerenciar categorias e bancos
   - **Relatórios** — Dashboard com gráficos e resumos

---

## Notas Técnicas

- **Persistência em Excel** — Todas as abas ("Transacoes", "Categorias", "Bancos") são criadas dinamicamente no arquivo `.xlsx`
- **Comunicação WebView2** — Utiliza `postMessage` / `onmessage` para ponte C# ↔ JavaScript
- **Sem Backend Externo** — Não utiliza banco de dados, API ou servidor. O próprio arquivo Excel é o armazenamento
- **Parsing Manual de JSON** — O lado C# serializa e parseia JSON manualmente (sem biblioteca externa)
- **Chave de Assinatura** — Utiliza chave temporária (`.pfx`) para deploy VSTO; substituir por certificado válido para produção

---

## Licença

Copyright © 2026 mLabs. Todos os direitos reservados.

---

## Autor

**MLisboa88 / mLabs**

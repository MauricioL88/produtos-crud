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

### Categorias, Bancos e Métodos de Pagamento
- Gerenciamento dinâmico de categorias (Moradia, Alimentação, Transporte, Lazer, Saúde, Salário, Outros)
- Gerenciamento de bancos (Nubank, Itaú, Inter, Outro)
- Gerenciamento de métodos de pagamento (Pix, Cartão de Crédito, Cartão de Débito, Boleto, Transferência)
- Adição e remoção de opções diretamente na interface

### Relatórios e Gráficos
- **Resumo Mensal** — Saldo total, receitas e despesas do mês
- **Cards de Resumo (Mobile)** — Pagamentos da semana, transações pagas e a pagar no mês com atualização dinâmica
- **Gráfico de Rosca** — Distribuição de despesas por categoria (com filtros por ano/mês)
- **Gráfico de Rosca por Status** — Distribuição de despesas por status (Pago/Pendente/Atrasado, com filtros por ano/mês)
- **Gráfico de Linha** — Fluxo de caixa dos últimos 12 meses com animação SVG

### Interface Moderna
- **Tema Dark/Light** — Toggle com persistência em localStorage
- **Ocultar Valores** — Toggle de privacidade que mascara valores monetários
- **Busca Global** — Pesquisa debounced (300ms) por descrição, categoria, banco, status, método de pagamento
- **Filtros** — Por ano, mês e status (Todos/Pagos/Pendentes/Atrasados)
- **Ordenação** — Por data de vencimento (crescente/decrescente)
- **Paginação em Grupos** — Navegação entre grupos de páginas com botões `<<` e `>>`
- **Cursor Personalizado** — Indicador visual animado que acompanha o mouse
- **Navegação Mobile** — Bottom navigation adaptável com suporte a `safe-area-inset-bottom`
- **Animações** — Glassmorphism, scroll reveal (IntersectionObserver), toast notifications, navegação suave

---

## Arquitetura

```
┌──────────────────────────────────────────────────────────────────────┐
│                       ARQUITETURA DO SISTEMA                         │
│                                                                      │
│  ┌─────────────────────┐  WebView2 Message Bus  ┌──────────────────┐│
│  │  Frontend (SPA)     │◄──────────────────────►│  Backend C#      ││
│  │                     │  postMessage/onmessage  │  (WinForms+VSTO) ││
│  │  ┌───────────────┐  │                         │                  ││
│  │  │ sections/*.js │  │                         │  produtos_crud  ││
│  │  │ components/*. │  │                         │  .cs (bridge)   ││
│  │  │ charts/*.js   │──┤                         │        │        ││
│  │  └───────┬───────┘  │                         │        │        ││
│  │          │ state.js │                         │ ExcelDataServices│
│  │          │ webview  │                         │  .cs (CRUD)     ││
│  │          │ .js      │                         │        │        ││
│  │  index.html,style   │                         │ Excel Interop   ││
│  │  .css, main.js      │                         │        │        ││
│  └─────────────────────┘                         └────────┼─────────┘│
│                                                           │          │
│                                                   ┌───────▼────────┐ │
│                                                   │  Planilha Excel │ │
│                                                   │  (.xlsx)        │ │
│                                                   │                 │ │
│                                                   │  Aba: Transacoes│ │
│                                                   │  Aba: Categorias│ │
│                                                   │  Aba: Bancos    │ │
│                                                   │  Aba: MetodosPag│ │
│                                                   └─────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
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
│   ├── logo.ico                        # Ícone da aplicação
│   │
│   ├── ExcelDataServices.cs            # Camada de dados (leitura/escrita Excel)
│   ├── ThisWorkbook.cs                 # Ponto de entrada do add-in
│   ├── ThisWorkbook.Designer.cs        # Designer VSTO
│   ├── produtos_crud.cs                # Form WinForms com WebView2
│   ├── produtos_crud.Designer.cs       # Layout do formulário
│   ├── Planilha1.cs                    # Host item da planilha
│   │
│   ├── frontend/                       # Interface web (SPA modular)
│   │   ├── index.html                  # Página principal
│   │   ├── main.js                     # Bootstrap e orquestração
│   │   ├── style.css                   # Estilos customizados
│   │   ├── assets/
│   │   │   └── logo.svg                # Favicon SVG
│   │   ├── config/
│   │   │   └── constants.js            # Constantes (cores, defaults, paginação)
│   │   ├── utils/
│   │   │   └── helpers.js              # Funções utilitárias (formatação)
│   │   ├── services/
│   │   │   ├── state.js                # Gerenciamento de estado (Observer)
│   │   │   └── webview.js              # Ponte de comunicação WebView2
│   │   ├── components/
│   │   │   ├── Toast.js                # Notificações toast
│   │   │   ├── Modal.js                # Modal de confirmação
│   │   │   ├── Pagination.js           # Paginação reutilizável
│   │   │   ├── Dropdown.js             # Dropdown animado
│   │   │   ├── OptionsManager.js       # CRUD de opções reutilizável
│   │   │   └── Theme.js                # Toggle tema/ocultar valores
│   │   ├── charts/
│   │   │   ├── PieChart.js             # Gráfico de rosca por categoria (SVG)
│   │   │   ├── DonutChart.js           # Gráfico de rosca por status (SVG)
│   │   │   └── LineChart.js            # Gráfico de linha (SVG)
│   │   └── sections/
│   │       ├── Navbar.js               # Navegação desktop/mobile
│   │       ├── FormTransacao.js        # Formulário de transação
│   │       ├── ResumoCartao.js         # Cards de resumo financeiro (mobile)
│   │       ├── TabelaMes.js            # Tabela do mês atual
│   │       ├── TabelaTransacoes.js     # Lista completa com busca
│   │       ├── CadastroOpcoes.js       # Gerenciamento de opções
│   │       └── Relatorios.js           # Dashboard com gráficos
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
| `ExcelDataServices.cs` | Camada de dados — CRUD nas 4 abas do Excel via COM Interop |
| `ThisWorkbook.cs` | Inicialização do add-in — cria botão no Actions Pane e abre o formulário |
| `produtos_crud.cs` | Formulário WinForms — hospeda o WebView2 e gerencia comunicação bidirecional |
| `frontend/index.html` | Interface SPA — entry point da aplicação web |
| `frontend/main.js` | Bootstrap — carrega módulos e inicializa a aplicação |
| `frontend/style.css` | Estilos customizados — glassmorphism, animações, dark mode |
| `frontend/services/state.js` | Gerenciamento de estado central com padrão Observer |
| `frontend/services/webview.js` | Ponte de comunicação com o backend C# via postMessage |
| `frontend/components/Theme.js` | Gerenciamento de tema Dark/Light e ocultar valores |
| `frontend/components/OptionsManager.js` | Componente reutilizável para CRUD de opções |
| `frontend/charts/PieChart.js` | Gráfico de rosca SVG para despesas por categoria com legenda interativa |
| `frontend/charts/DonutChart.js` | Gráfico de rosca SVG para distribuição por status com legenda interativa |
| `frontend/charts/LineChart.js` | Gráfico de linha SVG com gradientes e animação |
| `frontend/sections/FormTransacao.js` | Formulário de cadastro/edição de transações |
| `frontend/sections/ResumoCartao.js` | Cards de resumo financeiro — pagamentos da semana, transações pagas e a pagar no mês (mobile) |
| `frontend/sections/Relatorios.js` | Dashboard com cards de resumo e gráficos |
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
| Frontend | JavaScript Vanilla (ES6+ Modules) | — |
| State Management | Observer Pattern (pub/sub) | — |
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
   - **Cadastrar Opções** — Gerenciar categorias, bancos e métodos de pagamento
   - **Relatórios** — Dashboard com gráficos e resumos

---

## Notas Técnicas

- **Persistência em Excel** — Todas as abas ("Transacoes", "Categorias", "Bancos", "MetodosPagamento") são criadas dinamicamente no arquivo `.xlsx`
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

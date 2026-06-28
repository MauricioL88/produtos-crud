[Setup]
AppId={{BAA0C2D2-18E2-41B9-852F-F413020CAA33}
AppName=Controle Financeiro
AppVersion=1.0.0
AppPublisher=mLabs
AppPublisherURL=https://github.com/mLabs
DefaultDirName={autopf}\Controle Financeiro
DefaultGroupName=Controle Financeiro
OutputDir=Output
OutputBaseFilename=Controle_Financeiro_Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesAllowed=x86compatible x64compatible arm64
ArchitecturesInstallIn64BitMode=x64compatible arm64

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Files]
; Arquivos principais
Source: "bin\Debug\Produtos_Crud.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\Debug\Produtos_Crud.vsto"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\Debug\Produtos_Crud.dll.manifest"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\Debug\Produtos_Crud.xlsx"; DestDir: "{app}"; Flags: ignoreversion

; DLLs VSTO
Source: "bin\Debug\Microsoft.Office.Tools.Common.v4.0.Utilities.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\Debug\Microsoft.Office.Tools.Excel.v4.0.Utilities.dll"; DestDir: "{app}"; Flags: ignoreversion

; DLLs WebView2
Source: "bin\Debug\Microsoft.Web.WebView2.Core.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\Debug\Microsoft.Web.WebView2.WinForms.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\Debug\Microsoft.Web.WebView2.Wpf.dll"; DestDir: "{app}"; Flags: ignoreversion

; Frontend
Source: "bin\Debug\frontend\index.html"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "bin\Debug\frontend\main.js"; DestDir: "{app}\frontend"; Flags: ignoreversion
Source: "bin\Debug\frontend\style.css"; DestDir: "{app}\frontend"; Flags: ignoreversion

; Runtimes nativos
Source: "bin\Debug\runtimes\win-arm64\native\WebView2Loader.dll"; DestDir: "{app}\runtimes\win-arm64\native"; Flags: ignoreversion
Source: "bin\Debug\runtimes\win-x64\native\WebView2Loader.dll"; DestDir: "{app}\runtimes\win-x64\native"; Flags: ignoreversion
Source: "bin\Debug\runtimes\win-x86\native\WebView2Loader.dll"; DestDir: "{app}\runtimes\win-x86\native"; Flags: ignoreversion

[Registry]
; Registrar add-in VSTO no Excel (per-user)
Root: HKCU; Subkey: "Software\Microsoft\Office\Excel\Addins\Produtos_Crud"; ValueType: string; ValueName: "Description"; ValueData: "Sistema de Controle Financeiro Pessoal com persistência em Excel"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Microsoft\Office\Excel\Addins\Produtos_Crud"; ValueType: string; ValueName: "FriendlyName"; ValueData: "Controle Financeiro"
Root: HKCU; Subkey: "Software\Microsoft\Office\Excel\Addins\Produtos_Crud"; ValueType: string; ValueName: "Manifest"; ValueData: """{app}\Produtos_Crud.vsto|vstolocal"""
Root: HKCU; Subkey: "Software\Microsoft\Office\Excel\Addins\Produtos_Crud"; ValueType: dword; ValueName: "LoadBehavior"; ValueData: 3

[Icons]
Name: "{group}\Abrir Controle Financeiro"; Filename: "{app}\Produtos_Crud.xlsx"
Name: "{group}\Desinstalar Controle Financeiro"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Controle Financeiro"; Filename: "{app}\Produtos_Crud.xlsx"; Tasks: desktopicon; Parameters: ""

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na Área de Trabalho"; GroupDescription: "Opções adicionais:"; Flags: unchecked

[Run]
Filename: "{app}\Produtos_Crud.xlsx"; Description: "Abrir Controle Financeiro agora"; Flags: postinstall nowait skipifsilent shellexec

[Code]
// Verificar se Excel está aberto
function IsExcelRunning: Boolean;
var
  Wb: Variant;
begin
  Result := False;
  try
    Wb := CreateOleObject('Excel.Application');
    Result := True;
    Wb.Quit;
  except
    Result := False;
  end;
end;

function InitializeSetup: Boolean;
begin
  Result := True;
  if IsExcelRunning then
  begin
    if MsgBox('O Microsoft Excel está aberto. É necessário fechar o Excel para instalar o Controle Financeiro.'#13#10#13#10'Deseja continuar a instalação?', mbConfirmation, MB_YESNO) = IDNO then
      Result := False;
  end;
end;

<#
.SYNOPSIS
    Livre le jeu (build Angular + back PHP) dans /ohrm.fr/sv.

.DESCRIPTION
    Le front et le back se deversent au MEME endroit : le contenu de
    front/dist/sv-enigma/browser et celui de back/ fusionnent a la racine de
    /ohrm.fr/sv. Le repertoire back/ du depot ne monte pas tel quel.

    index.html part en dernier, apres les bundles qu'il reference, et rien
    n'est supprime a distance : un transfert interrompu laisse alors la
    version precedente fonctionnelle.

.PARAMETER DryRun
    Affiche le plan (local -> distant) sans se connecter.

.PARAMETER BackOnly
    Ne livre que le back (pas de build Angular).

.PARAMETER IncludeConfig
    Envoie aussi php/config.php, qui n'est pas versionne et diverge entre le
    poste et le serveur. A n'utiliser que volontairement.

.PARAMETER IncludeDiagnostic
    Envoie diagnostic-base.php, a supprimer du serveur ensuite.

.EXAMPLE
    .\tools\deploy.ps1 -DryRun
    .\tools\deploy.ps1
    .\tools\deploy.ps1 -BackOnly -IncludeDiagnostic
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$BackOnly,
    [switch]$IncludeConfig,
    [switch]$IncludeDiagnostic,
    [switch]$TestConnection
)

$ErrorActionPreference = 'Stop'

$racine = Split-Path -Parent $PSScriptRoot

# Repertoire distant propre a ce projet : la racine web du jeu.
$repertoireDistant = '/ohrm.fr/sv'

$dossierBack  = Join-Path $racine 'back'
$dossierFront = Join-Path $racine 'front'
$dossierBuild = Join-Path $dossierFront 'dist\sv-enigma\browser'

# --- Build -------------------------------------------------------------------

if (-not $BackOnly) {
    Write-Host "Build de production..." -ForegroundColor Cyan
    if (-not $DryRun) {
        Push-Location $dossierFront
        try {
            & npm run build
            if ($LASTEXITCODE -ne 0) { throw "Le build a echoue : livraison annulee." }
        } finally {
            Pop-Location
        }
    }
    if (-not (Test-Path $dossierBuild)) {
        throw "Build introuvable : $dossierBuild"
    }
}

# --- Constitution de la liste ------------------------------------------------

# Chaque entree : chemin local -> chemin distant relatif a $repertoireDistant.
$aLivrer = [System.Collections.ArrayList]::new()

function Add-Fichier($local, $distant) {
    [void]$aLivrer.Add([pscustomobject]@{ Local = $local; Distant = $distant })
}

# Le back : tout sauf ce qui ne doit pas monter. Les exclusions sont des
# chemins relatifs a back/, pas des noms de fichiers : php/config.php porte
# les identifiants du serveur et ne doit jamais etre ecrase par celui du poste.
$exclusions = @('migrations', 'php/config.sample.php')
if (-not $IncludeConfig)     { $exclusions += 'php/config.php' }
if (-not $IncludeDiagnostic) { $exclusions += 'diagnostic-base.php' }

Get-ChildItem -Path $dossierBack -Recurse -File -Force | ForEach-Object {
    $relatif = $_.FullName.Substring($dossierBack.Length + 1).Replace('\', '/')
    foreach ($exclu in $exclusions) {
        if ($relatif -eq $exclu -or $relatif -like "$exclu/*") { return }
    }
    Add-Fichier $_.FullName $relatif
}

# Le front : les bundles d'abord, index.html en dernier.
if (-not $BackOnly) {
    $indexLocal = $null
    Get-ChildItem -Path $dossierBuild -Recurse -File | ForEach-Object {
        $relatif = $_.FullName.Substring($dossierBuild.Length + 1).Replace('\', '/')
        if ($relatif -eq 'index.html') { $script:indexLocal = $_.FullName; return }
        Add-Fichier $_.FullName $relatif
    }
    if ($indexLocal) { Add-Fichier $indexLocal 'index.html' }
}

# --- Plan --------------------------------------------------------------------

Write-Host ""
Write-Host "Cible : $repertoireDistant" -ForegroundColor Cyan
Write-Host "$($aLivrer.Count) fichier(s)" -ForegroundColor Cyan
Write-Host ""
foreach ($f in $aLivrer) {
    Write-Host ("  {0,-52} -> {1}" -f $f.Distant, "$repertoireDistant/$($f.Distant)")
}
Write-Host ""

if ($DryRun) {
    Write-Host "-DryRun : rien n'a ete transfere." -ForegroundColor Yellow
    return
}

# --- Transfert ---------------------------------------------------------------

# Charge ici, et non en tete : -DryRun reste utilisable sans couche FTPS ni
# identifiants. Le dot-source doit rester au niveau du script, pas dans une
# fonction, sinon les definitions ne sortent pas de sa portee.
$coucheFtps = Join-Path $PSScriptRoot 'ftps.ps1'
if (-not (Test-Path $coucheFtps)) {
    throw "tools\ftps.ps1 est absent : le recopier depuis un projet deja configure (celui de bank en est le surensemble)."
}
. $coucheFtps

$cfg = Get-DeployConfig

if ($TestConnection) {
    Test-FtpsConnection -cfg $cfg
    return
}

$envoyes = 0
$echecs  = @()

foreach ($f in $aLivrer) {
    $destination = "$repertoireDistant/$($f.Distant)"
    Write-Host ("  {0}" -f $f.Distant) -NoNewline
    try {
        Send-RemoteFile -cfg $cfg -Local $f.Local -Distant $destination
        Write-Host "  ok" -ForegroundColor Green
        $envoyes++
    } catch {
        Write-Host "  ECHEC" -ForegroundColor Red
        $echecs += "$($f.Distant) : $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "$envoyes fichier(s) livre(s)." -ForegroundColor Green
if ($echecs.Count) {
    Write-Host "$($echecs.Count) echec(s) :" -ForegroundColor Red
    $echecs | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    exit 1
}

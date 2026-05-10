# ============================================================
# GENERATE VOICEOVER — ElevenLabs API → MP3
# ============================================================
# Renders the full SSML script for "Why Most Investors Fail"
# through ElevenLabs and saves it to 04_Voiceover\VO_full.mp3
#
# PREREQUISITES:
#   1. Get an API key: https://elevenlabs.io  -> Profile -> API Keys
#   2. Pick a Voice ID: https://elevenlabs.io/app/voice-library
#      (e.g. Adam = "pNInz6obpgDQGcFmaJgB")
#   3. Make sure 06_Documents\01_FULL_VIDEO_PACKAGE.md exists
#      (run download_assets.ps1 first if not).
#
# HOW TO RUN (Windows PowerShell):
#   cd "C:\video project API\Finance Youtube"
#   $env:ELEVENLABS_API_KEY = "sk_your_real_key_here"
#   .\generate_voiceover.ps1 -VoiceId "pNInz6obpgDQGcFmaJgB"
#
# OPTIONAL FLAGS:
#   -OutFile      custom output path (default 04_Voiceover\VO_full.mp3)
#   -Model        ElevenLabs model id (default eleven_multilingual_v2)
#   -Stability    0.0-1.0 (default 0.45)
#   -Similarity   0.0-1.0 (default 0.75)
#   -Style        0.0-1.0 (default 0.50)
#   -SpeakerBoost switch  (default ON)
# ============================================================

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$VoiceId,

    [string]$Root        = "C:\video project API\Finance Youtube",
    [string]$ScriptFile  = "06_Documents\01_FULL_VIDEO_PACKAGE.md",
    [string]$OutFile     = "04_Voiceover\VO_full.mp3",
    [string]$Model       = "eleven_multilingual_v2",
    [double]$Stability   = 0.45,
    [double]$Similarity  = 0.75,
    [double]$Style       = 0.50,
    [switch]$NoSpeakerBoost
)

$ErrorActionPreference = "Stop"

# ----- 1. CHECK API KEY -----
if (-not $env:ELEVENLABS_API_KEY -or $env:ELEVENLABS_API_KEY -eq "your-key-here") {
    Write-Host "ERROR: ELEVENLABS_API_KEY env var is not set." -ForegroundColor Red
    Write-Host 'Run this first:' -ForegroundColor Yellow
    Write-Host '  $env:ELEVENLABS_API_KEY = "sk_your_real_key_here"' -ForegroundColor Yellow
    exit 1
}

# ----- 2. LOCATE SCRIPT FILE -----
$scriptPath = Join-Path $Root $ScriptFile
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: Script file not found: $scriptPath" -ForegroundColor Red
    Write-Host "Run .\download_assets.ps1 first to fetch the documents." -ForegroundColor Yellow
    exit 1
}

# ----- 3. EXTRACT SSML BLOCK FROM MARKDOWN -----
Write-Host "Extracting SSML script from $ScriptFile..." -ForegroundColor Cyan
# Read bytes directly and decode as UTF-8 — PowerShell 5.1's default is
# Windows-1252, which would mis-decode em-dashes and smart quotes.
$rawBytes = [System.IO.File]::ReadAllBytes($scriptPath)
$content  = [System.Text.Encoding]::UTF8.GetString($rawBytes)
# Strip BOM if present
if ($content.Length -gt 0 -and $content[0] -eq [char]0xFEFF) {
    $content = $content.Substring(1)
}

# Match the fenced ```ssml ... ``` block
$match = [regex]::Match($content, '(?s)```ssml\s*(.*?)\s*```')
if (-not $match.Success) {
    Write-Host "ERROR: Could not find a ```ssml ... ``` block in $ScriptFile" -ForegroundColor Red
    exit 1
}
$ssmlText = $match.Groups[1].Value.Trim()
Write-Host "  Found SSML block: $($ssmlText.Length) characters" -ForegroundColor Green

# ----- 4. BUILD REQUEST -----
$outPath = Join-Path $Root $OutFile
$outDir  = Split-Path $outPath -Parent
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$useSpeakerBoost = -not $NoSpeakerBoost.IsPresent
$body = @{
    text     = $ssmlText
    model_id = $Model
    voice_settings = @{
        stability         = $Stability
        similarity_boost  = $Similarity
        style             = $Style
        use_speaker_boost = $useSpeakerBoost
    }
} | ConvertTo-Json -Depth 5

$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
$uri = "https://api.elevenlabs.io/v1/text-to-speech/$VoiceId"

Write-Host "`nCalling ElevenLabs API..." -ForegroundColor Cyan
Write-Host "  Voice ID:    $VoiceId"
Write-Host "  Model:       $Model"
Write-Host "  Stability:   $Stability"
Write-Host "  Similarity:  $Similarity"
Write-Host "  Style:       $Style"
Write-Host "  Boost:       $useSpeakerBoost"
Write-Host "  Output:      $outPath"
Write-Host "  (this can take 30-90 seconds for a 15-min script)" -ForegroundColor Yellow

# ----- 5. SEND REQUEST via .NET HttpClient -----
# Invoke-WebRequest in PS 5.1 corrupts non-ASCII bytes even when a byte[]
# body is passed. Using HttpClient with ByteArrayContent sends the bytes
# verbatim, which is what ElevenLabs needs to accept UTF-8 SSML.
Add-Type -AssemblyName System.Net.Http
$handler = New-Object System.Net.Http.HttpClientHandler
$client  = New-Object System.Net.Http.HttpClient($handler)
$client.Timeout = [TimeSpan]::FromSeconds(600)
$client.DefaultRequestHeaders.Add("xi-api-key", $env:ELEVENLABS_API_KEY)
$client.DefaultRequestHeaders.Accept.Add(
    [System.Net.Http.Headers.MediaTypeWithQualityHeaderValue]::new("audio/mpeg"))

$content = New-Object System.Net.Http.ByteArrayContent(,$bodyBytes)
$content.Headers.ContentType =
    [System.Net.Http.Headers.MediaTypeHeaderValue]::new("application/json")
$content.Headers.ContentType.CharSet = "utf-8"

try {
    $response = $client.PostAsync($uri, $content).GetAwaiter().GetResult()
    if (-not $response.IsSuccessStatusCode) {
        $errBody = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        Write-Host "`nERROR: API call failed." -ForegroundColor Red
        Write-Host ("Status: {0} {1}" -f [int]$response.StatusCode, $response.StatusCode) -ForegroundColor Red
        Write-Host $errBody -ForegroundColor Red
        exit 1
    }
    $audio = $response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
    [System.IO.File]::WriteAllBytes($outPath, $audio)
} catch {
    Write-Host "`nERROR: API call failed." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    $client.Dispose()
}

# ----- 6. DONE -----
$size = (Get-Item $outPath).Length / 1MB
Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "VOICEOVER GENERATED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ("File:  {0}" -f $outPath)
Write-Host ("Size:  {0:N2} MB" -f $size)
Write-Host ""
Write-Host "Next: import this MP3 into CapCut on the audio track."
